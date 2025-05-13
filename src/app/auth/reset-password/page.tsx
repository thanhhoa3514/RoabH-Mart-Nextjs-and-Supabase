'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidReset, setIsValidReset] = useState(false);

  // Check if the user is authenticated with a recovery token
  useEffect(() => {
    const checkSession = async () => {
      // Supabase handles the token through cookies, we just need to check
      // if we're in a recovery flow
      const { data } = await supabase.auth.getSession();
      
      // Check if we have a valid recovery session
      if (data.session) {
        setIsValidReset(true);
      } else {
        // No valid session, redirect to login
        router.push('/auth/login');
      }
    };
    
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ 
        password 
      });
      
      if (error) {
        throw error;
      }

      // Successfully updated password
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidReset && !success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Invalid Reset Link</h1>
            <p className="text-center mb-6">
              This password reset link is invalid or has expired.
            </p>
            <div className="flex justify-center">
              <Link 
                href="/auth/forgot-password" 
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-center mb-6">Password Reset Successful</h1>
            <p className="text-center mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <div className="flex justify-center">
              <Link 
                href="/auth/login" 
                className="bg-primary text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Go to Login
              </Link>
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
          <h1 className="text-2xl font-bold text-center mb-6">Reset Your Password</h1>
          <p className="text-center text-gray-600 mb-6">
            Please enter your new password below.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                New Password
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
                Confirm New Password
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
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-white py-3 rounded-md transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
              }`}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 