import type { Order, OrderItem, Product } from "@prisma/client";
import type { DeliveryType, OrderStatus } from "@/lib/constants";
import type { ColorOption, OrderDTO, OrderItemDTO, ProductDTO } from "@/types";

function parseJSON<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Convert a Prisma Product row into a client-safe DTO (JSON fields parsed). */
export function serializeProduct(p: Product): ProductDTO {
  return {
    id: p.id,
    slug: p.slug,
    nameFr: p.nameFr,
    nameAr: p.nameAr,
    descFr: p.descFr,
    descAr: p.descAr,
    price: p.price,
    category: p.category,
    sizes: parseJSON<string[]>(p.sizes, []),
    colors: parseJSON<ColorOption[]>(p.colors, []),
    images: parseJSON<string[]>(p.images, []),
    stock: p.stock,
    featured: p.featured,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function serializeOrderItem(i: OrderItem): OrderItemDTO {
  return {
    id: i.id,
    productId: i.productId,
    nameFr: i.nameFr,
    nameAr: i.nameAr,
    price: i.price,
    size: i.size,
    color: i.color,
    quantity: i.quantity,
  };
}

export function serializeOrder(o: Order & { items: OrderItem[] }): OrderDTO {
  return {
    id: o.id,
    reference: o.reference,
    fullName: o.fullName,
    phone: o.phone,
    wilayaCode: o.wilayaCode,
    wilayaName: o.wilayaName,
    deliveryType: o.deliveryType as DeliveryType,
    address: o.address,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    status: o.status as OrderStatus,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    items: o.items.map(serializeOrderItem),
  };
}
