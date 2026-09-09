import "server-only";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/serialize";
import { computeTotals } from "@/lib/shipping";
import { validateCheckout, normalizePhone } from "@/lib/validation";
import { wilayaByCode } from "@/lib/wilayas";
import type { CheckoutPayload, OrderDTO } from "@/types";
import { ORDER_STATUS_VALUES, type OrderStatus } from "@/lib/constants";

/** Thrown when an order cannot be created; carries field-level error codes. */
export class OrderError extends Error {
  fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>, message = "invalid_order") {
    super(message);
    this.name = "OrderError";
    this.fieldErrors = fieldErrors;
  }
}

// Unambiguous alphabet (no O/0, I/1) for human-friendly references.
const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomReference(): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return `WS-${s}`;
}

async function uniqueReference(): Promise<string> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const ref = randomReference();
    const existing = await prisma.order.findUnique({ where: { reference: ref } });
    if (!existing) return ref;
  }
  // Extremely unlikely fallback.
  return `WS-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/**
 * Create an order from a checkout payload. Prices and product names are taken
 * from the database (never trusted from the client) and totals are recomputed
 * server-side. Throws {@link OrderError} on validation failure.
 */
export async function createOrder(payload: CheckoutPayload): Promise<OrderDTO> {
  const validation = validateCheckout(payload);
  if (!validation.ok) throw new OrderError(validation.fieldErrors);

  const wilaya = wilayaByCode(Number(payload.wilayaCode));
  if (!wilaya) throw new OrderError({ wilayaCode: "wilaya_required" });

  const ids = [...new Set(payload.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lineItems = payload.items
    .map((i) => {
      const product = byId.get(i.productId);
      if (!product) return null;
      const requested = Math.floor(Number(i.quantity)) || 1;
      const quantity = Math.max(1, requested);
      return {
        product,
        size: String(i.size || "Unique"),
        color: i.color ? String(i.color) : null,
        quantity,
        price: product.price,
      };
    })
    .filter((li): li is NonNullable<typeof li> => li !== null);

  if (lineItems.length === 0) throw new OrderError({ items: "cart_empty" });

  const totals = computeTotals(
    lineItems.map((li) => ({ price: li.price, quantity: li.quantity })),
    payload.deliveryType
  );

  const reference = await uniqueReference();
  const address =
    typeof payload.address === "string" && payload.address.trim()
      ? payload.address.trim()
      : null;

  const order = await prisma.order.create({
    data: {
      reference,
      fullName: payload.fullName.trim(),
      phone: normalizePhone(payload.phone),
      wilayaCode: wilaya.code,
      wilayaName: wilaya.fr,
      deliveryType: payload.deliveryType,
      address,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
      status: "pending",
      notes: payload.notes?.trim() || null,
      items: {
        create: lineItems.map((li) => ({
          productId: li.product.id,
          nameFr: li.product.nameFr,
          nameAr: li.product.nameAr,
          price: li.price,
          size: li.size,
          color: li.color,
          quantity: li.quantity,
        })),
      },
    },
    include: { items: true },
  });

  // Decrement stock without going negative (best-effort).
  await Promise.all(
    lineItems.map((li) =>
      prisma.product.update({
        where: { id: li.product.id },
        data: { stock: Math.max(0, li.product.stock - li.quantity) },
      })
    )
  );

  return serializeOrder(order);
}

export async function getOrderByReference(reference: string): Promise<OrderDTO | null> {
  const order = await prisma.order.findUnique({
    where: { reference },
    include: { items: true },
  });
  return order ? serializeOrder(order) : null;
}

export async function getOrderById(id: string): Promise<OrderDTO | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return order ? serializeOrder(order) : null;
}

export interface OrderFilter {
  status?: OrderStatus;
  q?: string;
}

export async function getOrders(filter: OrderFilter = {}): Promise<OrderDTO[]> {
  const where: Record<string, unknown> = {};
  if (filter.status && ORDER_STATUS_VALUES.includes(filter.status)) {
    where.status = filter.status;
  }
  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  let result = orders.map(serializeOrder);

  if (filter.q) {
    const needle = filter.q.trim().toLowerCase();
    if (needle) {
      result = result.filter((o) =>
        [o.reference, o.fullName, o.phone, o.wilayaName]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }
  }
  return result;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<OrderDTO | null> {
  if (!ORDER_STATUS_VALUES.includes(status)) {
    throw new OrderError({ status: "invalid_status" });
  }
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
  return serializeOrder(order);
}
