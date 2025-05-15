import { supabase } from '../client/client.model';
import { DbOrder } from '../../../types/order/order.model';

// Get all orders with pagination
export async function getOrders(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('order_date', { ascending: false })
        .range(start, end);

    return { data: data as DbOrder[], error, count };
}

// Get a single order by ID with all related information
export async function getOrderById(orderId: number) {
    // Get the order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

    if (orderError || !order) {
        return { error: orderError, data: null };
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products(name, image)')
        .eq('order_id', orderId);

    if (itemsError) {
        return { error: itemsError, data: { order } };
    }

    // Get payment information
    const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .single();

    // Get shipping information
    const { data: shipping, error: shippingError } = await supabase
        .from('shipping_info')
        .select('*')
        .eq('order_id', orderId)
        .single();

    // Get user information
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('user_id, username, email')
        .eq('user_id', order.user_id)
        .single();

    return {
        data: {
            order,
            orderItems,
            payment,
            shipping,
            user
        },
        error: orderError || itemsError || paymentError || shippingError || userError
    };
}

// Get orders by user ID
export async function getOrdersByUserId(userId: number, page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('order_date', { ascending: false })
        .range(start, end);

    return { data: data as DbOrder[], error, count };
}

// Update order status
export async function updateOrderStatus(orderId: number, status: string) {
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('order_id', orderId)
        .select();

    return { data: data as DbOrder[], error };
}

// Create a new order
export async function createOrder(orderData: {
    user_id: number;
    total_amount: number;
    items: Array<{
        product_id: number;
        quantity: number;
        unit_price: number;
    }>;
    shipping_info: {
        shipping_method: string;
        shipping_cost: number;
    };
    payment_info: {
        payment_method: string;
        amount: number;
    };
}) {
    // Start a transaction
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: orderData.user_id,
            order_number: generateOrderNumber(),
            total_amount: orderData.total_amount,
            status: 'pending'
        })
        .select()
        .single();

    if (orderError || !order) {
        return { error: orderError, data: null };
    }

    // Insert order items
    const orderItems = orderData.items.map(item => ({
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

    if (itemsError) {
        return { error: itemsError, data: { order } };
    }

    // Insert shipping information
    const { error: shippingError } = await supabase
        .from('shipping_info')
        .insert({
            order_id: order.order_id,
            shipping_method: orderData.shipping_info.shipping_method,
            shipping_cost: orderData.shipping_info.shipping_cost,
            status: 'processing'
        });

    if (shippingError) {
        return { error: shippingError, data: { order } };
    }

    // Insert payment information
    const { error: paymentError } = await supabase
        .from('payments')
        .insert({
            order_id: order.order_id,
            amount: orderData.payment_info.amount,
            payment_method: orderData.payment_info.payment_method,
            status: 'pending'
        });

    if (paymentError) {
        return { error: paymentError, data: { order } };
    }

    return { data: { order }, error: null };
}

// Helper function to generate a unique order number
function generateOrderNumber() {
    const timestamp = new Date().getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
} 