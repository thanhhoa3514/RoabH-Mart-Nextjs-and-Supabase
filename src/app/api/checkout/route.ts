import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, CheckoutCartItem } from '@/services/stripe/stripe.service';
import { createOrder } from '@/services/supabase/orders/order.service';
import { OrderStatus } from '@/types/order/order-status.enum';

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

/**
 * POST /api/checkout
 * Create a pending order and Stripe Checkout session
 */
export async function POST(request: NextRequest) {
    try {
        const body: CheckoutRequest = await request.json();

        // Validate request body
        if (!body.cartItems || body.cartItems.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        if (!body.userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (!body.shippingInfo || !body.shippingInfo.email) {
            return NextResponse.json(
                { error: 'Shipping information is required' },
                { status: 400 }
            );
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
            return NextResponse.json(
                { error: 'Failed to create order' },
                { status: 500 }
            );
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
            return NextResponse.json(
                { error: 'Failed to create payment session' },
                { status: 500 }
            );
        }

        // Return session details
        return NextResponse.json({
            sessionId: stripeSession.sessionId,
            sessionUrl: stripeSession.sessionUrl,
            orderId: order.order_id,
            orderNumber: order.order_number,
        });
    } catch (error) {
        console.error('Checkout API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
