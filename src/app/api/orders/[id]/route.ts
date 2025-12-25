import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrderById } from '@/services/supabase';
import { createClient } from '@/services/supabase/server';
import { requireRole } from '@/lib/auth/role-utils';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

// Lấy thông tin đơn hàng
export async function GET(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const { data, error } = await getOrderById(orderId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET order API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Update order status
 * Requires authentication and admin/manager role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
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

    // SECURITY: Verify user has admin/manager role (type-safe)
    const roleError = await requireRole(user.id, ['admin', 'manager']);

    if (roleError) {
      return NextResponse.json(
        { error: roleError.error },
        { status: roleError.status }
      );
    }

    // Update order status
    const result = await updateOrderStatus(parseInt(id, 10), status);

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
