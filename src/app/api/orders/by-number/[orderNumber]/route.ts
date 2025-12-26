import { NextRequest, NextResponse } from 'next/server';
import { getOrderByOrderNumber } from '@/services/supabase/orders/order.service';
import { createClient } from '@/services/supabase/server';
import { ResponseHelper } from '@/utils/api-response';

/**
 * GET /api/orders/by-number/[orderNumber]
 * Fetch order details by order number
 * Requires authentication and verifies user owns the order
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { orderNumber: string } }
) {
    try {
        const { orderNumber } = params;

        if (!orderNumber) {
            return ResponseHelper.badRequest('Order number is required');
        }

        // SECURITY: Verify user is authenticated
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return ResponseHelper.unauthorized('Please log in');
        }

        // Fetch order data
        const result = await getOrderByOrderNumber(orderNumber);

        if (result.error || !result.data) {
            return ResponseHelper.notFound('Order not found');
        }

        // SECURITY: Verify user owns this order
        if (result.data.order.user_id !== user.id) {
            return ResponseHelper.forbidden('You do not have permission to view this order');
        }

        return ResponseHelper.success(result.data);
    } catch (error) {
        console.error('Error fetching order:', error);
        return ResponseHelper.internalServerError('Internal server error', error);
    }
}
