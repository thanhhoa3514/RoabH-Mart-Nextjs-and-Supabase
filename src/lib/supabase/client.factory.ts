import { createClient as createBrowserClient } from './client';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = async () => {
    // Browser environment
    if (typeof window !== 'undefined') {
        if (!browserClient) {
            browserClient = createBrowserClient();
        }
        return browserClient;
    }

    // Server environment (Next.js Server Components, Actions, API Routes)
    const { createClient: createServerClient } = await import('./server');
    return createServerClient();
};
