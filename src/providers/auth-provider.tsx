'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getUserIdByEmail, getUserFullData, updateLastLogin, registerUser } from '@/lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';

// Define the type for the complete user data from our database
interface CompleteUserData {
    user_id: string;
    email: string;
    username: string;
    role: string;
    created_at: string;
    last_login?: string;
    user_profiles: {
        full_name?: string;
        avatar_url?: string;
    } | null;
}

interface AuthContextType {
    user: User | null;
    userData: CompleteUserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null | unknown }>;
    signUp: (email: string, password: string) => Promise<{ data: { user?: User | null } | null; error: AuthError | null }>;
    signOut: () => Promise<void>;
    refreshUserData: () => Promise<void>;
    forgotPassword: (email: string) => Promise<any>;
    changePassword: (password: string) => Promise<any>;
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
                } catch (createError) {
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
        } catch (error) {
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
                const { data } = await supabase.auth.getSession();
                const sessionUser = data.session?.user ?? null;
                setUser(sessionUser);

                if (sessionUser) {
                    await fetchUserData(sessionUser);
                }

                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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
                            } catch (error) {
                                // Error handling
                            }
                        }
                    } catch (error) {
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

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [router]);

    // Sign in with email and password
    const signIn = async (email: string, password: string) => {
        try {
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
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectUrl,
                }
            });

            return { data, error };
        } catch (err) {
            console.error('Unexpected error during sign up:', err);
            return { data: null, error: err as AuthError };
        }
    };

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut();
        setUserData(null);
        router.push('/');
    };

    // Forgot password
    const forgotPassword = async (email: string) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/reset-password`,
        });
    };

    // Change password
    const changePassword = async (password: string) => {
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
