"use client";

import { useMemo, useState } from "react";
import { Search, Phone, MapPin, Package, Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/inputs";
import { Price } from "@/components/ui/Price";
import { StatusBadge } from "./StatusBadge";
import { useLang } from "@/components/providers/LanguageProvider";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import { wilayaLabel } from "@/lib/wilayas";
import { formatDateTime } from "@/lib/format";
import type { OrderDTO } from "@/types";

export function OrdersTable({ initialOrders }: { initialOrders: OrderDTO[] }) {
  const { t, lang } = useLang();
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [selected, setSelected] = useState<OrderDTO | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updated, setUpdated] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (!needle) return true;
      return [o.reference, o.fullName, o.phone, o.wilayaName]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [orders, query, status]);

  async function changeStatus(order: OrderDTO, next: OrderStatus) {
    setUpdating(true);
    setUpdated(false);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        const updatedOrder = { ...order, status: next };
        setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)));
        setSelected(updatedOrder);
        setUpdated(true);
      }
    } finally {
      setUpdating(false);
    }
  }

  const name = (o: OrderDTO) => o.fullName;

  return (
    <div>
      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.admin.orders.searchPlaceholder}
            className="ps-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
          className="sm:w-52"
          aria-label={t.admin.orders.filterStatus}
        >
          <option value="">{t.admin.orders.allStatuses}</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {lang === "ar" ? s.ar : s.fr}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-line bg-offwhite">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 text-start font-medium">{t.admin.orders.reference}</th>
              <th className="px-4 py-3 text-start font-medium">{t.admin.orders.customer}</th>
              <th className="hidden px-4 py-3 text-start font-medium md:table-cell">{t.admin.orders.wilaya}</th>
              <th className="px-4 py-3 text-start font-medium">{t.admin.orders.total}</th>
              <th className="px-4 py-3 text-start font-medium">{t.admin.orders.status}</th>
              <th className="hidden px-4 py-3 text-start font-medium lg:table-cell">{t.admin.orders.date}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-soft">
                  {t.admin.orders.noOrders}
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.id}
                  className="cursor-pointer border-b border-line/60 transition-colors last:border-0 hover:bg-sand/50"
                  onClick={() => {
                    setSelected(o);
                    setUpdated(false);
                  }}
                >
                  <td className="px-4 py-3 font-medium">{o.reference}</td>
                  <td className="px-4 py-3">
                    <span className="block">{name(o)}</span>
                    <span className="text-xs text-ink-soft" dir="ltr">{o.phone}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-soft md:table-cell">{o.wilayaName}</td>
                  <td className="px-4 py-3"><Price amount={o.total} /></td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="hidden px-4 py-3 text-ink-soft lg:table-cell">{formatDateTime(o.createdAt, lang)}</td>
                  <td className="px-4 py-3 text-end">
                    <Eye className="ms-auto h-4 w-4 text-ink-soft" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} label={t.admin.orders.details}>
        {selected && (
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 pe-8">
              <div>
                <span className="text-xs uppercase tracking-wide text-ink-soft">
                  {t.admin.orders.reference}
                </span>
                <h2 className="font-serif text-2xl">{selected.reference}</h2>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="eyebrow mb-3 text-ink">{t.admin.orders.customerInfo}</h3>
                <p className="font-medium">{selected.fullName}</p>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-ink-soft" dir="ltr">
                  <Phone className="h-4 w-4" /> {selected.phone}
                </p>
                <p className="mt-1.5 flex items-start gap-2 text-sm text-ink-soft">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    {wilayaLabel(selected.wilayaCode, lang)}
                    {selected.address ? ` — ${selected.address}` : ""}
                  </span>
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-ink-soft">
                  <Package className="h-4 w-4" />
                  {selected.deliveryType === "home" ? t.checkout.home : t.checkout.stopdesk}
                </p>
                {selected.notes && (
                  <p className="mt-3 rounded-[2px] bg-sand p-3 text-xs text-ink-soft">
                    <span className="font-medium">{t.admin.orders.notes}: </span>
                    {selected.notes}
                  </p>
                )}
              </div>

              <div>
                <h3 className="eyebrow mb-3 text-ink">{t.admin.orders.items}</h3>
                <ul className="space-y-2">
                  {selected.items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-2 text-sm">
                      <span className="text-ink-soft">
                        {lang === "ar" ? it.nameAr : it.nameFr}
                        <span className="text-ink-soft/70">
                          {" "}· {it.size}{it.color ? ` · ${it.color}` : ""} × {it.quantity}
                        </span>
                      </span>
                      <Price amount={it.price * it.quantity} className="shrink-0" />
                    </li>
                  ))}
                </ul>
                <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">{t.admin.orders.subtotal}</dt>
                    <Price amount={selected.subtotal} />
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">{t.admin.orders.shipping}</dt>
                    <Price amount={selected.shipping} />
                  </div>
                  <div className="flex justify-between font-medium">
                    <dt>{t.admin.orders.total}</dt>
                    <Price amount={selected.total} className="font-serif" />
                  </div>
                </dl>
              </div>
            </div>

            {/* Status change */}
            <div className="mt-6 border-t border-line pt-5">
              <label className="mb-2 block text-sm font-medium">{t.admin.orders.changeStatus}</label>
              <div className="flex items-center gap-3">
                <Select
                  value={selected.status}
                  disabled={updating}
                  onChange={(e) => changeStatus(selected, e.target.value as OrderStatus)}
                  className="sm:w-60"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {lang === "ar" ? s.ar : s.fr}
                    </option>
                  ))}
                </Select>
                {updated && <span className="text-sm text-success">{t.admin.orders.updated}</span>}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
