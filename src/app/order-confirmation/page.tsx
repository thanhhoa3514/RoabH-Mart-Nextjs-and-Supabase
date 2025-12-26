'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Truck,
    ShoppingBag,
    ArrowRight,
    Clock,
    Calendar,

    CreditCard,
    Package,
    AlertCircle,

} from 'lucide-react';
import Link from 'next/link';

import { OrderStatus, PaymentStatus, getOrderStatusLabel } from '@/types/order/order-status.enum';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

/**
 * Get complete Tailwind class names for order status badge
 * Note: Tailwind requires complete class names at build time - no dynamic interpolation!
 */
function getOrderStatusBadgeClasses(status: OrderStatus | string): string {
    const statusLower = typeof status === 'string' ? status.toLowerCase() : status;

    // Return complete class names (not dynamic) for Tailwind JIT compiler
    const baseClasses = 'inline-block px-3 py-1 rounded-full text-sm font-medium';

    switch (statusLower) {
        case OrderStatus.PENDING:
        case 'pending':
            return `${baseClasses} bg-yellow-100 text-yellow-800`;
        case OrderStatus.PAID:
        case 'paid':
            return `${baseClasses} bg-green-100 text-green-800`;
        case OrderStatus.PROCESSING:
        case 'processing':
            return `${baseClasses} bg-blue-100 text-blue-800`;
        case OrderStatus.SHIPPED:
        case 'shipped':
            return `${baseClasses} bg-purple-100 text-purple-800`;
        case OrderStatus.DELIVERED:
        case 'delivered':
            return `${baseClasses} bg-green-100 text-green-800`;
        case OrderStatus.CANCELLED:
        case 'cancelled':
            return `${baseClasses} bg-red-100 text-red-800`;
        case OrderStatus.FAILED:
        case 'failed':
            return `${baseClasses} bg-red-100 text-red-800`;
        case OrderStatus.REFUNDED:
        case 'refunded':
            return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
}

interface OrderData {
    order: {
        order_id: number;
        order_number: string;
        total_amount: number;
        status: string;
        order_date: string;
        tax_amount: number;
        shipping_cost: number;
        discount_amount: number;
    };
    orderItems: Array<{
        order_item_id: number;
        product_id: number;
        quantity: number;
        unit_price: number;
        subtotal: number;
        products: {
            name: string;
            product_id: number;
        };
    }>;
    payment: {
        payment_id: number;
        amount: number;
        payment_method: string;
        status: string;
        payment_date: string;
        transaction_id: string | null;
    } | null;
    shipping: {
        shipping_id: number;
        shipping_method: string;
        shipping_cost: number;
        status: string;
        estimated_delivery: string | null;
    } | null;
}

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    // Get order number from URL query parameter
    // This is the actual ORDER NUMBER (e.g., ORD-2024-ABC123), NOT the Stripe session ID
    // It's passed from the Stripe success_url after successful payment
    const orderNumber = searchParams.get('order_number');

    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrderData = useCallback(async () => {
        if (!orderNumber) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/orders/by-number/${orderNumber}`);

            if (!response.ok) {
                throw new Error('Failed to fetch order');
            }

            const data = await response.json();
            setOrderData(data);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    }, [orderNumber]);

    useEffect(() => {
        if (!orderNumber) {
            setError('No order number provided');
            setIsLoading(false);
            return;
        }

        fetchOrderData();
    }, [orderNumber, fetchOrderData]);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-50 p-8">
                    <div className="animate-pulse">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-200 rounded-full"></div>
                        <div className="h-8 bg-green-200 rounded w-2/3 mx-auto mb-2"></div>
                        <div className="h-4 bg-green-200 rounded w-1/2 mx-auto"></div>
                    </div>
                </div>
                <div className="p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-red-50 p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Order Not Found</h1>
                    <p className="text-gray-600 mt-2">
                        {error || 'We couldn\'t find your order. Please check the order number and try again.'}
                    </p>
                    <Link href="/" className="mt-6">
                        <button className="px-6 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600">
                            Return to Home
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const isPaid = orderData.payment?.status === PaymentStatus.COMPLETED;
    const isPending = orderData.order.status === OrderStatus.PENDING;
    const estimatedDelivery = orderData.shipping?.estimated_delivery
        ? new Date(orderData.shipping.estimated_delivery).toLocaleDateString()
        : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString();

    return (
        <motion.div
            className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <div className={`${isPaid ? 'bg-green-50' : 'bg-yellow-50'} p-8 flex flex-col items-center justify-center text-center`}>
                <div className={`w-16 h-16 mb-4 ${isPaid ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center`}>
                    {isPaid ? (
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    ) : (
                        <Clock className="h-10 w-10 text-yellow-600" />
                    )}
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                    {isPaid ? 'Thank You for Your Order!' : 'Order Received'}
                </h1>
                <p className="text-gray-600 mt-2">
                    {isPaid
                        ? 'Your payment has been confirmed and your order will be shipping soon.'
                        : 'Your order has been created. Complete payment to proceed with shipping.'}
                </p>
            </div>

            {/* Order Info */}
            <div className="p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
                    <motion.div variants={itemVariants} className="mb-4 md:mb-0">
                        <h2 className="text-sm text-gray-500">Order Number</h2>
                        <p className="text-lg font-semibold">#{orderData.order.order_number}</p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h2 className="text-sm text-gray-500">Order Date</h2>
                        <p className="text-lg font-semibold">
                            {new Date(orderData.order.order_date).toLocaleDateString()}
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <h2 className="text-sm text-gray-500">Order Status</h2>
                        <span className={getOrderStatusBadgeClasses(orderData.order.status as OrderStatus)}>
                            {getOrderStatusLabel(orderData.order.status as OrderStatus)}
                        </span>
                    </motion.div>
                </div>

                {/* Payment Status Alert */}
                {isPending && (
                    <motion.div variants={itemVariants} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                            <div>
                                <h3 className="font-medium text-yellow-800">Payment Pending</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Your order is awaiting payment confirmation. If you haven&apos;t completed payment, please return to the checkout page.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Order Items */}
                <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-amber-500" />
                        Order Items
                    </h2>

                    <div className="space-y-4">
                        {orderData.orderItems.map((item) => (
                            <div key={item.order_item_id} className="flex justify-between items-center border-b pb-4 last:border-b-0">
                                <div className="flex-1">
                                    <p className="font-medium">{item.products.name}</p>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                                    <p className="text-sm text-gray-500">${item.unit_price.toFixed(2)} each</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Order Summary */}
                <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-2 text-amber-500" />
                        Order Summary
                    </h2>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>${(orderData.order.total_amount - orderData.order.shipping_cost - orderData.order.tax_amount + orderData.order.discount_amount).toFixed(2)}</span>
                        </div>

                        {orderData.order.discount_amount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-${orderData.order.discount_amount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span>${orderData.order.shipping_cost.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span>${orderData.order.tax_amount.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between font-bold text-lg pt-3 border-t">
                            <span>Total</span>
                            <span>${orderData.order.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Payment Info */}
                {orderData.payment && (
                    <motion.div variants={itemVariants} className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-amber-500" />
                            Payment Information
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method</span>
                                <span>{orderData.payment.payment_method}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Status</span>
                                <span className={`font-medium ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {isPaid ? 'Paid' : 'Pending'}
                                </span>
                            </div>

                            {orderData.payment.payment_date && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Date</span>
                                    <span>{new Date(orderData.payment.payment_date).toLocaleDateString()}</span>
                                </div>
                            )}

                            {orderData.payment.transaction_id && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transaction ID</span>
                                    <span className="text-sm font-mono">{orderData.payment.transaction_id}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Shipping Info */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h2 className="text-lg font-semibold mb-3 flex items-center">
                            <Truck className="h-5 w-5 mr-2 text-amber-500" />
                            Shipping Info
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <Clock className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                                <div>
                                    <p className="text-sm text-gray-500">Estimated Delivery Date</p>
                                    <p className="font-medium">{estimatedDelivery}</p>
                                </div>
                            </div>

                            {orderData.shipping && (
                                <div className="flex items-start">
                                    <Package className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                                    <div>
                                        <p className="text-sm text-gray-500">Shipping Method</p>
                                        <p className="font-medium">{orderData.shipping.shipping_method}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-3 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-amber-500" />
                            Next Steps
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {isPaid
                                ? "We'll send you shipping confirmation when your item(s) are on the way! You can check the status of your order at any time by visiting your account."
                                : "Complete your payment to proceed with order processing. Once payment is confirmed, we'll begin preparing your order for shipment."}
                        </p>
                    </div>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <Link href="/account/orders" className="flex-1">
                        <button className="w-full py-3 border border-amber-500 text-amber-500 rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50">
                            View Order Status
                        </button>
                    </Link>

                    <Link href="/" className="flex-1">
                        <button className="w-full py-3 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 flex items-center justify-center">
                            Continue Shopping
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <Suspense fallback={
                <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-green-50 p-8">
                        <div className="animate-pulse">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-200 rounded-full"></div>
                            <div className="h-8 bg-green-200 rounded w-2/3 mx-auto mb-2"></div>
                            <div className="h-4 bg-green-200 rounded w-1/2 mx-auto"></div>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-32 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            }>
                <OrderConfirmationContent />
            </Suspense>
        </div>
    );
}
