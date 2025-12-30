-- Migration: Create RPC function for atomic order and payment status updates
-- Created: 2025-12-24
-- Description: Creates a PostgreSQL function to update both order and payment status
--              in a single atomic transaction to prevent data inconsistency

-- Drop function if exists (for idempotency)
DROP FUNCTION IF EXISTS update_order_payment_status_v1(integer, varchar, varchar, varchar);

-- Create function to update order and payment status atomically
CREATE OR REPLACE FUNCTION update_order_payment_status_v1(
    p_order_id INTEGER,
    p_order_status VARCHAR,
    p_payment_status VARCHAR,
    p_transaction_id VARCHAR DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_order_updated BOOLEAN := FALSE;
    v_payment_updated BOOLEAN := FALSE;
BEGIN
    -- Start transaction (implicit in function)
    
    -- Update order status
    UPDATE public.orders
    SET status = p_order_status
    WHERE order_id = p_order_id;
    
    -- Check if order was updated
    GET DIAGNOSTICS v_order_updated = ROW_COUNT > 0;
    
    IF NOT v_order_updated THEN
        RAISE EXCEPTION 'Order with ID % not found', p_order_id;
    END IF;
    
    -- Update payment status
    UPDATE public.payments
    SET 
        status = p_payment_status,
        payment_date = CURRENT_TIMESTAMP,
        transaction_id = COALESCE(p_transaction_id, transaction_id)
    WHERE order_id = p_order_id;
    
    -- Check if payment was updated
    GET DIAGNOSTICS v_payment_updated = ROW_COUNT > 0;
    
    IF NOT v_payment_updated THEN
        RAISE EXCEPTION 'Payment record for order ID % not found', p_order_id;
    END IF;
    
    -- Return success result
    v_result := json_build_object(
        'success', TRUE,
        'order_id', p_order_id,
        'order_status', p_order_status,
        'payment_status', p_payment_status,
        'updated_at', CURRENT_TIMESTAMP
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback happens automatically on exception
        RAISE EXCEPTION 'Failed to update order and payment status: %', SQLERRM;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION update_order_payment_status_v1(INTEGER, VARCHAR, VARCHAR, VARCHAR) IS 
'Atomically updates both order status and payment status in a single transaction. 
Used by Stripe webhook handlers to ensure data consistency.
Parameters:
  - p_order_id: The order ID to update
  - p_order_status: New order status (e.g., paid, processing, shipped)
  - p_payment_status: New payment status (e.g., completed, failed)
  - p_transaction_id: Optional Stripe transaction/payment intent ID
Returns: JSON object with success status and updated values';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_order_payment_status_v1(INTEGER, VARCHAR, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION update_order_payment_status_v1(INTEGER, VARCHAR, VARCHAR, VARCHAR) TO service_role;
