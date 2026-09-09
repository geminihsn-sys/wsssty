import Link from "next/link";
import { Truck, BadgeDollarSign, Scissors, ArrowRight } from "lucide-react";
import { getServerDict } from "@/lib/i18n/server";
import { getFeaturedProducts } from "@/lib/products";
import { CATEGORIES } from "@/lib/constants";
import { ProductCard } from "@/components/product/ProductCard";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const { lang, t } = getServerDict();
  const featured = await getFeaturedProducts(8);
  const catName = (c: (typeof CATEGORIES)[number]) => (lang === "ar" ? c.ar : c.fr);

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-line bg-cream">
        <div className="container-content grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="max-w-xl">
            <span className="eyebrow text-bronze">{t.home.heroEyebrow}</span>
            <h1 className="mt-4 font-serif text-display-lg leading-[0.95] text-ink">
              {t.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
              {t.home.heroSubtitle}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/shop" className={cn(buttonVariants("primary", "lg"), "font-arabic text-lg")}>
                {t.home.heroCta}
              </Link>
              <Link href="/shop?sort=newest" className={buttonVariants("outline", "lg")}>
                {t.home.heroCtaSecondary}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/hero.svg"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="pointer-events-none absolute -bottom-4 start-0 hidden bg-ink px-6 py-4 text-cream sm:block">
              <span className="font-arabic text-sm">الدفع عند التسليم</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Featured */}
      {featured.length > 0 && (
        <section className="container-content py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-display-md leading-tight">{t.home.featuredTitle}</h2>
              <p className="mt-2 text-ink-soft">{t.home.featuredSubtitle}</p>
            </div>
            <Link
              href="/shop"
              className="link-underline hidden shrink-0 items-center gap-1.5 text-sm sm:inline-flex"
            >
              {t.home.viewAll}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- Categories */}
      <section className="border-y border-line bg-offwhite py-20">
        <div className="container-content">
          <h2 className="mb-10 text-center font-serif text-display-md">{t.home.categoriesTitle}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Link
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                className="group relative flex aspect-[4/3] flex-col justify-between border border-line bg-cream p-5 transition-colors hover:border-ink"
              >
                <span className="text-xs tabular-nums text-ink-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex items-center justify-between font-serif text-xl leading-tight">
                  {catName(c)}
                  <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 rtl:rotate-180" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Values */}
      <section className="container-content py-20">
        <h2 className="mb-12 text-center font-serif text-display-md">{t.home.valuesTitle}</h2>
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            { Icon: BadgeDollarSign, title: t.home.valueCodTitle, text: t.home.valueCodText },
            { Icon: Truck, title: t.home.valueDeliveryTitle, text: t.home.valueDeliveryText },
            { Icon: Scissors, title: t.home.valueQualityTitle, text: t.home.valueQualityText },
          ].map(({ Icon, title, text }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-line text-bronze">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-serif text-xl">{title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
