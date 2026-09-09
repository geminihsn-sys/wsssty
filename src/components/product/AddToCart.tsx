"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useLang } from "@/components/providers/LanguageProvider";
import { useCart } from "@/store/cart";
import { sortSizes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ColorOption, ProductDTO } from "@/types";

export function AddToCart({
  product,
  onAdded,
}: {
  product: ProductDTO;
  /** Called after a successful add (e.g. to open the cart drawer). */
  onAdded?: () => void;
}) {
  const { t, lang } = useLang();
  const addItem = useCart((s) => s.addItem);

  const sizes = sortSizes(product.sizes);
  const hasSizes = sizes.length > 0;
  const hasColors = product.colors.length > 0;
  const outOfStock = product.stock <= 0;

  const [size, setSize] = useState<string | null>(hasSizes ? null : "Unique");
  const [color, setColor] = useState<ColorOption | null>(
    hasColors ? product.colors[0] : null
  );
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (hasSizes && !size) {
      setError(t.product.sizeRequired);
      return;
    }
    setError(null);
    addItem({
      productId: product.id,
      slug: product.slug,
      nameFr: product.nameFr,
      nameAr: product.nameAr,
      price: product.price,
      image: product.images[0] ?? "",
      size: size ?? "Unique",
      color: color?.name,
      colorHex: color?.hex,
      quantity: qty,
      maxStock: product.stock,
    });
    setAdded(true);
    onAdded?.();
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Sizes */}
      {hasSizes && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">{t.product.selectSize}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setError(null);
                }}
                className={cn(
                  "min-w-11 rounded-[2px] border px-3 py-2 text-sm transition-colors",
                  size === s
                    ? "border-ink bg-ink text-cream"
                    : "border-line text-ink hover:border-ink"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {hasColors && (
        <div>
          <div className="mb-2 text-sm font-medium">
            {t.product.color}
            {color && (
              <span className="ms-2 text-ink-soft">
                — {lang === "ar" ? color.nameAr : color.name}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.hex + c.name}
                type="button"
                onClick={() => setColor(c)}
                aria-label={lang === "ar" ? c.nameAr : c.name}
                aria-pressed={color?.hex === c.hex && color?.name === c.name}
                className={cn(
                  "h-8 w-8 rounded-full border transition-transform",
                  color?.hex === c.hex && color?.name === c.name
                    ? "ring-2 ring-ink ring-offset-2 ring-offset-cream"
                    : "border-line hover:scale-105"
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {/* Quantity + add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {!outOfStock && (
          <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
        )}
        <Button
          onClick={handleAdd}
          disabled={outOfStock}
          size="lg"
          className="flex-1"
        >
          {outOfStock ? (
            t.product.outOfStock
          ) : added ? (
            <>
              <Check className="h-5 w-5" />
              {t.product.added}
            </>
          ) : (
            <>
              <ShoppingBag className="h-5 w-5" />
              {t.product.addToCart}
            </>
          )}
        </Button>
      </div>

      {/* Stock hint */}
      {!outOfStock && product.stock <= 5 && (
        <p className="text-xs text-bronze">{t.product.lowStock(product.stock)}</p>
      )}
    </div>
  );
}
