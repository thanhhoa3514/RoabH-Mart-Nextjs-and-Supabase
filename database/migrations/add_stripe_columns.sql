-- Migration: Add Stripe integration columns to orders and payments tables
-- Created: 2025-12-24
-- Description: Adds stripe_session_id and stripe_checkout_url to orders table,
--              and stripe_payment_intent_id to payments table

-- Add Stripe session tracking to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_checkout_url TEXT;

-- Add index for faster lookups by Stripe session ID
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id 
ON public.orders(stripe_session_id);

-- Add Stripe payment intent to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

-- Add index for faster lookups by Stripe payment intent ID
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id 
ON public.payments(stripe_payment_intent_id);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.stripe_session_id IS 'Stripe Checkout session ID for tracking payment sessions';
COMMENT ON COLUMN public.orders.stripe_checkout_url IS 'Stripe Checkout URL for redirecting users to payment';
COMMENT ON COLUMN public.payments.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking individual payments';
