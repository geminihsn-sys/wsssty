"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Pencil, Trash2, Plus, Star } from "lucide-react";
import { Input } from "@/components/ui/inputs";
import { Price } from "@/components/ui/Price";
import { buttonVariants } from "@/components/ui/Button";
import { useLang } from "@/components/providers/LanguageProvider";
import { categoryLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/types";

export function ProductsTable({ initialProducts }: { initialProducts: ProductDTO[] }) {
  const { t, lang } = useLang();
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((p) =>
      [p.nameFr, p.nameAr, p.slug, categoryLabel(p.category, "fr")]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [products, query]);

  async function remove(product: ProductDTO) {
    if (!window.confirm(t.admin.products.deleteConfirm)) return;
    setDeleting(product.id);
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.admin.products.title + "…"}
            className="ps-9"
          />
        </div>
        <Link href="/admin/products/new" className={buttonVariants("primary", "md")}>
          <Plus className="h-4 w-4" />
          {t.admin.products.add}
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-line bg-offwhite">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3 text-start font-medium">{t.admin.products.image}</th>
              <th className="px-4 py-3 text-start font-medium">{t.admin.products.name}</th>
              <th className="hidden px-4 py-3 text-start font-medium md:table-cell">{t.admin.products.category}</th>
              <th className="px-4 py-3 text-start font-medium">{t.admin.products.price}</th>
              <th className="px-4 py-3 text-start font-medium">{t.admin.products.stock}</th>
              <th className="hidden px-4 py-3 text-start font-medium lg:table-cell">{t.admin.products.status}</th>
              <th className="px-4 py-3 text-end font-medium">{t.admin.products.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-ink-soft">
                  {t.admin.products.noProducts}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-line/60 transition-colors last:border-0 hover:bg-sand/40">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0] ?? "/products/placeholder-1.svg"}
                      alt=""
                      className="h-12 w-10 rounded-[2px] border border-line object-cover"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      {lang === "ar" ? p.nameAr : p.nameFr}
                      {p.featured && <Star className="h-3.5 w-3.5 fill-bronze text-bronze" />}
                    </span>
                    <span className="text-xs text-ink-soft">{p.slug}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-ink-soft md:table-cell">
                    {categoryLabel(p.category, lang)}
                  </td>
                  <td className="px-4 py-3"><Price amount={p.price} /></td>
                  <td className="px-4 py-3">
                    <span className={cn("tabular-nums", p.stock === 0 && "text-danger", p.stock > 0 && p.stock <= 5 && "text-bronze")}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        p.active
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-line bg-sand text-ink-soft"
                      )}
                    >
                      {p.active ? t.admin.products.active : t.admin.products.inactive}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className={buttonVariants("ghost", "icon")}
                        aria-label={t.admin.products.edit}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(p)}
                        disabled={deleting === p.id}
                        className={cn(buttonVariants("ghost", "icon"), "text-danger hover:bg-danger/10")}
                        aria-label={t.admin.products.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
