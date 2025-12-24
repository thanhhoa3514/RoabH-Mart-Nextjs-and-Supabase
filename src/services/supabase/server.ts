import '@/lib/localStorage-polyfill';
import { createServerClient } from '@supabase/ssr';
import { supabaseUrl, supabasePublishableKey } from './config';

export const createClient = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignore errors in middleware/server components
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 });
          } catch {
            // Ignore errors in middleware/server components
          }
        },
      },
      auth: {
        persistSession: false, // Don't persist session on server
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: {
          getItem: () => null,
          setItem: () => { },
          removeItem: () => { },
        },
      },
    }
  );
};