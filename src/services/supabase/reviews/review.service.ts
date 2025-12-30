import { getSupabaseClient } from '../client.factory';

interface ReviewData {
    product_id: number;
    user_id: string;
    rating: number;
    comment: string;
    is_verified_purchase?: boolean;
}

// Lấy reviews theo product_id
export async function getReviewsByProductId(productId: number) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('reviews')
        .select(`
            review_id,
            product_id,
            user_id,
            rating,
            comment,
            review_date,
            is_verified_purchase,
            users(username, user_profiles(profile_image))
        `)
        .eq('product_id', productId)
        .order('review_date', { ascending: false });

    return { data, error };
}

// Thêm review mới
export async function addReview(reviewData: ReviewData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select();

    return { data, error };
}

// Cập nhật review
export async function updateReview(reviewId: number, reviewData: Partial<ReviewData>) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('reviews')
        .update(reviewData)
        .eq('review_id', reviewId)
        .select();

    return { data, error };
}

// Xóa review
export async function deleteReview(reviewId: number) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('reviews')
        .delete()
        .eq('review_id', reviewId);

    return { data, error };
}

// Kiểm tra user đã review sản phẩm chưa
export async function hasUserReviewed(productId: number, userId: string) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('reviews')
        .select('review_id')
        .eq('product_id', productId)
        .eq('user_id', userId);

    return {
        hasReviewed: data && data.length > 0,
        reviewId: data && data.length > 0 ? data[0].review_id : null,
        error
    };
}

// Tính trung bình rating và số lượng reviews cho sản phẩm
export async function getProductRatingSummary(productId: number) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

    if (error || !data || data.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            error
        };
    }

    // Tính trung bình rating
    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = sum / data.length;

    // Đếm số lượng mỗi loại rating
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(review => {
        const rating = review.rating;
        if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] += 1;
        }
    });

    return {
        averageRating,
        totalReviews: data.length,
        ratingDistribution,
        error: null
    };
} 