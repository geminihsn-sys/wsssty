"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

/** Unique key for a cart line = product + size + colour. */
export function cartLineKey(i: { productId: string; size: string; color?: string }): string {
  return `${i.productId}__${i.size}__${i.color ?? ""}`;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const key = cartLineKey(item);
          const existing = state.items.find((i) => cartLineKey(i) === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                cartLineKey(i) === key
                  ? { ...i, quantity: Math.min(i.maxStock, i.quantity + item.quantity) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(item.maxStock, item.quantity) }],
          };
        }),
      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => cartLineKey(i) !== key) })),
      setQuantity: (key, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            cartLineKey(i) === key
              ? { ...i, quantity: Math.max(1, Math.min(i.maxStock, qty)) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "ws-cart", version: 1 }
  )
);

/** Total number of units in the cart. */
export const selectCartCount = (s: CartState): number =>
  s.items.reduce((n, i) => n + i.quantity, 0);

/** Products subtotal (excludes shipping). */
export const selectCartSubtotal = (s: CartState): number =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
