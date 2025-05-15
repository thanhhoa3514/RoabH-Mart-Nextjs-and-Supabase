import { supabase } from '../client/client.model';

export async function getProducts(category?: string, search?: string) {
    let query = supabase
        .from('products')
        .select(`
            *,
            product_images(image_url, is_primary)
        `);

    if (category) {
        query = query.eq('category', category);
    }

    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    // Default order by name
    query = query.order('name', { ascending: true });

    const { data, error } = await query;
    return { data, error };
}

export async function getProductById(id: string) {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            product_images(image_url, is_primary)
        `)
        .eq('product_id', id)
        .single();
    return { data, error };
}

export async function getFeaturedProducts(limit: number = 4) {
    // Lấy sản phẩm có discount cao nhất và hình ảnh của chúng
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            product_images(image_url, is_primary)
        `)
        .eq('is_active', true)
        .order('discount_percentage', { ascending: false })
        .limit(limit);

    return { data, error };
} 