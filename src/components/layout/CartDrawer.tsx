"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { buttonVariants } from "@/components/ui/Button";
import { useLang } from "@/components/providers/LanguageProvider";
import { useUI } from "@/store/ui";
import { cartLineKey, selectCartSubtotal, useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { t, lang, dir } = useLang();
  const { cartOpen, closeCart } = useUI();
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const setQuantity = useCart((s) => s.setQuantity);
  const subtotal = useCart(selectCartSubtotal);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasItems = mounted && items.length > 0;

  return (
    <Drawer
      open={cartOpen}
      onClose={closeCart}
      side={dir === "rtl" ? "left" : "right"}
      title={t.cart.title}
      footer={
        hasItems ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-base">
              <span className="text-ink-soft">{t.cart.subtotal}</span>
              <Price amount={subtotal} className="font-serif text-xl" />
            </div>
            <p className="text-xs text-ink-soft">{t.cart.shippingNote}</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className={cn(buttonVariants("primary", "lg"), "w-full")}
            >
              {t.cart.checkout}
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center text-sm text-ink-soft underline-offset-4 hover:underline"
            >
              {t.cart.continue}
            </button>
          </div>
        ) : undefined
      }
    >
      {!hasItems ? (
        <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
          <p className="text-ink-soft">{t.cart.empty}</p>
          <Link
            href="/shop"
            onClick={closeCart}
            className={buttonVariants("outline", "md")}
          >
            {t.cart.emptyCta}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => {
            const key = cartLineKey(item);
            return (
              <li key={key} className="flex gap-4 py-4 first:pt-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={lang === "ar" ? item.nameAr : item.nameFr}
                  className="h-24 w-20 shrink-0 border border-line object-cover"
                  loading="lazy"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="font-serif text-lg leading-tight hover:text-bronze"
                      >
                        {lang === "ar" ? item.nameAr : item.nameFr}
                      </Link>
                      <button
                        aria-label={t.cart.remove}
                        onClick={() => removeItem(key)}
                        className="text-ink-soft transition-colors hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {t.product.size}: {item.size}
                      {item.color ? ` · ${item.color}` : ""}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(q) => setQuantity(key, q)}
                      max={item.maxStock}
                      size="sm"
                    />
                    <Price amount={item.price * item.quantity} className="text-sm font-medium" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
