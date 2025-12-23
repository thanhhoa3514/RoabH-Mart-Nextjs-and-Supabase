import { getSupabaseClient } from '../client.factory';
import { Product, ProductImage } from '@/types/supabase';
import {
    CreateProductDTO,
    UpdateProductDTO,
    CreateProductImageDTO,
    CreateProductReviewDTO
} from '@/types/product/product.dto';

// --- Query Functions ---

export const getProducts = async (options: {
    categoryId?: string;
    subcategoryId?: string;
    search?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating_asc' | 'rating_desc' | string;
    page?: number;
    limit?: number;
} = {}) => {
    const supabase = await getSupabaseClient();
    const { categoryId, subcategoryId, search, sort = 'newest', page = 1, limit = 10 } = options;

    let query = supabase
        .from('products')
        .select(`
      *,
      subcategory:subcategories!inner(*),
      seller:sellers(*),
      product_images(*)
    `, { count: 'exact' })
        .eq('is_active', true);

    if (subcategoryId) {
        query = query.eq('subcategory_id', subcategoryId);
    } else if (categoryId) {
        query = query.eq('subcategory.category_id', categoryId);
    }

    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    // Sorting
    if (sort === 'price_asc') {
        query = query.order('price', { ascending: true });
    } else if (sort === 'price_desc') {
        query = query.order('price', { ascending: false });
    } else {
        query = query.order('product_id', { ascending: false });
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    return {
        data: (data as (Product & { product_images: ProductImage[] })[])?.map(p => ({
            ...p,
            images: p.product_images || []
        })) || [],
        error,
        count,
        totalPages: count ? Math.ceil(count / limit) : 0
    };
};

export const getProductById = async (productId: string) => {
    const supabase = await getSupabaseClient();
    const { data: product, error } = await supabase
        .from('products')
        .select(`
      *,
      subcategory:subcategories(*),
      seller:sellers(*),
      product_images(*),
      reviews(*, user:user_profiles(*))
    `)
        .eq('product_id', productId)
        .single();

    if (error || !product) {
        return { data: null, error: error || { message: 'Product not found' } };
    }

    return {
        data: {
            ...product,
            images: (product.product_images as ProductImage[])?.sort((a, b) =>
                (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1) || a.display_order - b.display_order
            ) || []
        },
        error: null
    };
};

export const getProductImages = async (productId: string) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order', { ascending: true });
};

export const getProductBySlug = async (slug: string) => {
    const supabase = await getSupabaseClient();
    const { data: product, error } = await supabase
        .from('products')
        .select(`
      *,
      subcategory:subcategories(*),
      seller:sellers(*),
      product_images(*)
    `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error || !product) {
        return { data: null, error: error || { message: 'Product not found' } };
    }

    return {
        data: {
            ...product,
            images: (product.product_images as ProductImage[])?.sort((a, b) =>
                (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1) || a.display_order - b.display_order
            ) || []
        },
        error: null
    };
};

// --- Mutation Functions ---

export const createProduct = async (productData: CreateProductDTO) => {
    const supabase = await getSupabaseClient();
    return supabase.from('products').insert(productData).select().single();
};

export const updateProduct = async (productId: string, productData: UpdateProductDTO) => {
    const supabase = await getSupabaseClient();
    return supabase.from('products').update(productData).eq('product_id', productId).select().single();
};

export const deleteProduct = async (productId: string) => {
    const supabase = await getSupabaseClient();
    return supabase.from('products').update({ is_active: false }).eq('product_id', productId);
};

// --- Review Functions ---

export const addProductImage = async (imageData: CreateProductImageDTO) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('product_images')
        .insert([imageData])
        .select()
        .single();
};

export const setImageAsPrimary = async (productId: string | number, imageId: string | number) => {
    const supabase = await getSupabaseClient();

    // 1. Set all images for this product to not primary
    await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);

    // 2. Set the specific image to primary
    return supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('image_id', imageId)
        .select()
        .single();
};

export const createProductReview = async (reviewData: CreateProductReviewDTO) => {
    const supabase = await getSupabaseClient();
    return supabase.from('reviews').insert({
        ...reviewData,
        review_date: new Date().toISOString()
    }).select().single();
};
