-- Migration: Create webhook events table for idempotency tracking
-- Created: 2025-12-24
-- Description: Creates a table to track processed Stripe webhook events
--              to prevent duplicate processing in serverless/multi-instance environments

-- Create webhook_events table
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    payload JSONB,
    status VARCHAR(50) DEFAULT 'processed' NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON public.webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON public.webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON public.webhook_events(processed_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);

-- Add comments for documentation
COMMENT ON TABLE public.webhook_events IS 'Tracks processed Stripe webhook events for idempotency in serverless environments';
COMMENT ON COLUMN public.webhook_events.event_id IS 'Unique Stripe event ID (e.g., evt_1234567890)';
COMMENT ON COLUMN public.webhook_events.event_type IS 'Stripe event type (e.g., checkout.session.completed)';
COMMENT ON COLUMN public.webhook_events.processed_at IS 'Timestamp when the event was successfully processed';
COMMENT ON COLUMN public.webhook_events.payload IS 'Full Stripe event payload for debugging';
COMMENT ON COLUMN public.webhook_events.status IS 'Processing status: processed, failed, or retrying';
COMMENT ON COLUMN public.webhook_events.error_message IS 'Error message if processing failed';

-- Create function to clean up old webhook events (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.webhook_events
    WHERE processed_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_old_webhook_events() IS 
'Deletes webhook events older than 30 days. Run this periodically via cron job.
Returns the number of deleted rows.';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.webhook_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.webhook_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.webhook_events_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.webhook_events_id_seq TO service_role;

-- Enable Row Level Security
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (service_role can access all, authenticated users cannot access)
CREATE POLICY "Service role can manage webhook events"
    ON public.webhook_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Prevent regular authenticated users from accessing webhook events
CREATE POLICY "Authenticated users cannot access webhook events"
    ON public.webhook_events
    FOR ALL
    TO authenticated
    USING (false)
    WITH CHECK (false);
