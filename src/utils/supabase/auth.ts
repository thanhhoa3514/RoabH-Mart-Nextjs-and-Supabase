/**
 * Auth-related helper functions for Supabase
 */

import { login, logout, register, resetPassword, updatePassword } from '@/lib/supabase/auth';
import { LoginCredentials, RegisterCredentials } from '@/lib/supabase/auth';
import { AUTH_REDIRECT_PATH_COOKIE } from '@/lib/constants';
import { cookies } from 'next/headers';

/**
 * Handle login with email and password
 */
export const handleLogin = async (credentials: LoginCredentials) => {
  return login(credentials);
};

/**
 * Handle registration with email, password, and name
 */
export const handleRegister = async (credentials: RegisterCredentials) => {
  return register(credentials);
};

/**
 * Handle logout
 */
export const handleLogout = async () => {
  return logout();
};

/**
 * Handle password reset
 */
export const handleResetPassword = async (email: string) => {
  return resetPassword(email);
};

/**
 * Handle password update
 */
export const handleUpdatePassword = async (password: string) => {
  return updatePassword(password);
};

/**
 * Get redirect path from cookie after authentication
 */
export const getRedirectPath = async (): Promise<string> => {
  const cookieStore = await cookies();
  const redirectPath = cookieStore.get(AUTH_REDIRECT_PATH_COOKIE)?.value;
  
  // If no redirect path is stored, go to homepage
  if (!redirectPath) return '/';
  
  // Delete the redirect cookie since it's only needed once
  cookieStore.delete(AUTH_REDIRECT_PATH_COOKIE);
  
  return redirectPath;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  valid: boolean;
  message?: string;
} => {
  // Minimum 8 characters
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter',
    };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter',
    };
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number',
    };
  }
  
  // Check for at least one special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character',
    };
  }
  
  return { valid: true };
};
