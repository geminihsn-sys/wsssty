import type { DeliveryType, OrderStatus } from "@/lib/constants";

/** A selectable colour option on a product. */
export interface ColorOption {
  name: string;
  nameAr: string;
  hex: string;
}

/** Product shape used throughout the app (JSON fields already parsed). */
export interface ProductDTO {
  id: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  descFr: string;
  descAr: string;
  price: number;
  category: string;
  sizes: string[];
  colors: ColorOption[];
  images: string[];
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A single line in the shopping cart (client state). */
export interface CartItem {
  productId: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  price: number;
  image: string;
  size: string;
  color?: string;
  colorHex?: string;
  quantity: number;
  maxStock: number;
}

/** A saved favourite (client state). */
export interface WishlistItem {
  productId: string;
  slug: string;
  nameFr: string;
  nameAr: string;
  price: number;
  image: string;
  category: string;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  nameFr: string;
  nameAr: string;
  price: number;
  size: string;
  color?: string | null;
  quantity: number;
}

export interface OrderDTO {
  id: string;
  reference: string;
  fullName: string;
  phone: string;
  wilayaCode: number;
  wilayaName: string;
  deliveryType: DeliveryType;
  address?: string | null;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
}

/** Item payload sent to the order API (server recomputes prices). */
export interface CheckoutItemInput {
  productId: string;
  size: string;
  color?: string;
  quantity: number;
}

export interface CheckoutPayload {
  fullName: string;
  phone: string;
  wilayaCode: number;
  deliveryType: DeliveryType;
  address?: string;
  notes?: string;
  items: CheckoutItemInput[];
}

/** Payload for creating/updating a product from the admin form. */
export interface ProductInput {
  slug?: string;
  nameFr: string;
  nameAr: string;
  descFr: string;
  descAr: string;
  price: number;
  category: string;
  sizes: string[];
  colors: ColorOption[];
  images: string[];
  stock: number;
  featured: boolean;
  active: boolean;
}

export interface TrendPoint {
  date: string; // ISO yyyy-mm-dd
  total: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  nameFr: string;
  nameAr: string;
  units: number;
  revenue: number;
}

export interface AnalyticsData {
  revenue: number;
  totalOrders: number;
  pending: number;
  delivered: number;
  avgOrder: number;
  statusCounts: Record<OrderStatus, number>;
  salesTrend: TrendPoint[];
  topProducts: TopProduct[];
  recentOrders: OrderDTO[];
}
