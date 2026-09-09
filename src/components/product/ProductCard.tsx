"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Price } from "@/components/ui/Price";
import { WishlistButton } from "./WishlistButton";
import { useLang } from "@/components/providers/LanguageProvider";
import { useUI } from "@/store/ui";
import { categoryLabel, sortSizes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/types";

export function ProductCard({ product }: { product: ProductDTO }) {
  const { t, lang } = useLang();
  const openQuickView = useUI((s) => s.openQuickView);

  const name = lang === "ar" ? product.nameAr : product.nameFr;
  const primary = product.images[0] ?? "";
  const secondary = product.images[1] ?? primary;
  const outOfStock = product.stock <= 0;
  const sizes = sortSizes(product.sizes);

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-sand">
        <Link href={`/product/${product.slug}`} aria-label={name} className="block h-full w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primary}
            alt={name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-refined group-hover:opacity-0"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={secondary}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 ease-refined group-hover:scale-100 group-hover:opacity-100"
          />
        </Link>

        {/* Wishlist */}
        <div className="absolute end-3 top-3 z-10">
          <WishlistButton product={product} />
        </div>

        {/* Out of stock */}
        {outOfStock && (
          <span className="absolute start-3 top-3 z-10 bg-ink px-2.5 py-1 text-[10px] uppercase tracking-widest text-cream">
            {t.product.outOfStock}
          </span>
        )}

        {/* Quick view */}
        {!outOfStock && (
          <button
            type="button"
            onClick={() => openQuickView(product)}
            className="absolute inset-x-3 bottom-3 z-10 flex translate-y-3 items-center justify-center gap-2 bg-cream/95 py-2.5 text-sm font-medium text-ink opacity-0 backdrop-blur transition-all duration-300 ease-refined group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Eye className="h-4 w-4" />
            {t.product.quickView}
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="mt-3 flex flex-1 flex-col">
        <span className="eyebrow text-ink-soft">{categoryLabel(product.category, lang)}</span>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 font-serif text-lg leading-snug transition-colors hover:text-bronze"
        >
          {name}
        </Link>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <Price amount={product.price} className="text-base" />
          {sizes.length > 0 && (
            <span className="truncate text-xs text-ink-soft">
              {sizes.slice(0, 5).join(" · ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className={cn("aspect-[3/4] animate-pulse bg-sand")} />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-1/3 animate-pulse bg-sand" />
        <div className="h-4 w-2/3 animate-pulse bg-sand" />
        <div className="h-4 w-1/4 animate-pulse bg-sand" />
      </div>
    </div>
  );
}
