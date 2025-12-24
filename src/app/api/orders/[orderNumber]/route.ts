import { NextRequest, NextResponse } from 'next/server';
import { getOrderByOrderNumber } from '@/services/supabase/orders/order.service';

/**
 * GET /api/orders/[orderNumber]
 * Fetch order details by order number
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

        // Fetch order data
        const result = await getOrderByOrderNumber(orderNumber);

        if (result.error || !result.data) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
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
