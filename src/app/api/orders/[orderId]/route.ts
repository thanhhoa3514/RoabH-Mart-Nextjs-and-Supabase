import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/services/supabase/orders/order.service';
import { OrderStatus, isValidStatusTransition } from '@/types/order/order-status.enum';

/**
 * PATCH /api/orders/[orderId]
 * Update order status
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const { orderId } = params;
        const body = await request.json();
        const { status } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            );
        }

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        // Update order status
        const result = await updateOrderStatus(parseInt(orderId, 10), status);

        if (result.error) {
            return NextResponse.json(
                { error: 'Failed to update order status' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Order status updated successfully',
            order: result.data
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
