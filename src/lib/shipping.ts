import { SHIPPING_FEES, type DeliveryType } from "./constants";

/** Shipping fee (DA) for a delivery type. */
export function shippingFee(type: DeliveryType): number {
  return SHIPPING_FEES[type] ?? 0;
}

export interface LineItemLike {
  price: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  total: number;
}

/**
 * Canonical order-total calculation used by both the checkout UI and the
 * server when persisting an order, so the customer and the database always
 * agree on the numbers.
 */
export function computeTotals(
  items: LineItemLike[],
  deliveryType: DeliveryType
): OrderTotals {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shipping = shippingFee(deliveryType);
  return { subtotal, shipping, total: subtotal + shipping };
}
