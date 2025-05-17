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
            subcategories(*, categories(*)),
            reviews(
                review_id,
                rating,
                comment,
                review_date,
                user_id,
                users(username, user_profiles(profile_image))
            )
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

/**
 * Update an existing product
 * @param id Product ID to update
 * @param productData Object containing the product fields to update
 * @returns Result of the update operation
 */
export async function updateProduct(
    id: string | number,
    productData: {
        name?: string;
        description?: string;
        price?: number;
        stock_quantity?: number;
        subcategory_id?: number;
        discount_percentage?: number;
        is_active?: boolean;
        sku?: string;
    }
) {
    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('product_id', id)
        .select();
    
    return { data, error };
}

/**
 * Delete all images for a product
 * @param productId Product ID to remove images for
 */
export async function removeAllProductImages(productId: string | number) {
    const { data, error } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);
    
    return { data, error };
}

/**
 * Set a specific image as the primary image for a product
 * @param imageId Image ID to set as primary
 * @param productId Product ID the image belongs to
 */
export async function setImageAsPrimary(imageId: number, productId: string | number) {
    // First, set all images of this product as non-primary
    await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
    
    // Then set the selected image as primary
    const { data, error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('image_id', imageId)
        .eq('product_id', productId);
    
    return { data, error };
}

/**
 * Get all images for a product
 * @param productId Product ID to get images for
 */
export async function getProductImages(productId: string | number) {
    const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });
    
    return { data, error };
} 