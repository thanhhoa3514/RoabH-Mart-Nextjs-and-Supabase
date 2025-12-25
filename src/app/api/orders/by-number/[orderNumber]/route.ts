import { NextRequest, NextResponse } from 'next/server';
import { getOrderByOrderNumber } from '@/services/supabase/orders/order.service';
import { createClient } from '@/services/supabase/server';

/**
 * GET /api/orders/[orderNumber]
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
            return NextResponse.json(
                { error: 'Order number is required' },
                { status: 400 }
            );
        }

        // SECURITY: Verify user is authenticated
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        // Fetch order data
        const result = await getOrderByOrderNumber(orderNumber);

        if (result.error || !result.data) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // SECURITY: Verify user owns this order
        if (result.data.order.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden - You do not have permission to view this order' },
                { status: 403 }
            );
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
