import { supabase } from '../client/client.model';

export async function getProducts(category?: string, search?: string) {
    let query = supabase
        .from('products')
        .select(`
            *,
            product_images(image_url, is_primary),
            subcategories(*, categories(*))
        `);

    if (category) {
        // Join để tìm theo category name
        query = query.eq('subcategories.categories.name', category);
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
            product_images(image_url, is_primary),
            subcategories(*, categories(*))
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
            product_images(image_url, is_primary),
            subcategories(*, categories(*))
        `)
        .eq('is_active', true)
        .order('discount_percentage', { ascending: false })
        .limit(limit);

    return { data, error };
}

export async function createProduct(productData: {
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    subcategory_id: number;
    seller_id: number;
    is_active: boolean;
    discount_percentage?: number;
    sku?: string;
}) {
    // Insert the product into the products table
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();
    
    return { data, error };
}

export async function addProductImage(productId: number, imageUrl: string, isPrimary: boolean = false) {
    const { data, error } = await supabase
        .from('product_images')
        .insert([
            { 
                product_id: productId,
                image_url: imageUrl,
                is_primary: isPrimary 
            }
        ]);
    
    return { data, error };
} 