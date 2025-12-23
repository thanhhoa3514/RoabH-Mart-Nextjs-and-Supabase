import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, getOrderById } from '@/services/supabase';

type Context = {
  params: {
    id: string;
  };
};

// Lấy thông tin đơn hàng
export async function GET(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    const orderId = parseInt(context.params.id);

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

// Cập nhật trạng thái đơn hàng
export async function PATCH(
  request: NextRequest,
  context: Context
): Promise<NextResponse> {
  try {
    const orderId = parseInt(context.params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Lấy dữ liệu từ request body
    const requestBody = await request.json();

    if (!requestBody.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Kiểm tra status có hợp lệ không
    const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(requestBody.status.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid status. Status must be one of: pending, processing, shipped, completed, cancelled' },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái đơn hàng
    const { data, error } = await updateOrderStatus(orderId, requestBody.status.toLowerCase());

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${requestBody.status}`,
      data
    });
  } catch (error) {
    console.error('Error in PATCH order API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 