'use client';

import { useCart as useCartContext } from '@/providers/cart-provider';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '@/types/supabase';

export function useCart() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isLoading,
    subtotal,
  } = useCartContext();

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      // Check if product is in stock
      if (product.stock_quantity < quantity) {
        toast.error(`Sorry, only ${product.stock_quantity} items available.`);
        return;
      }

      // Check if adding to cart would exceed available stock
      const existingItem = items.find((item) => item.product_id === product.product_id);
      if (existingItem && existingItem.quantity + quantity > product.stock_quantity) {
        toast.error(`Cannot add more. Maximum stock reached.`);
        return;
      }

      addItem(product, quantity);
      toast.success(`${product.name} added to cart.`);
    },
    [items, addItem]
  );

  const removeFromCart = useCallback(
    (productId: string, productName?: string) => {
      removeItem(productId);
      if (productName) {
        toast.success(`${productName} removed from cart.`);
      }
    },
    [removeItem]
  );

  const updateItemQuantity = useCallback(
    (productId: string, quantity: number, product?: Product) => {
      // Check stock
      if (product && quantity > product.stock_quantity) {
        toast.error(`Sorry, only ${product.stock_quantity} items available.`);
        return;
      }

      updateQuantity(productId, quantity);
    },
    [updateQuantity]
  );

  const emptyCart = useCallback(() => {
    clearCart();
    toast.success('Cart cleared.');
  }, [clearCart]);

  // Calculate total items in cart
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    items,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    emptyCart,
    isLoading,
    subtotal,
    totalItems,
  };
}
