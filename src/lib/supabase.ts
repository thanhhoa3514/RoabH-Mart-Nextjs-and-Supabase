import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client with secure cookie storage for auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'auth-storage',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disable automatic detection of auth tokens in URL
    },
});

// Authentication helpers
export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    return { data, error };
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

// Database helpers
export async function getProducts(category?: string, search?: string) {
    let query = supabase.from('products').select('*');

    if (category) {
        query = query.eq('category', category);
    }

    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;
    return { data, error };
}

export async function getProductById(id: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
    return { data, error };
}

export async function getUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

export async function createOrder(orderData: any) {
    const { data, error } = await supabase
        .from('orders')
        .insert([orderData]);
    return { data, error };
} 