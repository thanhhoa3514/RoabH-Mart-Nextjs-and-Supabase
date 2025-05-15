import { supabase } from '../client/client.model';

export async function signUp(email: string, password: string) {
    console.log('Auth model: signUp called for email:', email);
    
    try {
        const redirectUrl = `${window.location.origin}/auth/callback`;
        console.log('Auth model: setting redirectUrl to:', redirectUrl);
        
        // Sign up with Supabase Auth - ensuring email verification is enabled
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectUrl,
                // Do NOT set any data as it can cause issues with some providers
            }
        });
        
        if (error) {
            console.error('Auth model: signUp error:', error);
        } else {
            console.log('Auth model: signUp successful. User ID:', data?.user?.id);
            console.log('Auth model: verification email should be sent to:', email);
            // Check if confirmation sent
            const emailConfirmationSent = !data?.user?.email_confirmed_at;
            if (emailConfirmationSent) {
                console.log('Auth model: Email confirmation was sent');
            } else {
                console.log('Auth model: User already confirmed or auto-confirmed');
            }
        }
        
        return { data, error };
    } catch (err) {
        console.error('Auth model: unexpected error during signUp:', err);
        return { data: null, error: err };
    }
}

export async function signIn(email: string, password: string) {
    try {
        // Sign in with email/password, which will automatically store tokens in cookies
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Auth model: signIn error:', error);
        } else {
            console.log('Auth model: signIn successful for user:', data?.user?.email);
            
            // The tokens are automatically handled by Supabase client
            // with the configuration from client.model.ts
        }

        return { data, error };
    } catch (err) {
        console.error('Auth model: unexpected error during signIn:', err);
        return { data: null, error: err };
    }
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getUserProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
} 