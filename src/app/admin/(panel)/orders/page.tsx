import { getServerDict } from "@/lib/i18n/server";
import { getOrders } from "@/lib/orders";
import { OrdersTable } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { t } = getServerDict();
  const orders = await getOrders();

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-3xl">{t.admin.orders.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {t.shop.results(orders.length)}
        </p>
      </header>
      <OrdersTable initialOrders={orders} />
    </div>
  );
}
