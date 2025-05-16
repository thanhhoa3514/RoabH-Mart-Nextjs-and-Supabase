'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useAlert } from '@/lib/context/alert-context';
import { addReview, updateReview, hasUserReviewed } from '@/lib/supabase/reviews/reviews.model';
import { getUserId } from '@/lib/helpers/user-helpers';

interface ReviewFormProps {
  productId: number;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<{ reviewId: number | null, rating: number, comment: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { showAlert } = useAlert();
  const { user, userData } = useAuth();
  
  // Kiểm tra xem user đã đánh giá sản phẩm chưa
  useEffect(() => {
    async function checkExistingReview() {
      if (!user) return;
      
      const userId = getUserId(userData);
      if (!userId) return;
      
      try {
        const { hasReviewed, reviewId, error } = await hasUserReviewed(productId, userId);
        
        if (error) {
          console.error('Error checking existing review:', error);
          return;
        }
        
        if (hasReviewed && reviewId) {
          // Nếu đã có review, hiển thị thông tin review cũ
          // TODO: Có thể lấy dữ liệu review cũ ở đây
          setExistingReview({
            reviewId,
            rating: 0, // Sẽ cập nhật sau khi lấy dữ liệu
            comment: ''
          });
        }
      } catch (err) {
        console.error('Error checking existing review:', err);
      }
    }
    
    checkExistingReview();
  }, [user, userData, productId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showAlert('warning', 'Vui lòng đăng nhập để đánh giá sản phẩm', 3000);
      return;
    }
    
    if (rating === 0) {
      showAlert('warning', 'Vui lòng chọn số sao cho đánh giá', 3000);
      return;
    }
    
    const userId = getUserId(userData);
    if (!userId) {
      showAlert('error', 'Không thể xác định người dùng', 3000);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reviewData = {
        product_id: productId,
        user_id: userId,
        rating,
        comment: comment.trim(),
      };
      
      let result;
      
      if (existingReview && existingReview.reviewId && isEditing) {
        // Cập nhật review cũ
        result = await updateReview(existingReview.reviewId, reviewData);
        showAlert('success', 'Cập nhật đánh giá thành công', 3000);
      } else {
        // Tạo review mới
        result = await addReview(reviewData);
        showAlert('success', 'Đánh giá của bạn đã được ghi nhận', 3000);
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Reset form
      setRating(0);
      setComment('');
      setIsEditing(false);
      
      // Thông báo cho component cha là đã có review mới
      onReviewSubmitted();
      
    } catch (err) {
      console.error('Error submitting review:', err);
      showAlert('error', 'Có lỗi xảy ra khi gửi đánh giá', 3000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRatingClick = (value: number) => {
    setRating(value);
  };
  
  const handleRatingHover = (value: number) => {
    setHoverRating(value);
  };
  
  const handleEditClick = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setIsEditing(true);
    }
  };
  
  const handleCancelEdit = () => {
    setRating(0);
    setComment('');
    setIsEditing(false);
  };
  
  // Nếu không đăng nhập, hiển thị thông báo
  if (!user) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <p className="text-center text-gray-600">
          Vui lòng <a href="/auth/login" className="text-primary font-medium">đăng nhập</a> để đánh giá sản phẩm.
        </p>
      </div>
    );
  }
  
  // Nếu đã có đánh giá và không trong chế độ chỉnh sửa
  if (existingReview && !isEditing) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg mt-8">
        <p className="text-gray-600 mb-4">Bạn đã đánh giá sản phẩm này.</p>
        <button
          onClick={handleEditClick}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-amber-600 transition-colors"
        >
          Chỉnh sửa đánh giá
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 p-6 rounded-lg mt-8">
      <h3 className="text-xl font-semibold mb-4">{isEditing ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}</h3>
      <form onSubmit={handleSubmit}>
        {/* Rating stars */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá của bạn <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((value) => (
              <Star
                key={value}
                className={`h-8 w-8 cursor-pointer ${
                  (hoverRating || rating) >= value
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
                onClick={() => handleRatingClick(value)}
                onMouseEnter={() => handleRatingHover(value)}
                onMouseLeave={() => handleRatingHover(0)}
              />
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][rating - 1]}
            </p>
          )}
        </div>
        
        {/* Comment */}
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Nhận xét của bạn
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
          ></textarea>
        </div>
        
        {/* Submit button */}
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-amber-600 transition-colors ${
              isSubmitting || rating === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Đang gửi...' : isEditing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
          </button>
          
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="ml-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 