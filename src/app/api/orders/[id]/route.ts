import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrderById } from '@/services/supabase';
import { createClient } from '@/services/supabase/server';
import { requireRole } from '@/lib/auth/role-utils';
import { ResponseHelper } from '@/utils/api-response';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

// Get order by ID
export async function GET(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return ResponseHelper.badRequest('Invalid order ID');
    }

    const { data, error } = await getOrderById(orderId);

    if (error) {
      return ResponseHelper.internalServerError('Failed to fetch order', error);
    }

    if (!data) {
      return ResponseHelper.notFound('Order not found');
    }

    return ResponseHelper.success(data);
  } catch (error) {
    console.error('Error in GET order API:', error);
    return ResponseHelper.internalServerError('Internal server error', error);
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
      return ResponseHelper.badRequest('Order ID is required');
    }

    if (!status) {
      return ResponseHelper.badRequest('Status is required');
    }

    // SECURITY: Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return ResponseHelper.unauthorized('Please log in');
    }

    // SECURITY: Verify user has admin/manager role (type-safe)
    const roleError = await requireRole(user.id, ['admin', 'manager']);

    if (roleError) {
      return ResponseHelper.forbidden(roleError.error);
    }

    // Update order status
    const result = await updateOrderStatus(parseInt(id, 10), status);

    if (result.error) {
      return ResponseHelper.internalServerError('Failed to update order status', result.error);
    }

    return ResponseHelper.success({
      message: 'Order status updated successfully',
      order: result.data
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return ResponseHelper.internalServerError('Internal server error', error);
  }
}
