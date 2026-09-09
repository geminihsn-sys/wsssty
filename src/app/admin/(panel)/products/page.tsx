import { getServerDict } from "@/lib/i18n/server";
import { getProducts } from "@/lib/products";
import { ProductsTable } from "@/components/admin/ProductsTable";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { t } = getServerDict();
  const products = await getProducts({ includeInactive: true, sort: "newest" });

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-3xl">{t.admin.products.title}</h1>
        <p className="mt-1 text-sm text-ink-soft">{t.shop.results(products.length)}</p>
      </header>
      <ProductsTable initialProducts={products} />
    </div>
  );
}
