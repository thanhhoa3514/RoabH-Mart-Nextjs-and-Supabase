import { supabase } from '../client/client.model';

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