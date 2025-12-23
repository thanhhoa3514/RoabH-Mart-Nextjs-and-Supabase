import { getSupabaseClient } from '../client.factory';
import { User } from '@supabase/supabase-js';
import { AUTH_REDIRECT_PATH_COOKIE } from '@/services/constants';

export type LoginCredentials = {
    email: string;
    password: string;
};

export type RegisterCredentials = LoginCredentials & {
    name: string;
};

// --- Basic Auth Functions (Universal) ---

export const login = async ({ email, password }: LoginCredentials) => {
    const supabase = await getSupabaseClient();
    return supabase.auth.signInWithPassword({ email, password });
};

export const logout = async () => {
    const supabase = await getSupabaseClient();
    return supabase.auth.signOut();
};

export const register = async ({ email, password, name }: RegisterCredentials) => {
    const supabase = await getSupabaseClient();
    return supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
        },
    });
};

export const resetPassword = async (email: string) => {
    const supabase = await getSupabaseClient();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/(auth)/reset-password`,
    });
};

export const updatePassword = async (password: string) => {
    const supabase = await getSupabaseClient();
    return supabase.auth.updateUser({ password });
};

// --- Server-Side Auth Functions ---

export const getCurrentUser = async (): Promise<User | null> => {
    const supabase = await getSupabaseClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
};

export const getSession = async () => {
    const supabase = await getSupabaseClient();
    return supabase.auth.getSession();
};

// --- Auth Helpers (formerly in utils) ---

/**
 * Handle login with email and password (wrapper for consistent naming)
 */
export const handleLogin = login;

/**
 * Handle registration with email, password, and name
 */
export const handleRegister = register;

/**
 * Handle logout
 */
export const handleLogout = logout;

/**
 * Get redirect path from cookie after authentication
 */
export const getRedirectPath = async (): Promise<string> => {
    if (typeof window !== 'undefined') return '/';

    const { cookies } = await import('next/headers');
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
