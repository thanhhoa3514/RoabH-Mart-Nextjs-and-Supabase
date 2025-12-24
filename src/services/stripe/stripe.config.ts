import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

/**
 * Stripe client instance configured with secret key
 * Uses the latest API version for consistency
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});

/**
 * Stripe configuration constants
 */
export const STRIPE_CONFIG = {
    // Webhook secret for signature verification
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

    // Publishable key for client-side (exposed to frontend)
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',

    // Currency
    currency: 'usd',

    // Checkout session expiration (24 hours in seconds)
    checkoutSessionExpiration: 86400,

    // Success and cancel URLs
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-confirmation`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
} as const;

/**
 * Validate Stripe configuration
 */
export function validateStripeConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!process.env.STRIPE_SECRET_KEY) {
        errors.push('STRIPE_SECRET_KEY is missing');
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        errors.push('STRIPE_WEBHOOK_SECRET is missing (required for webhook verification)');
    }

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing');
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
        console.warn('NEXT_PUBLIC_APP_URL is not set, using default: http://localhost:3000');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
