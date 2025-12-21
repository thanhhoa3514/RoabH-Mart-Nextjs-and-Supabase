/**
 * Returns a Supabase client appropriate for the current environment (Browser or Server).
 * On the server, it creates a new client per request to handle cookies correctly.
 * On the client, it returns a singleton instance.
 */
export const getSupabaseClient = async () => {
    if (typeof window !== 'undefined') {
        const { createClient } = await import('./client');
        return createClient();
    }
    const { createClient } = await import('./server');
    return createClient();
};
