'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient, getUserIdByEmail, getUserFullData, updateLastLogin, registerUser } from '@/services/supabase';
import { User, AuthError, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { CompleteUserData } from '@/types/user/user.model';
import toast from 'react-hot-toast';



interface AuthContextType {
    user: User | null;
    userData: CompleteUserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null | unknown }>;
    signUp: (email: string, password: string) => Promise<{ data: { user?: User | null } | null; error: AuthError | null }>;
    signOut: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    forgotPassword: (email: string) => Promise<{ data: object | null; error: AuthError | null }>;
    changePassword: (password: string) => Promise<{ data: { user: User | null } | null; error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<CompleteUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Fetch user data from database tables
    const fetchUserData = async (authUser: User) => {
        try {
            // First get the user_id from the users table
            const { userId, error: idError } = await getUserIdByEmail(authUser.email || '');

            if (idError) {
                return;
            }

            if (!userId) {
                try {
                    // Create user record and profile since it doesn't exist
                    const { error } = await registerUser({
                        email: authUser.email || '',
                        username: authUser.email?.split('@')[0] || `user_${Date.now()}`
                    });

                    if (error) {
                        return;
                    }

                    // Get the userId again after creation
                    const { userId: newUserId, error: newIdError } = await getUserIdByEmail(authUser.email || '');

                    if (newIdError || !newUserId) {
                        return;
                    }

                    // Update the last login time for the new user
                    await updateLastLogin(newUserId);

                    // Fetch complete user data for the new user
                    const { data, error: dataError } = await getUserFullData(newUserId);

                    if (dataError) {
                        return;
                    }

                    setUserData(data as unknown as CompleteUserData);
                    return;
                } catch {
                    return;
                }
            }

            // Update the last login time
            await updateLastLogin(userId);

            // Then fetch complete user data
            const { data, error: dataError } = await getUserFullData(userId);

            if (dataError) {
                return;
            }

            setUserData(data as unknown as CompleteUserData);
        } catch {
            // Error handling
        }
    };

    // Function to refresh user data
    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user);
        }
    };

    useEffect(() => {
        // Check active session
        const checkSession = async () => {
            try {
                const supabase = await getSupabaseClient();
                const { data } = await supabase.auth.getSession();
                const sessionUser = data.session?.user ?? null;
                setUser(sessionUser);

                if (sessionUser) {
                    await fetchUserData(sessionUser);
                }

                setLoading(false);
            } catch {
                setLoading(false);
            }
        };

        checkSession();

        let authListener: { subscription: { unsubscribe: () => void } } | null = null;

        // Listen for auth changes
        const setupAuthListener = async () => {
            const supabase = await getSupabaseClient();
            const { data } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
                const authUser = session?.user ?? null;
                setUser(authUser);

                if (authUser) {
                    // Check if this is a verified user (email confirmed)
                    if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                        // Check if user exists in our database
                        try {
                            const { userId, error: idError } = await getUserIdByEmail(authUser.email || '');

                            if (!userId && !idError) {
                                try {
                                    // Create user record and profile
                                    await registerUser({
                                        email: authUser.email || '',
                                        username: authUser.email?.split('@')[0] || `user_${Date.now()}`
                                    });
                                } catch {
                                    // Error handling
                                }
                            }
                        } catch {
                            // Error handling
                        }

                        // Fetch user data regardless of whether it's a new or existing user
                        await fetchUserData(authUser);
                    }
                } else {
                    setUserData(null);
                }

                setLoading(false);

                // Update the page
                router.refresh();
            });
            authListener = data;
        };

        setupAuthListener();

        return () => {
            if (authListener) {
                authListener.subscription.unsubscribe();
            }
        };
    }, [router]);

    // Sign in with email and password
    const signIn = async (email: string, password: string) => {
        try {
            const supabase = await getSupabaseClient();
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                return { error };
            }

            // If we have a user, try to fetch their data
            if (data.user) {
                await fetchUserData(data.user);
            }

            return { error: null };
        } catch (err) {
            return { error: err };
        }
    };

    // Sign up with email and password
    const signUp = async (email: string, password: string) => {
        const redirectBase = typeof window !== 'undefined' ? window.location.origin : '';
        const redirectUrl = `${redirectBase}/auth/callback`;

        try {
            const supabase = await getSupabaseClient();
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectUrl,
                }
            });

            return { data, error };
        } catch (err) {
            toast.error('Unexpected error during sign up');
            return { data: null, error: err as AuthError };
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            const supabase = await getSupabaseClient();
            await supabase.auth.signOut();
            setUser(null);
            setUserData(null);
            router.push('/');
            router.refresh(); // Ensure server session is updated
            toast.success('You have been signed out successfully');
        } catch (error) {
            console.error('Error during sign out:', error);
            // Even if logout fails, we should clear local state
            setUser(null);
            setUserData(null);
            router.push('/');
            toast.error('There was an issue signing out, but we have cleared your local session');
        }
    };

    // Forgot password
    const forgotPassword = async (email: string) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const supabase = await getSupabaseClient();
        return supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/reset-password`,
        });
        toast.success('Check your email for the reset password link');
    };

    // Change password
    const changePassword = async (password: string) => {
        const supabase = await getSupabaseClient();
        return supabase.auth.updateUser({ password });
    };

    const value = {
        user,
        userData,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUserData,
        forgotPassword,
        changePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
