import "server-only";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serialize";
import { ORDER_STATUS_VALUES, type OrderStatus } from "@/lib/constants";
import type { AnalyticsData, TopProduct, TrendPoint } from "@/types";

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Compute the full admin analytics payload from the orders table. */
export async function getAnalytics(): Promise<AnalyticsData> {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const statusCounts = Object.fromEntries(
    ORDER_STATUS_VALUES.map((s) => [s, 0])
  ) as Record<OrderStatus, number>;

  let revenue = 0;
  let delivered = 0;

  for (const o of orders) {
    const status = o.status as OrderStatus;
    if (statusCounts[status] != null) statusCounts[status] += 1;
    if (status === "delivered") {
      revenue += o.total;
      delivered += 1;
    }
  }

  const pending = statusCounts.pending ?? 0;
  const totalOrders = orders.length;
  const avgOrder = delivered > 0 ? Math.round(revenue / delivered) : 0;

  // --- 30-day sales trend (excludes cancelled orders) ---
  const days = 30;
  const trendMap = new Map<string, TrendPoint>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = isoDay(d);
    trendMap.set(key, { date: key, total: 0, orders: 0 });
  }
  for (const o of orders) {
    if ((o.status as OrderStatus) === "cancelled") continue;
    const key = isoDay(new Date(o.createdAt));
    const point = trendMap.get(key);
    if (point) {
      point.total += o.total;
      point.orders += 1;
    }
  }
  const salesTrend = [...trendMap.values()];

  // --- Top products (units sold across non-cancelled orders) ---
  const topMap = new Map<string, TopProduct>();
  for (const o of orders) {
    if ((o.status as OrderStatus) === "cancelled") continue;
    for (const it of o.items) {
      const entry =
        topMap.get(it.productId) ??
        { productId: it.productId, nameFr: it.nameFr, nameAr: it.nameAr, units: 0, revenue: 0 };
      entry.units += it.quantity;
      entry.revenue += it.price * it.quantity;
      topMap.set(it.productId, entry);
    }
  }
  const topProducts = [...topMap.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, 6);

  const recentOrders = orders.slice(0, 6).map(serializeOrder);

  return {
    revenue,
    totalOrders,
    pending,
    delivered,
    avgOrder,
    statusCounts,
    salesTrend,
    topProducts,
    recentOrders,
  };
}
