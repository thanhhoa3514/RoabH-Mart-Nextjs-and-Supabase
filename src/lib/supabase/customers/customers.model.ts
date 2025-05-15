import { supabase } from '../client/client.model';
import { DbCustomer } from '@/types/user/customer.model';

// Get all customers with pagination
export async function getCustomers(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

    return { data: data as DbCustomer[], error, count };
}

// Get a single customer by ID
export async function getCustomerById(userId: number) {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

    return { data: data as DbCustomer | null, error };
}

// Search customers by name or email
export async function searchCustomers(query: string, page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .or(`username.ilike.%${query}%,email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(start, end);

    return { data: data as DbCustomer[], error, count };
}

// Create a new customer
export async function createCustomer(customer: Omit<DbCustomer, 'user_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('users')
        .insert({
            ...customer,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select();

    return { data: data as DbCustomer[], error };
}

// Update a customer
export async function updateCustomer(userId: number, customer: Partial<Omit<DbCustomer, 'user_id' | 'created_at'>>) {
    const { data, error } = await supabase
        .from('users')
        .update({
            ...customer,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

    return { data: data as DbCustomer[], error };
}

// Delete a customer (or set inactive)
export async function deleteCustomer(userId: number) {
    // Option 1: Actually delete the customer
    // const { data, error } = await supabase
    //     .from('users')
    //     .delete()
    //     .eq('user_id', userId);

    // Option 2: Set customer as inactive (soft delete)
    const { data, error } = await supabase
        .from('users')
        .update({
            is_active: false,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

    return { data: data as DbCustomer[], error };
}

// Get customer orders
export async function getCustomerOrders(userId: number, page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    const { data, error, count } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('order_date', { ascending: false })
        .range(start, end);

    return { data, error, count };
}

// Get customer statistics
export async function getCustomerStats(userId: number) {
    // Get total orders
    const { count: orderCount, error: orderError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Get total spent
    const { data: spentData, error: spentError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', userId);

    const totalSpent = spentData ? spentData.reduce((sum, order) => sum + order.total_amount, 0) : 0;

    // Get last order date
    const { data: lastOrder, error: lastOrderError } = await supabase
        .from('orders')
        .select('order_date')
        .eq('user_id', userId)
        .order('order_date', { ascending: false })
        .limit(1)
        .single();

    return {
        data: {
            totalOrders: orderCount || 0,
            totalSpent,
            lastOrderDate: lastOrder?.order_date || null
        },
        error: orderError || spentError || lastOrderError
    };
}

// Get customer addresses
export async function getCustomerAddresses(userId: number) {
    const { data, error } = await supabase
        .from('addresses')  // Assuming you have an 'addresses' table
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

    return { data, error };
} 