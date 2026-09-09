"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/inputs";
import { FilterForm, type ShopFacets } from "./FilterForm";
import { useLang } from "@/components/providers/LanguageProvider";

export function ShopToolbar({ total, facets }: { total: number; facets: ShopFacets }) {
  const { t, dir } = useLang();
  const router = useRouter();
  const params = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sort = params.get("sort") ?? "newest";

  function onSortChange(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "newest") next.delete("sort");
    else next.set("sort", value);
    const qs = next.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <div className="flex items-center justify-between gap-4 border-y border-line py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setFiltersOpen(true)}
          className="inline-flex items-center gap-2 text-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t.shop.filters}
        </button>
        <span className="text-sm text-ink-soft">{t.shop.results(total)}</span>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <span className="hidden text-ink-soft sm:inline">{t.shop.sortBy}</span>
        <Select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-auto py-2"
          aria-label={t.shop.sortBy}
        >
          <option value="newest">{t.shop.sortNewest}</option>
          <option value="price-asc">{t.shop.sortPriceAsc}</option>
          <option value="price-desc">{t.shop.sortPriceDesc}</option>
          <option value="name-asc">{t.shop.sortNameAsc}</option>
        </Select>
      </label>

      {/* Mobile filter drawer */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side={dir === "rtl" ? "right" : "left"}
        title={t.shop.filters}
      >
        <FilterForm facets={facets} onNavigate={() => setFiltersOpen(false)} />
      </Drawer>
    </div>
  );
}
