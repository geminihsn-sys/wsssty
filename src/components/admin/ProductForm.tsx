"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Check, Upload, Loader2 } from "lucide-react";
import { Field, Input, Textarea, Select } from "@/components/ui/inputs";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useLang } from "@/components/providers/LanguageProvider";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ColorOption, ProductDTO, ProductInput } from "@/types";

type ColorRow = ColorOption;

export function ProductForm({ product }: { product?: ProductDTO }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const isEdit = !!product;

  const [nameFr, setNameFr] = useState(product?.nameFr ?? "");
  const [nameAr, setNameAr] = useState(product?.nameAr ?? "");
  const [descFr, setDescFr] = useState(product?.descFr ?? "");
  const [descAr, setDescAr] = useState(product?.descAr ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0].slug);
  const [sizes, setSizes] = useState((product?.sizes ?? []).join(", "));
  const [colors, setColors] = useState<ColorRow[]>(product?.colors ?? []);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);

  const [errors, setErrors] = useState<{ nameFr?: string; price?: string }>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  function addColor() {
    setColors((prev) => [...prev, { name: "", nameAr: "", hex: "#1A1A1A" }]);
  }
  function updateColor(i: number, patch: Partial<ColorRow>) {
    setColors((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }
  function removeColor(i: number) {
    setColors((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function uploadFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setUploadError(null);
    setUploadCount((n) => n + imageFiles.length);
    await Promise.all(
      imageFiles.map(async (file) => {
        try {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          if (res.ok) {
            const data = await res.json();
            if (data?.path) setImages((prev) => [...prev, data.path as string]);
          } else {
            const data = await res.json().catch(() => null);
            setUploadError(
              data?.error === "too_large"
                ? t.admin.form.tooLarge
                : data?.error === "unsupported_type"
                  ? t.admin.form.unsupportedType
                  : t.admin.form.uploadFailed
            );
          }
        } catch {
          setUploadError(t.admin.form.uploadFailed);
        } finally {
          setUploadCount((n) => Math.max(0, n - 1));
        }
      })
    );
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    uploadFiles(e.target.files ? Array.from(e.target.files) : []);
    e.target.value = ""; // let the same file be picked again later
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addUrl() {
    const v = urlInput.trim();
    if (!v) return;
    setImages((prev) => [...prev, v]);
    setUrlInput("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const priceNum = Math.round(Number(price));
    const nextErrors: typeof errors = {};
    if (!nameFr.trim()) nextErrors.nameFr = t.admin.form.requiredFr;
    if (!Number.isFinite(priceNum) || priceNum <= 0) nextErrors.price = t.admin.form.requiredPrice;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: ProductInput = {
      nameFr: nameFr.trim(),
      nameAr: nameAr.trim(),
      descFr: descFr.trim(),
      descAr: descAr.trim(),
      price: priceNum,
      category,
      sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: colors
        .map((c) => ({ name: c.name.trim(), nameAr: c.nameAr.trim(), hex: c.hex.trim() }))
        .filter((c) => c.name || c.nameAr),
      images: images.map((s) => s.trim()).filter(Boolean),
      stock: Math.max(0, Math.round(Number(stock) || 0)),
      featured,
      active,
    };

    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/products/${product!.id}` : "/api/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => null);
      if (data?.fieldErrors) {
        setErrors({
          nameFr: data.fieldErrors.nameFr ? t.admin.form.requiredFr : undefined,
          price: data.fieldErrors.price ? t.admin.form.requiredPrice : undefined,
        });
      } else {
        setServerError(t.common.error);
      }
    } catch {
      setServerError(t.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t.admin.form.backToList}
      </Link>

      <h1 className="mb-8 font-serif text-3xl">
        {isEdit ? t.admin.form.editTitle : t.admin.form.newTitle}
      </h1>

      <form onSubmit={onSubmit} className="max-w-3xl space-y-8" noValidate>
        {/* Names */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.admin.form.nameFr} htmlFor="nameFr" required error={errors.nameFr}>
            <Input id="nameFr" value={nameFr} onChange={(e) => setNameFr(e.target.value)} invalid={!!errors.nameFr} />
          </Field>
          <Field label={t.admin.form.nameAr} htmlFor="nameAr">
            <Input id="nameAr" value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />
          </Field>
        </div>

        {/* Descriptions */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.admin.form.descFr} htmlFor="descFr">
            <Textarea id="descFr" value={descFr} onChange={(e) => setDescFr(e.target.value)} />
          </Field>
          <Field label={t.admin.form.descAr} htmlFor="descAr">
            <Textarea id="descAr" value={descAr} onChange={(e) => setDescAr(e.target.value)} dir="rtl" />
          </Field>
        </div>

        {/* Price / stock / category */}
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label={t.admin.form.price} htmlFor="price" required error={errors.price}>
            <Input
              id="price"
              type="number"
              inputMode="numeric"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              invalid={!!errors.price}
              dir="ltr"
            />
          </Field>
          <Field label={t.admin.form.stock} htmlFor="stock">
            <Input
              id="stock"
              type="number"
              inputMode="numeric"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              dir="ltr"
            />
          </Field>
          <Field label={t.admin.form.category} htmlFor="category">
            <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {lang === "ar" ? c.ar : c.fr}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Sizes */}
        <Field label={t.admin.form.sizes} htmlFor="sizes" hint={t.admin.form.sizesHint}>
          <Input id="sizes" value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="S, M, L, XL" />
        </Field>

        {/* Colors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="block text-sm font-medium text-ink">{t.admin.form.colors}</span>
            <button
              type="button"
              onClick={addColor}
              className="inline-flex items-center gap-1.5 text-sm text-bronze transition-colors hover:text-ink"
            >
              <Plus className="h-4 w-4" />
              {t.admin.form.addColor}
            </button>
          </div>
          {colors.length > 0 && (
            <div className="space-y-2">
              {colors.map((c, i) => (
                <div key={i} className="flex items-end gap-2">
                  <Field label={i === 0 ? t.admin.form.colorName : undefined} className="flex-1">
                    <Input value={c.name} onChange={(e) => updateColor(i, { name: e.target.value })} />
                  </Field>
                  <Field label={i === 0 ? t.admin.form.colorNameAr : undefined} className="flex-1">
                    <Input value={c.nameAr} onChange={(e) => updateColor(i, { nameAr: e.target.value })} dir="rtl" />
                  </Field>
                  <Field label={i === 0 ? t.admin.form.colorHex : undefined} className="w-16 shrink-0">
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => updateColor(i, { hex: e.target.value })}
                      className="h-[42px] w-full cursor-pointer rounded-[2px] border border-line bg-offwhite p-1"
                      aria-label={t.admin.form.colorHex}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => removeColor(i)}
                    className={cn(buttonVariants("ghost", "icon"), "mb-0 shrink-0 text-danger hover:bg-danger/10")}
                    aria-label={t.admin.products.delete}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="space-y-3">
          <div>
            <span className="block text-sm font-medium text-ink">{t.admin.form.images}</span>
            <p className="mt-1 text-xs text-ink-soft">{t.admin.form.imagesHint}</p>
          </div>

          {images.length > 0 && (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((src, i) => (
                <li
                  key={`${src}-${i}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-[2px] border border-line bg-offwhite"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute start-1.5 top-1.5 rounded-[2px] bg-ink/85 px-1.5 py-0.5 text-[0.65rem] font-medium text-cream">
                      {t.admin.form.primaryImage}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label={t.admin.form.removeImage}
                    className="absolute end-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-cream/90 text-ink-soft opacity-0 backdrop-blur transition-opacity hover:text-danger focus:opacity-100 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Drop zone / file picker */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-[2px] border border-dashed px-4 py-8 text-center transition-colors",
              dragOver
                ? "border-ink bg-sand/60"
                : "border-line bg-offwhite hover:border-ink/40 hover:bg-sand/30"
            )}
          >
            {uploadCount > 0 ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-bronze" />
                <span className="text-sm text-ink-soft">{t.admin.form.uploading}</span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-bronze" />
                <span className="text-sm font-medium text-ink">{t.admin.form.uploadCta}</span>
                <span className="text-xs text-ink-soft">{t.admin.form.uploadDrop}</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            multiple
            className="hidden"
            onChange={onFileInput}
          />

          {uploadError && (
            <p className="text-xs text-danger" role="alert">{uploadError}</p>
          )}

          {/* Optional: add by URL / path */}
          <div className="flex items-center gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
              placeholder={t.admin.form.orPasteUrl}
              dir="ltr"
              className="flex-1"
            />
            <Button type="button" variant="subtle" onClick={addUrl}>
              {t.admin.form.addUrl}
            </Button>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-8">
          <ToggleField label={t.admin.form.featured} checked={featured} onChange={setFeatured} />
          <ToggleField label={t.admin.form.active} checked={active} onChange={setActive} />
        </div>

        {serverError && (
          <p className="text-sm text-danger" role="alert">{serverError}</p>
        )}

        <div className="flex items-center gap-3 border-t border-line pt-6">
          <Button type="submit" disabled={saving}>
            {saving ? t.admin.form.saving : t.admin.form.save}
          </Button>
          <Link href="/admin/products" className={buttonVariants("ghost", "md")}>
            {t.common.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-sm"
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-[2px] border transition-colors",
          checked ? "border-ink bg-ink text-cream" : "border-line bg-offwhite"
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span className="font-medium text-ink">{label}</span>
    </button>
  );
}
