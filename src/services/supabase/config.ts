/**
 * Validates and returns Supabase environment variables.
 * Throws a descriptive error if any required variable is missing.
 */
function validateEnv() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
        throw new Error(
            'MISSING ERROR: NEXT_PUBLIC_SUPABASE_URL is not defined.\n' +
            'Please check your .env file and ensure the variable is set.'
        );
    }

    if (!supabaseAnonKey) {
        throw new Error(
            'MISSING ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined.\n' +
            'Please check your .env file and ensure the variable is set.'
        );
    }

    return {
        supabaseUrl,
        supabaseAnonKey,
    };
}

export const { supabaseUrl, supabaseAnonKey } = validateEnv();
