import { getSupabaseClient } from '../client.factory';

/**
 * Create a new order using the atomic RPC function
 */
export const createOrder = async (orderData: {
    user_id: string | number;
    total_amount: number;
    items: { product_id: string; quantity: number; unit_price: number; subtotal: number; }[];
    shipping?: { shipping_method: string; shipping_cost: number; };
    payment?: { amount: number; payment_method: string; transaction_id?: string; status: string; };
}) => {
    const supabase = await getSupabaseClient();

    // Call the Postgres function to handle order creation in a transaction
    const { data: orderId, error: rpcError } = await supabase.rpc('create_order_v1', {
        p_user_id: orderData.user_id,
        p_total_amount: orderData.total_amount,
        p_items: orderData.items,
        p_shipping: orderData.shipping || null,
        p_payment: orderData.payment || null
    });

    if (rpcError) {
        return { error: rpcError };
    }

    if (!orderId) {
        return { error: { message: 'Failed to create order' } };
    }

    // Get the complete order with all related data
    return getOrderById(orderId);
};

/**
 * Get all orders for a user with related information
 */
export const getOrdersByUser = async (userId: string | number) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('orders')
        .select(`
      *,
      order_items(*, product:products(*)),
      shipping_info(*),
      payments(*)
    `)
        .eq('user_id', userId)
        .order('order_date', { ascending: false });
};

/**
 * Get a specific order by ID with all related information
 */
export const getOrderById = async (orderId: string | number) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('orders')
        .select(`
      *,
      order_items(*, product:products(*)),
      shipping_info(*),
      payments(*)
    `)
        .eq('order_id', orderId)
        .single();
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId: string | number, status: string) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('orders')
        .update({ status })
        .eq('order_id', orderId)
        .select()
        .single();
};
