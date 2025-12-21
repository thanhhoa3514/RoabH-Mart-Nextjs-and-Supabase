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

/**
 * Singleton instance for simple client-side usage
 */
export const supabase = typeof window !== 'undefined'
  ? createClient()
  : null as unknown as ReturnType<typeof createClient>;