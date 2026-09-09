import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Phone, MapPin, Package } from "lucide-react";
import { getServerDict } from "@/lib/i18n/server";
import { getOrderByReference } from "@/lib/orders";
import { wilayaLabel } from "@/lib/wilayas";
import { Price } from "@/components/ui/Price";
import { buttonVariants } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { reference: string };
}) {
  const { lang, t } = getServerDict();
  const order = await getOrderByReference(params.reference);
  if (!order) notFound();

  const deliveryLabel =
    order.deliveryType === "home" ? t.checkout.home : t.checkout.stopdesk;

  return (
    <div className="container-content max-w-3xl py-16">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-serif text-display-md leading-tight">{t.confirmation.title}</h1>
        <p className="mt-3 text-lg text-ink">{t.confirmation.thankYou}</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
          {t.confirmation.intro}
        </p>
      </div>

      {/* Reference */}
      <div className="mt-10 flex flex-col items-center justify-between gap-3 border border-ink bg-sand px-6 py-5 sm:flex-row">
        <span className="text-sm text-ink-soft">{t.confirmation.reference}</span>
        <span className="font-serif text-2xl tracking-widest">{order.reference}</span>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Delivery */}
        <div className="border border-line p-6">
          <h2 className="eyebrow mb-4 text-ink">{t.confirmation.deliveryTo}</h2>
          <p className="font-medium">{order.fullName}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft" dir="ltr">
            <Phone className="h-4 w-4" />
            <span>{order.phone}</span>
          </p>
          <p className="mt-2 flex items-start gap-2 text-sm text-ink-soft">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {wilayaLabel(order.wilayaCode, lang)}
              {order.address ? ` — ${order.address}` : ""}
            </span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
            <Package className="h-4 w-4" />
            <span>{deliveryLabel}</span>
          </p>
        </div>

        {/* Totals */}
        <div className="border border-line p-6">
          <h2 className="eyebrow mb-4 text-ink">{t.confirmation.summary}</h2>
          <ul className="space-y-3">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-soft">
                  {lang === "ar" ? it.nameAr : it.nameFr}
                  <span className="text-ink-soft/70">
                    {" "}
                    · {it.size}
                    {it.color ? ` · ${it.color}` : ""} × {it.quantity}
                  </span>
                </span>
                <Price amount={it.price * it.quantity} className="shrink-0" />
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.checkout.subtotal}</dt>
              <Price amount={order.subtotal} />
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">{t.checkout.shipping}</dt>
              <Price amount={order.shipping} />
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-medium">
              <dt>{t.confirmation.total}</dt>
              <Price amount={order.total} className="font-serif text-lg" />
            </div>
          </dl>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-ink-soft">{t.confirmation.trackNote}</p>

      <div className="mt-6 flex justify-center">
        <Link href="/shop" className={buttonVariants("primary", "lg")}>
          {t.confirmation.backToShop}
        </Link>
      </div>
    </div>
  );
}
