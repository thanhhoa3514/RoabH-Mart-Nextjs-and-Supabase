import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey } from './config';

/**
 * Creates a Supabase client for use in the browser.
 */
export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
};

// Client instance is primarily created via the getSupabaseClient factory or manually on the client