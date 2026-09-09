"use client";

import Link from "next/link";
import { Instagram, Facebook, Send } from "lucide-react";
import { useLang } from "@/components/providers/LanguageProvider";
import { CATEGORIES } from "@/lib/constants";

export function Footer() {
  const { t, lang } = useLang();
  const year = new Date().getFullYear();
  const name = (c: (typeof CATEGORIES)[number]) => (lang === "ar" ? c.ar : c.fr);

  return (
    <footer className="mt-24 border-t border-line bg-offwhite">
      <div className="container-content grid grid-cols-2 gap-10 py-16 md:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
            {t.brand.name}
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            {t.footer.tagline}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              aria-label="Telegram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <Send className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Shop columns */}
        <div>
          <h3 className="eyebrow mb-4 text-ink">{t.footer.shopHeading}</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/shop" className="text-ink-soft transition-colors hover:text-ink">
                {t.nav.shop}
              </Link>
            </li>
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="text-ink-soft transition-colors hover:text-ink"
                >
                  {name(c)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h3 className="eyebrow mb-4 text-ink">{t.footer.helpHeading}</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <span className="text-ink-soft">{t.footer.shipping}</span>
            </li>
            <li>
              <span className="text-ink-soft">{t.footer.faq}</span>
            </li>
            <li>
              <span className="text-ink-soft">{t.footer.contact}</span>
            </li>
            <li>
              <Link href="/admin" className="text-ink-soft transition-colors hover:text-ink">
                {t.nav.admin}
              </Link>
            </li>
          </ul>
        </div>

        {/* COD highlight */}
        <div>
          <h3 className="eyebrow mb-4 text-ink">{t.footer.followHeading}</h3>
          <p className="rounded-[2px] border border-line bg-cream p-4 text-sm leading-relaxed text-ink-soft">
            {t.footer.codNote}
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-content flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-soft sm:flex-row">
          <p>
            © {year} {t.brand.name}. {t.footer.rights}
          </p>
          <p className="tracking-wide">Alger · Algérie</p>
        </div>
      </div>
    </footer>
  );
}
