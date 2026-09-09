import Link from "next/link";
import { getServerDict } from "@/lib/i18n/server";
import {
  getProducts,
  getAvailableSizes,
  getMaxPrice,
  type SortKey,
} from "@/lib/products";
import { categoryLabel } from "@/lib/constants";
import { ProductCard } from "@/components/product/ProductCard";
import { FilterForm } from "@/components/shop/FilterForm";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { buttonVariants } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function toInt(v: string | undefined): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { lang, t } = getServerDict();

  const category = first(searchParams.category);
  const q = first(searchParams.q);
  const size = first(searchParams.size);
  const sort = first(searchParams.sort) as SortKey | undefined;
  const minPrice = toInt(first(searchParams.min));
  const maxPrice = toInt(first(searchParams.max));

  const [products, sizes, priceCeiling] = await Promise.all([
    getProducts({ category, q, size, sort, minPrice, maxPrice }),
    getAvailableSizes(),
    getMaxPrice(),
  ]);

  const facets = { sizes, maxPrice: priceCeiling };
  const heading = category ? categoryLabel(category, lang) : t.shop.title;

  return (
    <div className="container-content py-12">
      <header className="mb-8">
        <h1 className="font-serif text-display-md leading-tight">{heading}</h1>
        {q ? (
          <p className="mt-2 text-ink-soft">
            {t.common.search}: <span className="text-ink">« {q} »</span>
          </p>
        ) : (
          <p className="mt-2 text-ink-soft">{t.shop.subtitle}</p>
        )}
      </header>

      <ShopToolbar total={products.length} facets={facets} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <FilterForm facets={facets} />
        </aside>

        {/* Grid */}
        <div>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
              <p className="text-ink-soft">{t.shop.noResults}</p>
              <Link href="/shop" className={buttonVariants("outline", "md")}>
                {t.shop.noResultsCta}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
