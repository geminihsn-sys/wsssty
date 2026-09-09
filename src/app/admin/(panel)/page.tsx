import Link from "next/link";
import { Wallet, ShoppingBag, Clock, PackageCheck, ArrowRight } from "lucide-react";
import { getServerDict } from "@/lib/i18n/server";
import { getAnalytics } from "@/lib/analytics";
import { Price } from "@/components/ui/Price";
import { SalesChart } from "@/components/admin/SalesChart";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { lang, t } = getServerDict();
  const a = await getAnalytics();

  const stats = [
    { label: t.admin.dashboard.revenue, hint: t.admin.dashboard.revenueHint, value: <Price amount={a.revenue} />, Icon: Wallet },
    { label: t.admin.dashboard.totalOrders, value: a.totalOrders, Icon: ShoppingBag },
    { label: t.admin.dashboard.pending, value: a.pending, Icon: Clock },
    { label: t.admin.dashboard.delivered, value: a.delivered, Icon: PackageCheck },
  ];

  const hasData = a.totalOrders > 0;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-3xl">{t.admin.dashboard.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t.admin.dashboard.subtitle}</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-line bg-offwhite p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-ink-soft">{s.label}</span>
              <s.Icon className="h-4 w-4 text-bronze" />
            </div>
            <div className="mt-3 font-serif text-2xl">{s.value}</div>
            {s.hint && <p className="mt-1 text-[0.7rem] text-ink-soft">{s.hint}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Sales trend */}
        <div className="border border-line bg-offwhite p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium">{t.admin.dashboard.salesTrend}</h2>
            <span className="text-sm text-ink-soft">
              {t.admin.dashboard.avgOrder}: <Price amount={a.avgOrder} className="text-ink" />
            </span>
          </div>
          {hasData ? (
            <SalesChart data={a.salesTrend} />
          ) : (
            <p className="py-16 text-center text-sm text-ink-soft">{t.admin.dashboard.noData}</p>
          )}
        </div>

        {/* Top products */}
        <div className="border border-line bg-offwhite p-5">
          <h2 className="mb-4 font-medium">{t.admin.dashboard.topProducts}</h2>
          {a.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-soft">{t.admin.dashboard.noData}</p>
          ) : (
            <ol className="space-y-3">
              {a.topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3">
                  <span className="w-5 text-sm tabular-nums text-ink-soft">{i + 1}</span>
                  <span className="flex-1 truncate text-sm">
                    {lang === "ar" ? p.nameAr : p.nameFr}
                  </span>
                  <span className="text-xs text-ink-soft">
                    {p.units} {t.admin.dashboard.unitsSold}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-6 border border-line bg-offwhite">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-medium">{t.admin.dashboard.recentOrders}</h2>
          <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink">
            {t.admin.dashboard.viewAll}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
        {a.recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-ink-soft">{t.admin.dashboard.noData}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-start text-xs uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3 text-start font-medium">{t.admin.orders.reference}</th>
                  <th className="px-5 py-3 text-start font-medium">{t.admin.orders.customer}</th>
                  <th className="px-5 py-3 text-start font-medium">{t.admin.orders.total}</th>
                  <th className="px-5 py-3 text-start font-medium">{t.admin.orders.status}</th>
                  <th className="px-5 py-3 text-start font-medium">{t.admin.orders.date}</th>
                </tr>
              </thead>
              <tbody>
                {a.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-line/60 last:border-0">
                    <td className="px-5 py-3 font-medium">{o.reference}</td>
                    <td className="px-5 py-3">{o.fullName}</td>
                    <td className="px-5 py-3"><Price amount={o.total} /></td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-ink-soft">{formatDate(o.createdAt, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
