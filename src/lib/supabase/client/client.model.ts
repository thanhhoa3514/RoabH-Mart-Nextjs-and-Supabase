import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create client with secure cookie storage for auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'auth-storage',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disable automatic detection of auth tokens in URL
    },
}); 