import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import {
    constructWebhookEvent,
    handlePaymentSuccess,
    handlePaymentFailure,
} from '@/services/stripe/stripe.service';
import { getSupabaseClient } from '@/services/supabase/client.factory';
import { OrderStatus, PaymentStatus } from '@/types/order/order-status.enum';

// Store processed event IDs to prevent duplicate processing
const processedEvents = new Set<string>();

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
    try {
        // Get the raw body as text
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        if (!signature) {
            console.error('Missing stripe-signature header');
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 400 }
            );
        }

        // Verify webhook signature
        const { event, error } = constructWebhookEvent(body, signature);

        if (error || !event) {
            console.error('Webhook signature verification failed:', error);
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 400 }
            );
        }

        // Check for duplicate events (idempotency)
        if (processedEvents.has(event.id)) {
            console.log(`Duplicate event ${event.id} detected, skipping`);
            return NextResponse.json({ received: true });
        }

        console.log(`Processing webhook event: ${event.type} (${event.id})`);

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event);
                break;

            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Mark event as processed
        processedEvents.add(event.id);

        // Clean up old processed events (keep last 1000)
        if (processedEvents.size > 1000) {
            const eventsArray = Array.from(processedEvents);
            processedEvents.clear();
            eventsArray.slice(-500).forEach((id) => processedEvents.add(id));
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log(`Checkout session completed: ${session.id}`);

    // Only process if payment was successful
    if (session.payment_status !== 'paid') {
        console.log(`Payment status is ${session.payment_status}, not processing`);
        return;
    }

    const paymentData = handlePaymentSuccess(session);

    if (!paymentData.orderId) {
        console.error('No order ID found in session metadata');
        return;
    }

    const supabase = await getSupabaseClient();

    try {
        // Update order status to paid
        const { error: orderError } = await supabase
            .from('orders')
            .update({
                status: OrderStatus.PAID,
            })
            .eq('order_id', paymentData.orderId);

        if (orderError) {
            console.error('Error updating order status:', orderError);
            throw orderError;
        }

        // Update payment record
        const { error: paymentError } = await supabase
            .from('payments')
            .update({
                status: PaymentStatus.COMPLETED,
                transaction_id: paymentData.paymentIntentId,
                payment_date: new Date().toISOString(),
            })
            .eq('order_id', paymentData.orderId);

        if (paymentError) {
            console.error('Error updating payment record:', paymentError);
            throw paymentError;
        }

        console.log(`Order ${paymentData.orderId} marked as paid`);
    } catch (error) {
        console.error('Error processing checkout session:', error);
        throw error;
    }
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.log(`Payment intent succeeded: ${paymentIntent.id}`);

    // Extract order metadata
    const metadata = paymentIntent.metadata || {};
    const orderId = metadata.order_id ? parseInt(metadata.order_id, 10) : null;

    if (!orderId) {
        console.log('No order ID in payment intent metadata');
        return;
    }

    const supabase = await getSupabaseClient();

    try {
        // Update payment record with payment intent ID
        const { error } = await supabase
            .from('payments')
            .update({
                transaction_id: paymentIntent.id,
                status: PaymentStatus.COMPLETED,
                payment_date: new Date().toISOString(),
            })
            .eq('order_id', orderId);

        if (error) {
            console.error('Error updating payment intent:', error);
            throw error;
        }

        console.log(`Payment intent ${paymentIntent.id} recorded for order ${orderId}`);
    } catch (error) {
        console.error('Error processing payment intent:', error);
        throw error;
    }
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    console.log(`Payment intent failed: ${paymentIntent.id}`);

    const failureData = handlePaymentFailure(paymentIntent);

    if (!failureData.orderId) {
        console.log('No order ID in payment intent metadata');
        return;
    }

    const supabase = await getSupabaseClient();

    try {
        // Update payment record with failure information
        const { error } = await supabase
            .from('payments')
            .update({
                status: PaymentStatus.FAILED,
                transaction_id: paymentIntent.id,
            })
            .eq('order_id', failureData.orderId);

        if (error) {
            console.error('Error updating failed payment:', error);
            throw error;
        }

        console.log(`Payment failed for order ${failureData.orderId}: ${failureData.failureReason}`);
    } catch (error) {
        console.error('Error processing payment failure:', error);
        throw error;
    }
}

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
