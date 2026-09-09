"use client";

import { create } from "zustand";
import type { ProductDTO } from "@/types";

/** Ephemeral UI state (no persistence): drawers, overlays, quick view. */
interface UIState {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  quickView: ProductDTO | null;
  openQuickView: (p: ProductDTO) => void;
  closeQuickView: () => void;
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true, searchOpen: false }),
  closeCart: () => set({ cartOpen: false }),

  searchOpen: false,
  openSearch: () => set({ searchOpen: true, cartOpen: false }),
  closeSearch: () => set({ searchOpen: false }),

  quickView: null,
  openQuickView: (p) => set({ quickView: p }),
  closeQuickView: () => set({ quickView: null }),
}));
