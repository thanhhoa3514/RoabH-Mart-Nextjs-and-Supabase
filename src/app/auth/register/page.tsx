'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Lock, Mail, User } from 'lucide-react';
import { useAlert } from '@/lib/context/alert-context';

interface AuthError {
  message: string;
  status?: number;
}

export default function RegisterPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log('Starting registration process...');

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Calling signUp with email:', email);
      
      // 1. Register with Supabase Auth
      const { data, error: authError } = await signUp(email, password);

      if (authError) {
        console.error('Auth error during registration:', authError);
        throw authError;
      }

      console.log('Registration successful. User data:', data?.user?.email);
      console.log('User confirmed:', data?.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log('User ID:', data?.user?.id);

      // Check if confirmation was sent
      const emailConfirmationSent = !data?.user?.email_confirmed_at;
      console.log('Email confirmation sent:', emailConfirmationSent);

      // Create user record in our database immediately, regardless of verification status
      if (data?.user?.id) {
        try {
          // Import registerUser function để sử dụng
          const { registerUser } = await import('@/lib/supabase');
          
          console.log('Creating user record in database with ID:', data.user.id);
          
          // Tạo người dùng trong database với đầy đủ thông tin
          const { error } = await registerUser({
            email: data.user.email || '',
            username: (data.user.email || '').split('@')[0],
            fullName: fullName // Giữ lại fullName để tạo profile
          });

          if (error) {
            console.error('Failed to create user record:', error);
            showAlert('warning', 'Đã đăng ký nhưng có lỗi khi lưu thông tin profile. Vui lòng liên hệ hỗ trợ nếu gặp vấn đề khi đăng nhập.', 8000);
          } else {
            console.log('User record created successfully in database');
          }
        } catch (profileErr) {
          console.error('Error creating user record:', profileErr);
          showAlert('warning', 'Đã đăng ký nhưng có lỗi khi lưu thông tin profile. Vui lòng liên hệ hỗ trợ nếu gặp vấn đề khi đăng nhập.', 8000);
        }
      } else {
        console.error('No user ID returned from registration');
      }

      // Only show success if we need to verify email
      if (emailConfirmationSent) {
        // Show alert
        showAlert('success', 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.', 8000);
        // Set success state to show confirmation screen
        setSuccess(true);
      } else {
        // User was auto-confirmed - redirect to login
        showAlert('success', 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.', 5000);
        router.push('/auth/login?verified=true');
      }
      
      // Stop loading
      setLoading(false);
      
      console.log('Registration process completed successfully');
      return;

    } catch (err: unknown) {
      console.error('Registration error:', err);
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? (err.message as string) 
        : 'Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.';
      setError(errorMessage);
      showAlert('error', errorMessage || 'Đăng ký thất bại. Vui lòng thử lại.');
      setSuccess(false); // Ensure success is false
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Đăng Ký Thành Công</h1>
            <div className="mb-6">
              <p className="text-center mb-4">
                Chúng tôi đã gửi email xác nhận đến <strong>{email}</strong>.
              </p>
              <p className="text-center mb-4">
                Vui lòng kiểm tra hộp thư đến của bạn và làm theo hướng dẫn để xác minh tài khoản.
              </p>
              <p className="text-center text-sm text-gray-500">
                Nếu bạn không thấy email, vui lòng kiểm tra thư mục spam hoặc thùng rác.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <Link
                href="/auth/login"
                className="mb-3 bg-primary text-white w-full text-center px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Đến Trang Đăng Nhập
              </Link>
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Quay lại trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-white py-3 rounded-md transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
                }`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 