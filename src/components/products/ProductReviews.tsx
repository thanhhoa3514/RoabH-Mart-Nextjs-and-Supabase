'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, User } from 'lucide-react';
import { getReviewsByProductId, getProductRatingSummary } from '@/lib/supabase/reviews/reviews.model';

interface ProductReviewsProps {
  productId: number;
}

interface UserProfile {
  profile_image?: string;
}

interface User {
  username: string;
  user_profiles?: UserProfile[];
}

interface Review {
  review_id: number;
  rating: number;
  comment: string;
  review_date: string;
  user_id: number;
  users?: User;
  is_verified_purchase?: boolean;
}

interface ApiReview {
  review_id: number;
  product_id: number;
  user_id: number;
  rating: number;
  comment: string;
  review_date: string;
  is_verified_purchase?: boolean;
  users: {
    username: string;
    user_profiles: UserProfile[];
  }[];
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true);
        
        // Ensure we have a valid number for productId
        const productIdNumber = typeof productId === 'string' ? parseInt(productId, 10) : productId;
        
        if (isNaN(productIdNumber)) {
          console.error('Invalid product ID');
          setError('Invalid product ID');
          setIsLoading(false);
          return;
        }
        
        // Lấy dữ liệu đánh giá
        const { data: reviewsData, error: reviewsError } = await getReviewsByProductId(productIdNumber);
        
        // Lấy tổng quan đánh giá
        const { 
          averageRating, 
          totalReviews, 
          ratingDistribution, 
          error: summaryError 
        } = await getProductRatingSummary(productIdNumber);
        
        if (reviewsError) throw new Error(reviewsError.message);
        if (summaryError) throw new Error(summaryError.message);
        
        // Chuyển đổi kiểu dữ liệu từ API sang đúng định dạng Review[]
        const formattedReviews: Review[] = reviewsData ? reviewsData.map((review: ApiReview) => ({
          review_id: review.review_id,
          rating: review.rating,
          comment: review.comment,
          review_date: review.review_date,
          user_id: review.user_id,
          is_verified_purchase: review.is_verified_purchase,
          users: review.users[0] // Get the first user from the array
        })) : [];
        
        setReviews(formattedReviews);
        setRatingSummary({
          averageRating,
          totalReviews,
          ratingDistribution
        });
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadReviews();
  }, [productId]);

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
      />
    ));
  };

  // Calculate percentage for rating bar
  const getRatingPercentage = (starCount: number) => {
    if (ratingSummary.totalReviews === 0) return 0;
    return (ratingSummary.ratingDistribution[starCount] / ratingSummary.totalReviews) * 100;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get profile image from user
  const getProfileImage = (review: Review) => {
    if (review.users?.user_profiles && review.users.user_profiles.length > 0) {
      return review.users.user_profiles[0]?.profile_image;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="mt-12 flex justify-center items-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-500">Failed to load reviews: {error}</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

      {ratingSummary.totalReviews === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
          <p className="text-gray-500 mt-2">Hãy là người đầu tiên đánh giá!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Rating Summary */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold">{ratingSummary.averageRating.toFixed(1)}</div>
                <div className="flex justify-center my-2">
                  {renderStars(Math.round(ratingSummary.averageRating))}
                </div>
                <div className="text-sm text-gray-500">{ratingSummary.totalReviews} đánh giá</div>
              </div>
              
              {/* Rating distribution */}
              <div className="space-y-2 mt-6">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center">
                    <span className="w-3 text-sm text-gray-600">{star}</span>
                    <Star className="h-4 w-4 text-amber-400 mx-1" />
                    <div className="flex-1 ml-2">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-amber-400 rounded-full" 
                          style={{ width: `${getRatingPercentage(star)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500 w-8">
                      {ratingSummary.ratingDistribution[star]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right column - Review List */}
          <div className="md:col-span-2">
            <div className="space-y-6">
              {reviews.map(review => (
                <div key={review.review_id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0">
                      {getProfileImage(review) ? (
                        <Image
                          src={getProfileImage(review) || ''}
                          alt={review.users?.username || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{review.users?.username || 'Người dùng ẩn danh'}</div>
                      <div className="text-xs text-gray-500">{formatDate(review.review_date)}</div>
                    </div>
                  </div>
                  
                  <div className="flex mb-2">
                    {renderStars(review.rating)}
                  </div>
                  
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
              
              {reviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chưa có đánh giá nào.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 