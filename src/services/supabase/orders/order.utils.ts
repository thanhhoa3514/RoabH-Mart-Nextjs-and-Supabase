import { CartItem } from '@/types/supabase';
import { OrderStatus } from '@/types/order/order-status.enum';

/**
 * @deprecated Use OrderStatus enum from '@/types/order/order-status.enum' instead
 * This type is kept for backward compatibility but will be removed in future versions
 */
export type OrderStatusLegacy = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

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
 * @deprecated Use getOrderStatusLabel from '@/types/order/order-status.enum' instead
 * This function is kept for backward compatibility but will be removed in future versions
 */
export const getOrderStatusLabelLegacy = (status: OrderStatus | string): string => {
    const statusLower = typeof status === 'string' ? status.toLowerCase() : status;

    switch (statusLower) {
        case OrderStatus.PENDING:
        case 'pending':
            return 'Awaiting Payment';
        case OrderStatus.PROCESSING:
        case 'processing':
            return 'Processing';
        case OrderStatus.SHIPPED:
        case 'shipped':
            return 'Shipped';
        case OrderStatus.DELIVERED:
        case 'delivered':
            return 'Delivered';
        case OrderStatus.CANCELLED:
        case 'cancelled':
            return 'Cancelled';
        case OrderStatus.PAID:
        case 'paid':
            return 'Paid';
        case OrderStatus.FAILED:
        case 'failed':
            return 'Payment Failed';
        case OrderStatus.REFUNDED:
        case 'refunded':
            return 'Refunded';
        default:
            return 'Unknown Status';
    }
};

/**
 * Check if an order can be cancelled
 */
export const canCancelOrder = (status: OrderStatus | string): boolean => {
    const statusLower = typeof status === 'string' ? status.toLowerCase() : status;
    // Only pending and processing orders can be cancelled
    return statusLower === OrderStatus.PENDING ||
        statusLower === OrderStatus.PROCESSING ||
        statusLower === 'pending' ||
        statusLower === 'processing';
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

