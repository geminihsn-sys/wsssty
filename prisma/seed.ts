/**
 * Database seed for Walid Style.
 *
 * Reads prisma/seed-data.json (products + sample orders) and inserts it with
 * Prisma. Order totals are computed here from the product prices and the
 * Algerian shipping fees, so the JSON stays clean and the numbers stay
 * consistent with the app's own shipping logic.
 *
 * Run with:  npm run db:seed   (or the combined `npm run setup`)
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { SHIPPING_FEES, type DeliveryType } from "../src/lib/constants";
import { wilayaByCode } from "../src/lib/wilayas";

const prisma = new PrismaClient();

interface SeedColor { name: string; nameAr: string; hex: string }
interface SeedProduct {
  slug: string;
  nameFr: string;
  nameAr: string;
  descFr: string;
  descAr: string;
  price: number;
  category: string;
  sizes: string[];
  colors: SeedColor[];
  stock: number;
  featured: boolean;
}
interface SeedOrderItem { slug: string; size: string; color: string; quantity: number }
interface SeedOrder {
  reference: string;
  fullName: string;
  phone: string;
  wilayaCode: number;
  deliveryType: DeliveryType;
  address: string | null;
  status: string;
  daysAgo: number;
  items: SeedOrderItem[];
}
interface SeedFile { products: SeedProduct[]; orders: SeedOrder[] }

function daysAgoToDate(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function main() {
  const raw = readFileSync(join(process.cwd(), "prisma", "seed-data.json"), "utf-8");
  const data = JSON.parse(raw) as SeedFile;

  console.log("→ Clearing existing data…");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  console.log(`→ Seeding ${data.products.length} products…`);
  // Keep a map from slug → created product for order wiring.
  const bySlug = new Map<string, { id: string; nameFr: string; nameAr: string; price: number }>();

  for (const p of data.products) {
    const created = await prisma.product.create({
      data: {
        slug: p.slug,
        nameFr: p.nameFr,
        nameAr: p.nameAr,
        descFr: p.descFr,
        descAr: p.descAr,
        price: p.price,
        category: p.category,
        sizes: JSON.stringify(p.sizes),
        colors: JSON.stringify(p.colors),
        images: JSON.stringify([`/products/${p.slug}-1.svg`, `/products/${p.slug}-2.svg`]),
        stock: p.stock,
        featured: p.featured,
        active: true,
      },
    });
    bySlug.set(p.slug, {
      id: created.id,
      nameFr: created.nameFr,
      nameAr: created.nameAr,
      price: created.price,
    });
  }

  console.log(`→ Seeding ${data.orders.length} orders…`);
  for (const o of data.orders) {
    const wilaya = wilayaByCode(o.wilayaCode);
    const shipping = SHIPPING_FEES[o.deliveryType];

    const itemsData = o.items.map((it) => {
      const prod = bySlug.get(it.slug);
      if (!prod) throw new Error(`Seed order ${o.reference} references unknown product "${it.slug}"`);
      return {
        productId: prod.id,
        nameFr: prod.nameFr,
        nameAr: prod.nameAr,
        price: prod.price,
        size: it.size,
        color: it.color,
        quantity: it.quantity,
      };
    });

    const subtotal = itemsData.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const total = subtotal + shipping;
    const createdAt = daysAgoToDate(o.daysAgo);

    await prisma.order.create({
      data: {
        reference: o.reference,
        fullName: o.fullName,
        phone: o.phone,
        wilayaCode: o.wilayaCode,
        wilayaName: wilaya ? wilaya.fr : String(o.wilayaCode),
        deliveryType: o.deliveryType,
        address: o.address,
        subtotal,
        shipping,
        total,
        status: o.status,
        createdAt,
        updatedAt: createdAt,
        items: { create: itemsData },
      },
    });
  }

  const [productCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
  ]);
  console.log(`✓ Seed complete — ${productCount} products, ${orderCount} orders.`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
