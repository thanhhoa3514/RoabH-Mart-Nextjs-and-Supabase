import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

/**
 * Stripe client instance configured with secret key
 * API version is NOT explicitly set - uses the SDK's default pinned version
 * stripe-node v20.1.0 is pinned to '2024-11-20.acacia'
 * This ensures compatibility and prevents version-specific feature mismatches
 * 
 * Note: Explicitly setting apiVersion to a newer version than the SDK supports
 * can cause TypeScript errors and runtime issues. Always use the SDK's default
 * unless you have a specific, tested reason to override it.
 * 
 * @see https://github.com/stripe/stripe-node/blob/master/CHANGELOG.md
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    // apiVersion omitted - uses SDK's default (2024-11-20.acacia for v20.1.0)
    // Explicitly setting a newer version causes type errors and potential runtime issues
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
