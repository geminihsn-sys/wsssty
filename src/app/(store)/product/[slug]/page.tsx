import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { getServerDict } from "@/lib/i18n/server";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { categoryLabel } from "@/lib/constants";
import { Price } from "@/components/ui/Price";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCart } from "@/components/product/AddToCart";
import { WishlistButton } from "@/components/product/WishlistButton";
import { ProductCard } from "@/components/product/ProductCard";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Introuvable — Walid Style" };
  return {
    title: `${product.nameFr} — Walid Style`,
    description: product.descFr.slice(0, 155),
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { lang, t } = getServerDict();
  const product = await getProductBySlug(params.slug);
  if (!product || !product.active) notFound();

  const related = await getRelatedProducts(product, 4);
  const name = lang === "ar" ? product.nameAr : product.nameFr;
  const desc = lang === "ar" ? product.descAr : product.descFr;

  return (
    <div className="container-content py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs text-ink-soft">
        <Link href="/" className="hover:text-ink">
          {t.brand.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        <Link href={`/shop?category=${product.category}`} className="hover:text-ink">
          {categoryLabel(product.category, lang)}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        <span className="truncate text-ink">{name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} alt={name} />

        <div className="flex flex-col">
          <span className="eyebrow text-ink-soft">
            {categoryLabel(product.category, lang)}
          </span>
          <h1 className="mt-2 font-serif text-display-md leading-tight">{name}</h1>
          <Price amount={product.price} className="mt-3 text-2xl text-bronze" />

          {desc && (
            <p className="mt-6 leading-relaxed text-ink-soft">{desc}</p>
          )}

          <div className="mt-8">
            <AddToCart product={product} />
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <WishlistButton product={product} variant="full" />
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-serif text-display-md">{t.product.relatedTitle}</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
