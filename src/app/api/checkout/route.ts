import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/services/stripe/stripe.service';
import { createOrder } from '@/services/supabase/orders/order.service';
import { ResponseHelper } from '@/utils/api-response';

/**
 * Checkout request body interface
 */
interface CheckoutRequest {
    cartItems: Array<{
        product_id: string;
        quantity: number;
        price: number;
        name: string;
        image?: string;
    }>;
    shippingInfo: {
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        province: string;
        postalCode: string;
    };
    totals: {
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
    };
    userId: number;
}

interface CheckoutCartItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

/**
 * POST /api/checkout
 * Create a pending order and Stripe Checkout session
 */
export async function POST(request: NextRequest) {
    try {
        const body: CheckoutRequest = await request.json();

        // Validate request body
        if (!body.cartItems || body.cartItems.length === 0) {
            return ResponseHelper.badRequest('Cart is empty');
        }

        if (!body.userId) {
            return ResponseHelper.badRequest('User ID is required');
        }

        if (!body.shippingInfo || !body.shippingInfo.email) {
            return ResponseHelper.badRequest('Shipping information is required');
        }

        // Prepare order data
        const orderData = {
            user_id: body.userId,
            total_amount: body.totals.total,
            items: body.cartItems.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.price,
                subtotal: item.price * item.quantity,
            })),
            shipping: {
                shipping_method: 'Standard Shipping',
                shipping_cost: body.totals.shipping,
            },
            payment: {
                payment_method: 'Stripe',
                amount: body.totals.total,
                status: 'pending',
            },
        };

        // Create order with pending status
        const orderResult = await createOrder(orderData);

        if (orderResult.error || !orderResult.data) {
            console.error('Error creating order:', orderResult.error);
            return ResponseHelper.internalServerError('Failed to create order', orderResult.error);
        }

        const order = orderResult.data.order;

        // Create Stripe Checkout session
        const checkoutItems: CheckoutCartItem[] = body.cartItems.map((item) => ({
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
        }));

        const stripeSession = await createCheckoutSession({
            orderId: order.order_id,
            orderNumber: order.order_number,
            userId: body.userId,
            cartItems: checkoutItems,
            shippingCost: body.totals.shipping,
            taxAmount: body.totals.tax,
            totalAmount: body.totals.total,
            customerEmail: body.shippingInfo.email,
        });

        if (stripeSession.error || !stripeSession.sessionUrl) {
            console.error('Error creating Stripe session:', stripeSession.error);
            return ResponseHelper.internalServerError('Failed to create payment session', stripeSession.error);
        }

        // Return session details
        return ResponseHelper.success({
            sessionId: stripeSession.sessionId,
            sessionUrl: stripeSession.sessionUrl,
            orderId: order.order_id,
            orderNumber: order.order_number,
        });
    } catch (error) {
        console.error('Checkout API error:', error);
        return ResponseHelper.internalServerError('Internal server error', error);
    }
}
