import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/services/supabase/orders/order.service';
import { createClient } from '@/services/supabase/server';

/**
 * PATCH /api/orders/[orderId]
 * Update order status
 * Requires authentication and admin/manager role
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

        // SECURITY: Verify user is authenticated
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        // SECURITY: Verify user has admin/manager role
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role_id, roles(role_name)')
            .eq('user_id', user.id)
            .single();

        if (profileError || !userProfile) {
            return NextResponse.json(
                { error: 'User profile not found' },
                { status: 403 }
            );
        }

        // Check if user has admin or manager role
        const roleName = (userProfile.roles as any)?.role_name?.toLowerCase();
        const isAuthorized = roleName === 'admin' || roleName === 'manager';

        if (!isAuthorized) {
            return NextResponse.json(
                { error: 'Forbidden - Only admins and managers can update order status' },
                { status: 403 }
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
