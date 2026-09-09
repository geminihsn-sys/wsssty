"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { useLang } from "@/components/providers/LanguageProvider";
import type { ProductDTO, WishlistItem } from "@/types";
import { cn } from "@/lib/utils";

export function toWishlistItem(p: ProductDTO): WishlistItem {
  return {
    productId: p.id,
    slug: p.slug,
    nameFr: p.nameFr,
    nameAr: p.nameAr,
    price: p.price,
    image: p.images[0] ?? "",
    category: p.category,
  };
}

export function WishlistButton({
  product,
  variant = "icon",
  className,
}: {
  product: ProductDTO;
  variant?: "icon" | "full";
  className?: string;
}) {
  const { t } = useLang();
  const toggle = useWishlist((s) => s.toggle);
  const items = useWishlist((s) => s.items);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const active = mounted && items.some((i) => i.productId === product.id);
  const label = active ? t.product.removeFromWishlist : t.product.addToWishlist;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(toWishlistItem(product))}
        aria-pressed={active}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-[2px] border px-5 text-sm font-medium transition-colors",
          active
            ? "border-ink bg-ink text-cream"
            : "border-line text-ink hover:border-ink",
          className
        )}
      >
        <Heart className={cn("h-4 w-4", active && "fill-current")} />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(toWishlistItem(product))}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-cream",
        className
      )}
    >
      <Heart className={cn("h-4 w-4 transition-colors", active && "fill-danger text-danger")} />
    </button>
  );
}
