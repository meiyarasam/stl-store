"use client";

import { useStore } from "@/context/StoreContext";

export function useCart() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    currency,
  } = useStore();

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return {
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    currency,
  };
}
