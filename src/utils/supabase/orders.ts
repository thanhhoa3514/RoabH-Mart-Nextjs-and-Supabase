/**
 * Order-related helper functions for Supabase
 */

import { createOrder, getOrderById, getOrdersByUser } from '@/lib/supabase/db';
import { Order, CartItem, OrderItem } from '@/types/supabase';
import { ORDER_STATUS } from '@/lib/constants';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Create a new order
 */
export const createNewOrder = async (orderData: {
  user_id: string;
  total_amount: number;
  items: { product_id: string; quantity: number; unit_price: number; subtotal: number; }[];
  shipping?: { shipping_method: string; shipping_cost: number; };
  payment?: { amount: number; payment_method: string; transaction_id?: string; status: string; };
}) => {
  return createOrder(orderData);
};

/**
 * Get a specific order by ID
 */
export const fetchOrderById = async (orderId: string) => {
  return getOrderById(orderId);
};

/**
 * Get all orders for a user
 */
export const fetchUserOrders = async (userId: string) => {
  return getOrdersByUser(userId);
};

/**
 * Transform cart items to order items
 */
export const cartItemsToOrderItems = (
  cartItems: CartItem[],
  orderId: string
): {
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}[] => {
  return cartItems
    .filter(item => item.product) // Filter out items without product
    .map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.product!.price,
      subtotal: item.product!.price * item.quantity,
    }));
};

/**
 * Calculate order total from cart items
 */
export const calculateOrderTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce(
    (total, item) => {
      // Check if product exists before using its price
      if (item.product) {
        return total + item.product.price * item.quantity;
      }
      return total;
    },
    0
  );
};

/**
 * Get readable status label
 */
export const getOrderStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case 'pending':
      return 'Awaiting Payment';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown Status';
  }
};

/**
 * Check if an order can be cancelled
 */
export const canCancelOrder = (status: OrderStatus): boolean => {
  // Only pending and processing orders can be cancelled
  return status === 'pending' || status === 'processing';
};

/**
 * Generate an order reference number
 */
export const generateOrderReference = (orderId: string): string => {
  // Extract first 8 characters from UUID and convert to uppercase
  const shortId = orderId.slice(0, 8).toUpperCase();
  
  // Add a prefix and current date
  const date = new Date();
  const year = date.getFullYear().toString().slice(2); // Get last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
  
  return `RM-${year}${month}-${shortId}`;
};
