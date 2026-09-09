import "server-only";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { CATEGORY_SLUGS } from "@/lib/constants";
import type { ProductDTO, ProductInput } from "@/types";

export class ProductError extends Error {
  fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>, message = "invalid_product") {
    super(message);
    this.name = "ProductError";
    this.fieldErrors = fieldErrors;
  }
}

/** URL-safe slug from an arbitrary name (handles French diacritics). */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "produit";
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base;
  let n = 1;
  // Loop until the slug is free (ignoring the product being edited).
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

function validate(input: ProductInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.nameFr || !input.nameFr.trim()) errors.nameFr = "required_fr";
  if (!Number.isFinite(input.price) || input.price <= 0) errors.price = "invalid_price";
  if (!CATEGORY_SLUGS.includes(input.category)) errors.category = "invalid_category";
  return errors;
}

function normalize(input: ProductInput) {
  return {
    nameFr: input.nameFr.trim(),
    nameAr: (input.nameAr || "").trim(),
    descFr: (input.descFr || "").trim(),
    descAr: (input.descAr || "").trim(),
    price: Math.round(input.price),
    category: input.category,
    sizes: JSON.stringify(Array.isArray(input.sizes) ? input.sizes : []),
    colors: JSON.stringify(Array.isArray(input.colors) ? input.colors : []),
    images: JSON.stringify(
      Array.isArray(input.images) && input.images.length > 0
        ? input.images
        : ["/products/placeholder-1.svg"]
    ),
    stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
    featured: Boolean(input.featured),
    active: Boolean(input.active),
  };
}

export async function createProduct(input: ProductInput): Promise<ProductDTO> {
  const errors = validate(input);
  if (Object.keys(errors).length) throw new ProductError(errors);

  const data = normalize(input);
  const slug = await uniqueSlug(input.slug ? slugify(input.slug) : slugify(data.nameFr));

  const product = await prisma.product.create({ data: { ...data, slug } });
  return serializeProduct(product);
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ProductDTO> {
  const errors = validate(input);
  if (Object.keys(errors).length) throw new ProductError(errors);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new ProductError({ id: "not_found" }, "not_found");

  const data = normalize(input);
  // Only recompute the slug if the caller explicitly supplied one.
  const slug = input.slug ? await uniqueSlug(slugify(input.slug), id) : existing.slug;

  const product = await prisma.product.update({
    where: { id },
    data: { ...data, slug },
  });
  return serializeProduct(product);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}
