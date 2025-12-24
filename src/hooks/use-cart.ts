'use client';

import { useCart as useCartContext } from '@/providers/cart-provider';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '@/types';

export function useCart() {
  const {
    items,
    addToCart: addToCartContext,
    removeFromCart: removeFromCartContext,
    updateQuantity: updateQuantityContext,
    clearCart: clearCartContext,
    isLoading,
    totalPrice,
    totalItems,
  } = useCartContext();

  const addToCart = useCallback(
    async (product: Product, quantity = 1) => {
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

      await addToCartContext(product.product_id, quantity);
      toast.success(`${product.name} added to cart.`);
    },
    [items, addToCartContext]
  );

  const removeFromCart = useCallback(
    async (cartItemId: number, productName?: string) => {
      await removeFromCartContext(cartItemId);
      if (productName) {
        toast.success(`${productName} removed from cart.`);
      }
    },
    [removeFromCartContext]
  );

  const updateItemQuantity = useCallback(
    async (cartItemId: number, quantity: number, product?: Product) => {
      // Check stock
      if (product && quantity > product.stock_quantity) {
        toast.error(`Sorry, only ${product.stock_quantity} items available.`);
        return;
      }

      await updateQuantityContext(cartItemId, quantity);
    },
    [updateQuantityContext]
  );

  const emptyCart = useCallback(async () => {
    await clearCartContext();
    toast.success('Cart cleared.');
  }, [clearCartContext]);

  return {
    items,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    emptyCart,
    isLoading,
    subtotal: totalPrice,
    totalItems,
  };
}
