-- Migration: Create trigger to automatically sync auth.users to public.users
-- Created: 2025-12-30
-- Description: Automatically creates a public.users record when a new auth.users record is created
--              This eliminates the need for manual syncing in application code

-- Create function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert into public.users with the same user_id from auth.users
    INSERT INTO public.users (
        user_id,
        email,
        username,
        password_hash,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            SPLIT_PART(NEW.email, '@', 1)
        ),
        'supabase_auth', -- Placeholder since auth is handled by Supabase Auth
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate inserts if user already exists

    RETURN NEW;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates a public.users record when a new auth.users record is created. 
This ensures FK constraints are satisfied and eliminates manual sync in application code.';

-- Create trigger on auth.users table
-- Note: This requires elevated privileges and should be run by a database admin
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
'Automatically syncs new auth.users to public.users table to maintain referential integrity.';
