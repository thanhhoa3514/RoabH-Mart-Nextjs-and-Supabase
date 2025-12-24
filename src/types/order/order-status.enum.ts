/**
 * Order status enum representing the complete order lifecycle
 * 
 * Status flow:
 * pending → paid → processing → shipped → delivered
 * 
 * Special statuses:
 * - cancelled: Order was cancelled by user or admin
 * - refunded: Payment was refunded
 * - failed: Payment failed
 */
export enum OrderStatus {
    /** Order created, awaiting payment */
    PENDING = 'pending',

    /** Payment confirmed, ready for fulfillment */
    PAID = 'paid',

    /** Order being prepared/packed */
    PROCESSING = 'processing',

    /** Order dispatched to customer */
    SHIPPED = 'shipped',

    /** Order received by customer */
    DELIVERED = 'delivered',

    /** Order cancelled before fulfillment */
    CANCELLED = 'cancelled',

    /** Payment refunded */
    REFUNDED = 'refunded',

    /** Payment failed */
    FAILED = 'failed',
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
    /** Payment pending */
    PENDING = 'pending',

    /** Payment completed successfully */
    COMPLETED = 'completed',

    /** Payment failed */
    FAILED = 'failed',

    /** Payment refunded */
    REFUNDED = 'refunded',

    /** Payment cancelled */
    CANCELLED = 'cancelled',
}

/**
 * Shipping status enum
 */
export enum ShippingStatus {
    /** Awaiting shipment */
    PENDING = 'pending',

    /** Being prepared */
    PROCESSING = 'processing',

    /** Shipped/in transit */
    SHIPPED = 'shipped',

    /** Out for delivery */
    OUT_FOR_DELIVERY = 'out_for_delivery',

    /** Delivered */
    DELIVERED = 'delivered',

    /** Delivery failed */
    FAILED = 'failed',

    /** Returned */
    RETURNED = 'returned',
}

/**
 * Valid order status transitions
 * Prevents invalid status changes
 */
export const VALID_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.FAILED],
    [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.REFUNDED, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
    [OrderStatus.CANCELLED]: [], // Terminal state
    [OrderStatus.REFUNDED]: [], // Terminal state
    [OrderStatus.FAILED]: [OrderStatus.PENDING], // Allow retry
};

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
): boolean {
    const allowedTransitions = VALID_ORDER_STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
}

/**
 * Get human-readable status label
 */
export function getOrderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
        [OrderStatus.PENDING]: 'Pending Payment',
        [OrderStatus.PAID]: 'Paid',
        [OrderStatus.PROCESSING]: 'Processing',
        [OrderStatus.SHIPPED]: 'Shipped',
        [OrderStatus.DELIVERED]: 'Delivered',
        [OrderStatus.CANCELLED]: 'Cancelled',
        [OrderStatus.REFUNDED]: 'Refunded',
        [OrderStatus.FAILED]: 'Payment Failed',
    };
    return labels[status] || status;
}

/**
 * Get status color for UI display
 */
export function getOrderStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
        [OrderStatus.PENDING]: 'yellow',
        [OrderStatus.PAID]: 'blue',
        [OrderStatus.PROCESSING]: 'purple',
        [OrderStatus.SHIPPED]: 'indigo',
        [OrderStatus.DELIVERED]: 'green',
        [OrderStatus.CANCELLED]: 'red',
        [OrderStatus.REFUNDED]: 'orange',
        [OrderStatus.FAILED]: 'red',
    };
    return colors[status] || 'gray';
}
