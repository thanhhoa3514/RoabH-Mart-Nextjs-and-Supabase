import { supabase } from '../../client/client.model';

interface GetProductsParams {
    category?: string;
    subcategory_id?: number;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
}

export async function getProducts({
    category,
    subcategory_id,
    search,
    sort = 'newest',
    page = 1,
    limit = 9
}: GetProductsParams = {}) {
    try {
        // Xây dựng truy vấn cơ bản với count
        let baseQuery = supabase
            .from('products')
            .select(`
        product_id,
        name,
        description,
        price,
        stock_quantity,
        discount_percentage,
        subcategory_id,
        seller_id,
        sku,
        is_active,
        subcategories:subcategory_id(category_id, name),
        product_images(image_id, image_url, is_primary),
        sellers:seller_id(name)
      `, { count: 'exact' })
            .eq('is_active', true);

        // Áp dụng các bộ lọc
        if (subcategory_id) {
            baseQuery = baseQuery.eq('subcategory_id', subcategory_id);
        }

        // Lọc theo category
        if (category) {
            // Lấy danh sách subcategory thuộc category
            const { data: subcategories } = await supabase
                .from('subcategories')
                .select('subcategory_id, categories!inner(name)')
                .eq('categories.name', category)
                .eq('is_active', true);

            if (subcategories && subcategories.length > 0) {
                const subcategoryIds = subcategories.map((sub: { subcategory_id: number }) => sub.subcategory_id);
                baseQuery = baseQuery.in('subcategory_id', subcategoryIds);
            }
        }

        // Lọc theo chuỗi tìm kiếm
        if (search) {
            baseQuery = baseQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Áp dụng sắp xếp
        if (sort === 'price-low') {
            baseQuery = baseQuery.order('price', { ascending: true });
        } else if (sort === 'price-high') {
            baseQuery = baseQuery.order('price', { ascending: false });
        } else if (sort === 'newest') {
            // Sử dụng product_id thay vì created_at để sắp xếp theo độ mới
            baseQuery = baseQuery.order('product_id', { ascending: false });
        }

        // Thực hiện truy vấn để lấy tổng số bản ghi
        const countResult = await baseQuery;
        const totalCount = countResult.count || 0;
        
        // Tính toán tổng số trang
        const totalPages = Math.ceil(totalCount / limit);
        
        // Điều chỉnh page nếu vượt quá tổng số trang
        const adjustedPage = page > totalPages ? (totalPages > 0 ? totalPages : 1) : page;
        
        // Tính toán from và to dựa trên page đã điều chỉnh
        const from = (adjustedPage - 1) * limit;
        const to = from + limit - 1;
        
        // Thực hiện truy vấn với phân trang
        const { data, error } = await baseQuery.range(from, to);

        if (error) {
            console.log('Error fetching products:', error);
            return { data: null, error, count: totalCount };
        }

        // Biến đổi dữ liệu theo cấu trúc Product
        const products = data.map(item => ({
            id: item.product_id.toString(),
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price),
            // Sắp xếp hình ảnh, ưu tiên hình ảnh chính
            images: item.product_images
                ? item.product_images
                    .sort((a, b) => (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1))
                    .map(img => img.image_url)
                : [],
            category: item.subcategories?.[0]?.name || 'uncategorized',
            stock: item.stock_quantity,
            discount: item.discount_percentage ? parseFloat(item.discount_percentage) : 0,
            seller: item.sellers?.[0]?.name || '',
            createdAt: new Date().toISOString(), // Use current date as fallback
            updatedAt: new Date().toISOString(),
        }));

        // Trả về dữ liệu kèm metadata về phân trang
        return { 
            data: products, 
            error: null, 
            count: totalCount,
            page: adjustedPage,
            totalPages,
            hasMore: adjustedPage < totalPages
        };
    } catch (err) {
        console.error('Unexpected error fetching products:', err);
        return { data: null, error: err, count: 0 };
    }
}

export async function getProductById(id: string) {
    try {
        // Convert string id to number for the database query
        const productId = parseInt(id);

        if (isNaN(productId)) {
            return { data: null, error: 'Invalid product ID' };
        }

        const { data, error } = await supabase
            .from('products')
            .select(`
        product_id,
        name,
        description,
        price,
        stock_quantity,
        discount_percentage,
        subcategory_id,
        seller_id,
        sku,
        is_active,
        subcategories:subcategory_id(subcategory_id, name, category_id, categories:category_id(category_id, name)),
        product_images(image_id, image_url, is_primary, display_order),
        sellers:seller_id(seller_id, name, logo),
        reviews(review_id, rating, comment, review_date, user_id, users:user_id(username))
      `)
            .eq('product_id', productId)
            .eq('is_active', true)
            .single();

        if (error) {
            console.error('Error fetching product by ID:', error);
            return { data: null, error };
        }

        if (!data) {
            return { data: null, error: 'Product not found' };
        }

        // Transform the data to match the frontend Product type
        const product = {
            id: data.product_id.toString(),
            name: data.name,
            description: data.description || '',
            price: parseFloat(data.price),
            // Get the image URLs, prioritizing primary images
            images: data.product_images
                ? data.product_images
                    .sort((a, b) => {
                        // First sort by is_primary, then by display_order
                        if (a.is_primary !== b.is_primary) {
                            return a.is_primary ? -1 : 1;
                        }
                        return a.display_order - b.display_order;
                    })
                    .map(img => img.image_url)
                : [],
            category: data.subcategories?.[0]?.categories?.[0]?.name || 'uncategorized',
            subcategory: data.subcategories?.[0]?.name || '',
            stock: data.stock_quantity,
            discount: data.discount_percentage ? parseFloat(data.discount_percentage) : 0,
            seller: {
                id: data.sellers?.[0]?.seller_id?.toString(),
                name: data.sellers?.[0]?.name || '',
                logo: data.sellers?.[0]?.logo || '',
            },
            reviews: data.reviews
                ? data.reviews.map(review => ({
                    id: review.review_id.toString(),
                    rating: review.rating,
                    comment: review.comment || '',
                    date: review.review_date,
                    user: review.users?.[0]?.username || 'Anonymous',
                }))
                : [],
            createdAt: new Date().toISOString(), // Use current date
            updatedAt: new Date().toISOString(), 
        };

        return { data: product, error: null };
    } catch (err) {
        console.error('Unexpected error fetching product by ID:', err);
        return { data: null, error: err };
    }
} 