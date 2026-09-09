"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X, ShoppingBag } from "lucide-react";
import { Price } from "@/components/ui/Price";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useLang } from "@/components/providers/LanguageProvider";
import { useWishlist } from "@/store/wishlist";
import { categoryLabel } from "@/lib/constants";

export default function WishlistPage() {
  const { t, lang } = useLang();
  const router = useRouter();
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="container-content py-24" aria-busy />;
  }

  return (
    <div className="container-content py-12">
      <h1 className="font-serif text-display-md leading-tight">{t.wishlist.title}</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
          <p className="text-ink-soft">{t.wishlist.empty}</p>
          <Link href="/shop" className={buttonVariants("outline", "md")}>
            {t.wishlist.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const name = lang === "ar" ? item.nameAr : item.nameFr;
            return (
              <div key={item.productId} className="group flex flex-col">
                <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                  <Link href={`/product/${item.slug}`} aria-label={name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-refined group-hover:scale-105"
                    />
                  </Link>
                  <button
                    onClick={() => remove(item.productId)}
                    aria-label={t.wishlist.remove}
                    className="absolute end-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-cream hover:text-danger"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-1 flex-col">
                  <span className="eyebrow text-ink-soft">
                    {categoryLabel(item.category, lang)}
                  </span>
                  <Link
                    href={`/product/${item.slug}`}
                    className="mt-1 font-serif text-lg leading-snug transition-colors hover:text-bronze"
                  >
                    {name}
                  </Link>
                  <Price amount={item.price} className="mt-1 text-base" />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push(`/product/${item.slug}`)}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {t.wishlist.moveToCart}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
