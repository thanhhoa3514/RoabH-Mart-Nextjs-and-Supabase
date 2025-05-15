/**
 * Re-export everything from the new user/users.model.ts location
 * This file exists for backward compatibility only
 * Please update your imports to use '@/lib/supabase/user/users.model' instead
 */
export * from '../user/users.model';

// Log a warning in development to remind developers to update their imports
if (process.env.NODE_ENV === 'development') {
    console.warn(
        '[Deprecated] You are importing from "@/lib/supabase/users/users.model".\n' +
        'Please update your imports to use "@/lib/supabase/user/users.model" instead.'
    );
} 