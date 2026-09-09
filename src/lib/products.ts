import "server-only";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serialize";
import { sortSizes } from "@/lib/constants";
import type { ProductDTO } from "@/types";

export type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc";

export interface ProductQuery {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  sort?: SortKey;
  includeInactive?: boolean;
}

function orderByFor(sort: SortKey | undefined) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" } as const;
    case "price-desc":
      return { price: "desc" } as const;
    case "name-asc":
      return { nameFr: "asc" } as const;
    case "newest":
    default:
      return { createdAt: "desc" } as const;
  }
}

/** Query products with filtering + sorting. Size/text filters run in JS
 *  because SQLite stores sizes as a JSON string. */
export async function getProducts(query: ProductQuery = {}): Promise<ProductDTO[]> {
  const where: Record<string, unknown> = {};
  if (!query.includeInactive) where.active = true;
  if (query.category) where.category = query.category;
  if (query.minPrice != null || query.maxPrice != null) {
    where.price = {
      ...(query.minPrice != null ? { gte: query.minPrice } : {}),
      ...(query.maxPrice != null ? { lte: query.maxPrice } : {}),
    };
  }

  const rows = await prisma.product.findMany({
    where,
    orderBy: orderByFor(query.sort),
  });

  let products = rows.map(serializeProduct);

  if (query.q) {
    const needle = query.q.trim().toLowerCase();
    if (needle) {
      products = products.filter((p) =>
        [p.nameFr, p.nameAr, p.descFr, p.descAr, p.category]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }
  }

  if (query.size) {
    products = products.filter((p) => p.sizes.includes(query.size as string));
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  const row = await prisma.product.findUnique({ where: { slug } });
  return row ? serializeProduct(row) : null;
}

export async function getProductById(id: string): Promise<ProductDTO | null> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? serializeProduct(row) : null;
}

export async function getFeaturedProducts(limit = 8): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(serializeProduct);
}

export async function getRelatedProducts(
  product: ProductDTO,
  limit = 4
): Promise<ProductDTO[]> {
  const rows = await prisma.product.findMany({
    where: { active: true, category: product.category, NOT: { id: product.id } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(serializeProduct);
}

/** Distinct, canonically-sorted set of sizes across the active catalogue. */
export async function getAvailableSizes(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { active: true },
    select: { sizes: true },
  });
  const set = new Set<string>();
  for (const r of rows) {
    try {
      (JSON.parse(r.sizes) as string[]).forEach((s) => set.add(s));
    } catch {
      /* ignore malformed */
    }
  }
  return sortSizes([...set]);
}

/** Highest product price — used to bound the price filter. */
export async function getMaxPrice(): Promise<number> {
  const row = await prisma.product.findFirst({
    where: { active: true },
    orderBy: { price: "desc" },
    select: { price: true },
  });
  return row?.price ?? 0;
}
