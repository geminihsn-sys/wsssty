"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";
import { useUI } from "@/store/ui";
import { useCart, selectCartCount } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { CATEGORIES } from "@/lib/constants";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

function CountBubble({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -end-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold leading-none text-cream">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const { t, lang } = useLang();
  const { openCart, openSearch } = useUI();
  const cartCount = useCart(selectCartCount);
  const wishlistCount = useWishlist((s) => s.items.length);
  const mounted = useMounted();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile menu on route change.
  useEffect(() => setMobileOpen(false), [pathname]);

  const name = (c: (typeof CATEGORIES)[number]) => (lang === "ar" ? c.ar : c.fr);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      {/* Announcement bar */}
      <div className="bg-ink text-cream">
        <p className="container-content py-2 text-center text-xs tracking-wide">
          {t.footer.codNote}
        </p>
      </div>

      <div className="container-content flex h-16 items-center justify-between gap-4 lg:h-20">
        {/* Left: mobile menu + logo */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden"
            aria-label={t.nav.menu}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-2xl font-semibold tracking-tight lg:text-3xl">
              {t.brand.name}
            </span>
            <span className="hidden text-[0.6rem] uppercase tracking-widest text-ink-soft sm:block">
              Algérie
            </span>
          </Link>
        </div>

        {/* Center: category nav (desktop) */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/shop"
            className={cn(
              "link-underline text-sm",
              pathname === "/shop" && "font-medium"
            )}
          >
            {t.nav.shop}
          </Link>
          {CATEGORIES.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="link-underline text-sm text-ink-soft hover:text-ink"
            >
              {name(c)}
            </Link>
          ))}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageToggle />
          <button
            aria-label={t.nav.search}
            onClick={openSearch}
            className="flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-bronze"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/wishlist"
            aria-label={t.nav.wishlist}
            className="relative flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-bronze"
          >
            <Heart className="h-5 w-5" />
            {mounted && <CountBubble count={wishlistCount} />}
          </Link>
          <button
            aria-label={t.nav.cart}
            onClick={openCart}
            className="relative flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-bronze"
          >
            <ShoppingBag className="h-5 w-5" />
            {mounted && <CountBubble count={cartCount} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-line bg-cream px-5 py-4 lg:hidden">
          <Link href="/shop" className="block py-2 text-base">
            {t.nav.shop}
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="block py-2 text-base text-ink-soft"
            >
              {name(c)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
