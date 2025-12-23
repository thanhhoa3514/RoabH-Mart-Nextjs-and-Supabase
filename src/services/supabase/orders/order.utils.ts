import { CartItem } from '@/types/supabase';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Transform cart items to order items
 */
export const cartItemsToOrderItems = (
    cartItems: CartItem[]
): {
    product_id: number;
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
 * Generate an order reference number (for display)
 */
export const generateOrderReference = (orderId: string): string => {
    const shortId = orderId.slice(0, 8).toUpperCase();
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    return `RM-${year}${month}-${shortId}`;
};
