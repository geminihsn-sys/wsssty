"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Home, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/inputs";
import { Price } from "@/components/ui/Price";
import { useLang } from "@/components/providers/LanguageProvider";
import { useCart, cartLineKey } from "@/store/cart";
import { WILAYAS, wilayaLabel } from "@/lib/wilayas";
import { DELIVERY_OPTIONS, SHIPPING_FEES, type DeliveryType } from "@/lib/constants";
import { computeTotals } from "@/lib/shipping";
import { validateCheckout } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { CheckoutPayload } from "@/types";

const ERROR_KEYS: Record<string, keyof ReturnType<typeof useLang>["t"]["checkout"]> = {
  name_required: "errName",
  invalid_phone: "errPhone",
  wilaya_required: "errWilaya",
  delivery_required: "errDelivery",
  address_required: "errAddress",
  cart_empty: "errCart",
};

export default function CheckoutPage() {
  const { t, lang, dir } = useLang();
  const router = useRouter();

  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilayaCode, setWilayaCode] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(
    () => computeTotals(items, deliveryType),
    [items, deliveryType]
  );

  function fieldError(field: string): string | undefined {
    const code = errors[field];
    if (!code) return undefined;
    const key = ERROR_KEYS[code];
    return key ? t.checkout[key] : t.checkout.errGeneric;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError(null);

    const payload: CheckoutPayload = {
      fullName,
      phone,
      wilayaCode: Number(wilayaCode),
      deliveryType,
      address: deliveryType === "home" ? address : address || undefined,
      notes: notes || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      })),
    };

    // Client-side validation mirrors the server contract.
    const check = validateCheckout(payload);
    if (!check.ok) {
      setErrors(check.fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        else setGeneralError(t.checkout.errGeneric);
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/order/${data.reference}`);
    } catch {
      setGeneralError(t.checkout.errGeneric);
      setSubmitting(false);
    }
  }

  if (!mounted) {
    return <div className="container-content py-24" aria-busy />;
  }

  if (items.length === 0) {
    return (
      <div className="container-content flex flex-col items-center justify-center gap-5 py-24 text-center">
        <h1 className="font-serif text-display-md">{t.checkout.title}</h1>
        <p className="text-ink-soft">{t.cart.empty}</p>
        <Link href="/shop" className="text-sm underline underline-offset-4">
          {t.cart.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-content py-12">
      <div className="mb-8">
        <h1 className="font-serif text-display-md leading-tight">{t.checkout.title}</h1>
        <p className="mt-2 font-arabic text-ink-soft">{t.checkout.subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* ---------------------------------------------------------- Fields */}
        <div className="space-y-10">
          {/* Contact */}
          <section>
            <h2 className="eyebrow mb-4 text-ink">{t.checkout.contactSection}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t.checkout.fullName} htmlFor="fullName" error={fieldError("fullName")} required className="sm:col-span-2">
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.checkout.fullNamePlaceholder}
                  invalid={!!fieldError("fullName")}
                  autoComplete="name"
                />
              </Field>
              <Field label={t.checkout.phone} htmlFor="phone" error={fieldError("phone")} required>
                <Input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.checkout.phonePlaceholder}
                  invalid={!!fieldError("phone")}
                  autoComplete="tel"
                />
              </Field>
              <Field label={t.checkout.wilaya} htmlFor="wilaya" error={fieldError("wilayaCode")} required>
                <Select
                  id="wilaya"
                  value={wilayaCode}
                  onChange={(e) => setWilayaCode(e.target.value)}
                  invalid={!!fieldError("wilayaCode")}
                >
                  <option value="">{t.checkout.selectWilaya}</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {wilayaLabel(w.code, lang)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          {/* Delivery */}
          <section>
            <h2 className="eyebrow mb-4 text-ink">{t.checkout.deliverySection}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {DELIVERY_OPTIONS.map((opt) => {
                const selected = deliveryType === opt.value;
                const Icon = opt.value === "home" ? Home : Building2;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDeliveryType(opt.value)}
                    className={cn(
                      "flex items-start gap-3 rounded-[2px] border p-4 text-start transition-colors",
                      selected ? "border-ink bg-sand" : "border-line hover:border-ink"
                    )}
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-bronze" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">
                        {opt.value === "home" ? t.checkout.home : t.checkout.stopdesk}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-soft">
                        {opt.value === "home" ? t.checkout.homeDesc : t.checkout.stopdeskDesc}
                      </span>
                      <Price amount={SHIPPING_FEES[opt.value]} className="mt-1.5 block text-sm text-ink" />
                    </span>
                    <span
                      className={cn(
                        "mt-1 h-4 w-4 shrink-0 rounded-full border",
                        selected ? "border-4 border-ink" : "border-line"
                      )}
                    />
                  </button>
                );
              })}
            </div>

            {deliveryType === "home" && (
              <Field
                label={t.checkout.address}
                htmlFor="address"
                error={fieldError("address")}
                hint={t.checkout.addressHint}
                required
                className="mt-5"
              >
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.checkout.addressPlaceholder}
                  invalid={!!fieldError("address")}
                  rows={2}
                />
              </Field>
            )}

            <Field label={t.checkout.notes} htmlFor="notes" className="mt-5">
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.checkout.notesPlaceholder}
                rows={2}
              />
            </Field>
          </section>
        </div>

        {/* --------------------------------------------------------- Summary */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-line bg-offwhite p-6">
            <h2 className="font-serif text-xl">{t.checkout.summary}</h2>

            <ul className="mt-5 space-y-4">
              {items.map((item) => (
                <li key={cartLineKey(item)} className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt=""
                    className="h-16 w-14 shrink-0 border border-line object-cover"
                  />
                  <div className="flex flex-1 flex-col justify-center">
                    <span className="text-sm leading-tight">
                      {lang === "ar" ? item.nameAr : item.nameFr}
                    </span>
                    <span className="mt-0.5 text-xs text-ink-soft">
                      {item.size}
                      {item.color ? ` · ${item.color}` : ""} × {item.quantity}
                    </span>
                  </div>
                  <Price amount={item.price * item.quantity} className="text-sm" />
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-soft">{t.checkout.subtotal}</dt>
                <Price amount={totals.subtotal} />
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-soft">{t.checkout.shipping}</dt>
                <Price amount={totals.shipping} />
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3 text-base font-medium">
                <dt>{t.checkout.total}</dt>
                <Price amount={totals.total} className="font-serif text-lg" />
              </div>
            </dl>

            <div className="mt-5 flex items-start gap-2 rounded-[2px] bg-sand p-3 text-xs text-ink-soft">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>{t.checkout.secure}</span>
            </div>

            {generalError && (
              <p className="mt-4 text-sm text-danger" role="alert">
                {generalError}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
              {submitting ? t.checkout.placing : t.checkout.placeOrder}
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
