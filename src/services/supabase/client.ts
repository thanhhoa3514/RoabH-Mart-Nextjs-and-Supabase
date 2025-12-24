import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabasePublishableKey } from './config';

/**
 * Creates a Supabase client for use in the browser.
 * This should only be called on the client-side.
 */
export const createClient = () => {
  // Safety check - should never be called on server
  if (typeof window === 'undefined') {
    throw new Error('createBrowserClient should only be called on the client-side');
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      flowType: 'pkce',
      persistSession: typeof window !== 'undefined', // Chỉ persist nếu là browser
      autoRefreshToken: typeof window !== 'undefined',
      detectSessionInUrl: typeof window !== 'undefined',
    },
  });
};

// Client instance is primarily created via the getSupabaseClient factory or manually on the client