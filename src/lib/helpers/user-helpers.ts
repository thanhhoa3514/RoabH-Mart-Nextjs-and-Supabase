import { CompleteUserData } from '@/types/user/user.model';

/**
 * Lấy user_id từ user data
 * @param userData Dữ liệu người dùng
 * @returns user_id hoặc undefined nếu không có
 */
export function getUserId(userData: CompleteUserData | null): number | undefined {
  if (!userData) return undefined;
  
  // Thứ tự ưu tiên: 
  // 1. user.user_id từ DB
  // 2. user_id trực tiếp (nếu có)
  return userData.user?.user_id;
} 