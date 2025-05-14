import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verify we have the necessary environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create client with secure session handling for auth
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'auth-storage',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // Enable to handle tokens in URL for email verification
        flowType: 'pkce', // More secure PKCE flow
    },
}); 