import Stripe from 'stripe';
import { stripe, STRIPE_CONFIG } from './stripe.config';

/**
 * Cart item for checkout
 */
export interface CheckoutCartItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

/**
 * Checkout session creation parameters
 */
export interface CreateCheckoutSessionParams {
    orderId: number;
    orderNumber: string;
    userId: number;
    cartItems: CheckoutCartItem[];
    shippingCost: number;
    taxAmount: number;
    totalAmount: number;
    customerEmail?: string;
}

/**
 * Create a Stripe Checkout session
 */
export async function createCheckoutSession(
    params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; sessionUrl: string; error?: string }> {
    try {
        // Convert cart items to Stripe line items
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.cartItems.map(
            (item) => ({
                price_data: {
                    currency: STRIPE_CONFIG.currency,
                    product_data: {
                        name: item.name,
                        images: item.image ? [item.image] : undefined,
                    },
                    unit_amount: Math.round(item.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            })
        );

        // Add shipping as a line item if applicable
        if (params.shippingCost > 0) {
            lineItems.push({
                price_data: {
                    currency: STRIPE_CONFIG.currency,
                    product_data: {
                        name: 'Shipping',
                    },
                    unit_amount: Math.round(params.shippingCost * 100),
                },
                quantity: 1,
            });
        }

        // Add tax as a line item if applicable
        if (params.taxAmount > 0) {
            lineItems.push({
                price_data: {
                    currency: STRIPE_CONFIG.currency,
                    product_data: {
                        name: 'Tax',
                    },
                    unit_amount: Math.round(params.taxAmount * 100),
                },
                quantity: 1,
            });
        }

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${STRIPE_CONFIG.successUrl}?order_number={CHECKOUT_SESSION_ID}`,
            cancel_url: STRIPE_CONFIG.cancelUrl,
            customer_email: params.customerEmail,
            client_reference_id: params.orderNumber,
            metadata: {
                order_id: params.orderId.toString(),
                order_number: params.orderNumber,
                user_id: params.userId.toString(),
            },
            expires_at: Math.floor(Date.now() / 1000) + STRIPE_CONFIG.checkoutSessionExpiration,
        });

        if (!session.url) {
            return {
                sessionId: '',
                sessionUrl: '',
                error: 'Failed to create checkout session URL',
            };
        }

        return {
            sessionId: session.id,
            sessionUrl: session.url,
        };
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        return {
            sessionId: '',
            sessionUrl: '',
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Construct and verify a webhook event from Stripe
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string
): { event: Stripe.Event | null; error?: string } {
    try {
        if (!STRIPE_CONFIG.webhookSecret) {
            return {
                event: null,
                error: 'Webhook secret is not configured',
            };
        }

        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            STRIPE_CONFIG.webhookSecret
        );

        return { event };
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return {
            event: null,
            error: error instanceof Error ? error.message : 'Invalid signature',
        };
    }
}

/**
 * Extract order metadata from Stripe session
 */
export function extractOrderMetadata(session: Stripe.Checkout.Session): {
    orderId: number | null;
    orderNumber: string | null;
    userId: number | null;
} {
    const metadata = session.metadata || {};

    return {
        orderId: metadata.order_id ? parseInt(metadata.order_id, 10) : null,
        orderNumber: metadata.order_number || null,
        userId: metadata.user_id ? parseInt(metadata.user_id, 10) : null,
    };
}

/**
 * Retrieve a checkout session by ID
 */
export async function retrieveCheckoutSession(
    sessionId: string
): Promise<{ session: Stripe.Checkout.Session | null; error?: string }> {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return { session };
    } catch (error) {
        console.error('Error retrieving checkout session:', error);
        return {
            session: null,
            error: error instanceof Error ? error.message : 'Failed to retrieve session',
        };
    }
}

/**
 * Retrieve a payment intent by ID
 */
export async function retrievePaymentIntent(
    paymentIntentId: string
): Promise<{ paymentIntent: Stripe.PaymentIntent | null; error?: string }> {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return { paymentIntent };
    } catch (error) {
        console.error('Error retrieving payment intent:', error);
        return {
            paymentIntent: null,
            error: error instanceof Error ? error.message : 'Failed to retrieve payment intent',
        };
    }
}

/**
 * Handle successful payment
 * Returns order metadata for processing
 */
export function handlePaymentSuccess(session: Stripe.Checkout.Session): {
    orderId: number | null;
    orderNumber: string | null;
    paymentIntentId: string | null;
    amountPaid: number;
    customerEmail: string | null;
} {
    const metadata = extractOrderMetadata(session);

    return {
        orderId: metadata.orderId,
        orderNumber: metadata.orderNumber,
        paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amountPaid: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
        customerEmail: session.customer_email || session.customer_details?.email || null,
    };
}

/**
 * Handle failed payment
 * Returns order metadata and failure reason
 */
export function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): {
    orderId: number | null;
    orderNumber: string | null;
    failureReason: string | null;
} {
    const metadata = paymentIntent.metadata || {};

    return {
        orderId: metadata.order_id ? parseInt(metadata.order_id, 10) : null,
        orderNumber: metadata.order_number || null,
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
    };
}
