"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/inputs";
import { useLang } from "@/components/providers/LanguageProvider";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface ShopFacets {
  sizes: string[];
  maxPrice: number;
}

export function FilterForm({
  facets,
  onNavigate,
}: {
  facets: ShopFacets;
  onNavigate?: () => void;
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const params = useSearchParams();

  const activeCategory = params.get("category") ?? "";
  const activeSize = params.get("size") ?? "";
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");

  /** Build a new query string from the current params with overrides applied. */
  function navigate(overrides: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
    onNavigate?.();
  }

  const catName = (c: (typeof CATEGORIES)[number]) => (lang === "ar" ? c.ar : c.fr);

  return (
    <div className="space-y-8">
      {/* Category */}
      <fieldset>
        <legend className="eyebrow mb-3 text-ink">{t.shop.category}</legend>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate({ category: null })}
              className={cn(
                "w-full text-start text-sm transition-colors hover:text-ink",
                activeCategory === "" ? "font-medium text-ink" : "text-ink-soft"
              )}
            >
              {t.common.all}
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => navigate({ category: c.slug })}
                className={cn(
                  "w-full text-start text-sm transition-colors hover:text-ink",
                  activeCategory === c.slug ? "font-medium text-ink" : "text-ink-soft"
                )}
              >
                {catName(c)}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>

      {/* Price */}
      <fieldset>
        <legend className="eyebrow mb-3 text-ink">{t.shop.price}</legend>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t.shop.minPrice}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="py-2"
          />
          <span className="text-ink-soft">—</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t.shop.maxPrice}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="py-2"
          />
        </div>
        <Button
          variant="subtle"
          size="sm"
          className="mt-3 w-full"
          onClick={() => navigate({ min: min || null, max: max || null })}
        >
          {t.shop.apply}
        </Button>
      </fieldset>

      {/* Size */}
      {facets.sizes.length > 0 && (
        <fieldset>
          <legend className="eyebrow mb-3 text-ink">{t.shop.size}</legend>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => (
              <button
                key={s}
                onClick={() => navigate({ size: activeSize === s ? null : s })}
                className={cn(
                  "min-w-10 rounded-[2px] border px-2.5 py-1.5 text-sm transition-colors",
                  activeSize === s
                    ? "border-ink bg-ink text-cream"
                    : "border-line text-ink hover:border-ink"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => {
          setMin("");
          setMax("");
          navigate({ category: null, size: null, min: null, max: null });
        }}
      >
        {t.shop.clear}
      </Button>
    </div>
  );
}
