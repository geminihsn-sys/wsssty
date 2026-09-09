/**
 * Shared, framework-agnostic constants for Walid Style.
 * Safe to import from both server and client components (no side effects).
 */

// ------------------------------------------------------------------ //
//  Categories                                                         //
// ------------------------------------------------------------------ //
export interface CategoryDef {
  slug: string;
  fr: string;
  ar: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "costumes", fr: "Costumes", ar: "بدلات" },
  { slug: "chemises", fr: "Chemises", ar: "قمصان" },
  { slug: "robes", fr: "Robes", ar: "فساتين" },
  { slug: "abayas", fr: "Abayas & Kaftans", ar: "عبايات وقفاطين" },
  { slug: "pantalons", fr: "Pantalons", ar: "سراويل" },
  { slug: "manteaux", fr: "Manteaux", ar: "معاطف" },
  { slug: "accessoires", fr: "Accessoires", ar: "إكسسوارات" },
];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

export function categoryLabel(slug: string, lang: "fr" | "ar"): string {
  const c = CATEGORIES.find((x) => x.slug === slug);
  return c ? c[lang] : slug;
}

// ------------------------------------------------------------------ //
//  Sizes                                                              //
// ------------------------------------------------------------------ //
// Canonical ordering used to sort size chips consistently in filters/cards.
export const SIZE_ORDER: string[] = [
  "XS", "S", "M", "L", "XL", "XXL",
  "30", "31", "32", "33", "34", "35", "36", "37", "38", "40",
  "Unique",
];

export function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a);
    const ib = SIZE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

// ------------------------------------------------------------------ //
//  Delivery / shipping (Algerian COD)                                 //
// ------------------------------------------------------------------ //
export type DeliveryType = "home" | "stopdesk";

export interface DeliveryOption {
  value: DeliveryType;
  fr: string;
  ar: string;
  fee: number; // in DA
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { value: "home", fr: "Livraison à domicile", ar: "توصيل للمنزل", fee: 800 },
  { value: "stopdesk", fr: "Stop Desk (bureau)", ar: "توصيل للمكتب/المقر", fee: 600 },
];

export const SHIPPING_FEES: Record<DeliveryType, number> = {
  home: 800,
  stopdesk: 600,
};

// ------------------------------------------------------------------ //
//  Order status                                                       //
// ------------------------------------------------------------------ //
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface StatusDef {
  value: OrderStatus;
  fr: string;
  ar: string;
  /** Tailwind classes for the status badge. */
  className: string;
}

export const ORDER_STATUSES: StatusDef[] = [
  { value: "pending", fr: "En attente", ar: "قيد الانتظار", className: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "confirmed", fr: "Confirmée", ar: "مؤكدة", className: "bg-sky-100 text-sky-800 border-sky-200" },
  { value: "shipped", fr: "Expédiée", ar: "تم الشحن", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { value: "delivered", fr: "Livrée", ar: "تم التسليم", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { value: "cancelled", fr: "Annulée", ar: "ملغاة", className: "bg-rose-100 text-rose-800 border-rose-200" },
];

export const ORDER_STATUS_VALUES = ORDER_STATUSES.map((s) => s.value);

export function statusDef(value: string): StatusDef {
  return (
    ORDER_STATUSES.find((s) => s.value === value) ?? ORDER_STATUSES[0]
  );
}
