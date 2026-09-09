"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Price } from "@/components/ui/Price";
import { AddToCart } from "./AddToCart";
import { WishlistButton } from "./WishlistButton";
import { useLang } from "@/components/providers/LanguageProvider";
import { useUI } from "@/store/ui";
import { categoryLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function QuickViewModal() {
  const { t, lang } = useLang();
  const product = useUI((s) => s.quickView);
  const closeQuickView = useUI((s) => s.closeQuickView);
  const openCart = useUI((s) => s.openCart);

  const [activeImg, setActiveImg] = useState(0);

  // Reset the active image whenever a new product is opened.
  useEffect(() => {
    setActiveImg(0);
  }, [product?.id]);

  if (!product) return null;

  const name = lang === "ar" ? product.nameAr : product.nameFr;
  const desc = lang === "ar" ? product.descAr : product.descFr;

  return (
    <Modal open={!!product} onClose={closeQuickView} label={name} className="max-w-4xl">
      <div className="grid gap-0 md:grid-cols-2">
        {/* Gallery */}
        <div className="bg-sand p-6">
          <div className="aspect-[3/4] overflow-hidden bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[activeImg] ?? product.images[0]}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "h-16 w-14 overflow-hidden border transition-colors",
                    i === activeImg ? "border-ink" : "border-line"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div>
            <span className="eyebrow text-ink-soft">
              {categoryLabel(product.category, lang)}
            </span>
            <h2 className="mt-1 font-serif text-3xl leading-tight">{name}</h2>
            <Price amount={product.price} className="mt-2 block text-xl text-bronze" />
          </div>

          {desc && <p className="text-sm leading-relaxed text-ink-soft line-clamp-4">{desc}</p>}

          <AddToCart
            product={product}
            onAdded={() => {
              closeQuickView();
              openCart();
            }}
          />

          <div className="mt-1 flex items-center justify-between border-t border-line pt-4">
            <WishlistButton product={product} variant="full" />
            <Link
              href={`/product/${product.slug}`}
              onClick={closeQuickView}
              className="link-underline text-sm text-ink-soft hover:text-ink"
            >
              {t.product.viewDetails}
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
