'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  cart_item_id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  subtotal: number;
  stock_quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart on initial load
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/cart');
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          // Try to parse error response as JSON
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If parsing fails, use the raw text
          console.error('Failed to parse error response:', errorText);
          throw new Error('Failed to fetch cart');
        }
        
        throw new Error(errorData?.error || 'Failed to fetch cart');
      }
      
      // Parse JSON safely
      const responseText = await response.text();
      let data;
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse cart response:', responseText);
        throw new Error('Invalid cart data received');
      }
      
      setItems(data.items || []);
      setTotalItems(data.total_items || 0);
      setTotalPrice(data.total_price || 0);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    try {
      setError(null);
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cart API error response:', response.status, errorText);
        
        let errorData;
        
        try {
          // Try to parse error response as JSON
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If parsing fails, use the raw text
          console.error('Failed to parse error response:', errorText);
          throw new Error(`Failed to add to cart: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(errorData?.error || 'Failed to add to cart');
      }
      
      // Refresh cart data
      await fetchCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
      throw err;
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          // Try to parse error response as JSON
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If parsing fails, use the raw text
          console.error('Failed to parse error response:', errorText);
          throw new Error('Failed to remove from cart');
        }
        
        throw new Error(errorData?.error || 'Failed to remove from cart');
      }
      
      // Refresh cart data
      await fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart. Please try again.');
      throw err;
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/cart/items/${cartItemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          // Try to parse error response as JSON
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If parsing fails, use the raw text
          console.error('Failed to parse error response:', errorText);
          throw new Error('Failed to update quantity');
        }
        
        throw new Error(errorData?.error || 'Failed to update quantity');
      }
      
      // Refresh cart data
      await fetchCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity. Please try again.');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          // Try to parse error response as JSON
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If parsing fails, use the raw text
          console.error('Failed to parse error response:', errorText);
          throw new Error('Failed to clear cart');
        }
        
        throw new Error(errorData?.error || 'Failed to clear cart');
      }
      
      // Reset local state
      setItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart. Please try again.');
      throw err;
    }
  };

  // Public method to force refresh the cart
  const refreshCart = async () => {
    return fetchCart();
  };

  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrice,
      isLoading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 