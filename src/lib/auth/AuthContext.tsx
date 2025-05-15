'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getUserIdFromAuth, getUserData, updateLastLogin } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { CompleteUserData } from '@/lib/supabase/user/users.model';
import { AuthError } from '@supabase/supabase-js';

// Define types for authentication responses
// interface AuthResponse {
//   data?: {
//     user?: User | null;
//     session?: unknown;
//   } | null;
//   error: AuthError | null;
// }

interface AuthContextType {
    user: User | null;
    userData: CompleteUserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null | unknown }>;
    signUp: (email: string, password: string) => Promise<{ data: { user?: User | null } | null; error: AuthError | null }>;
    signOut: () => Promise<void>;
    refreshUserData: () => Promise<void>;
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
            console.log('Fetching user data for:', authUser.email);
            
            // First get the user_id from the users table
            const { userId, error: idError } = await getUserIdFromAuth(authUser);
            
            if (idError) {
                console.error('Error getting user ID:', idError);
                return;
            }
            
            if (!userId) {
                console.log('No user ID found, attempting to create user record');
                
                try {
                    // Import registerUser function
                    const { registerUser } = await import('@/lib/supabase');
                    
                    // Create user record and profile since it doesn't exist
                    const { error } = await registerUser({
                        email: authUser.email || '',
                        username: authUser.email?.split('@')[0] || `user_${Date.now()}`
                    });
                    
                    if (error) {
                        console.error('Failed to create user record during fetchUserData:', error);
                        return;
                    }
                    
                    // Get the userId again after creation
                    const { userId: newUserId, error: newIdError } = await getUserIdFromAuth(authUser);
                    
                    if (newIdError || !newUserId) {
                        console.error('Failed to get user ID after creation:', newIdError);
                        return;
                    }
                    
                    console.log('Created user record with ID:', newUserId);
                    
                    // Update the last login time for the new user
                    await updateLastLogin(newUserId);
                    
                    // Fetch complete user data for the new user
                    const { data, error: dataError } = await getUserData(newUserId);
                    
                    if (dataError) {
                        console.error('Error fetching data for new user:', dataError);
                        return;
                    }
                    
                    setUserData(data);
                    return;
                } catch (createError) {
                    console.error('Error creating user during fetchUserData:', createError);
                    return;
                }
            }

            console.log('User ID found:', userId);
            
            // Update the last login time
            await updateLastLogin(userId);
            
            // Then fetch complete user data
            const { data, error: dataError } = await getUserData(userId);
            
            if (dataError) {
                console.error('Error fetching user data:', dataError);
                return;
            }
            
            console.log('User data fetched successfully');
            setUserData(data);
        } catch (error) {
            console.error('Error in fetchUserData:', error);
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
                console.error('Error checking session:', error);
                setLoading(false);
            }
        };

        checkSession();

        // Listen for auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change event:', event);
            
            const authUser = session?.user ?? null;
            setUser(authUser);
            
            if (authUser) {
                console.log('Auth user found on state change:', authUser.email);
                
                // Check if this is a verified user (email confirmed)
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                    
                    // Check if user exists in our database
                    try {
                        const { userId, error: idError } = await getUserIdFromAuth(authUser);
                        
                        if (!userId && !idError) {
                            // This could be a new user who just verified their email but 
                            // doesn't have a record in our database yet
                            console.log('No user record found in database for verified user. Creating record now.');
                            
                            try {
                                // Import registerUser function
                                const { registerUser } = await import('@/lib/supabase');
                                
                                // Create user record and profile
                                const { error } = await registerUser({
                                    email: authUser.email || '',
                                    username: authUser.email?.split('@')[0] || `user_${Date.now()}`
                                });
                                
                                if (error) {
                                    console.error('Error creating user profile after verification:', error);
                                } else {
                                    console.log('User profile created successfully after verification');
                                }
                            } catch (error) {
                                console.error('Failed to create user profile after email verification:', error);
                            }
                        } else if (userId) {
                            console.log('User record already exists in database with ID:', userId);
                        }
                    } catch (error) {
                        console.error('Error checking user status:', error);
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
        console.log('Attempting to sign in with email:', email);
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            
            if (error) {
                console.error('Sign in error:', error);
                return { error };
            }
            
            console.log('Sign in successful, session established');
            
            // If we have a user, try to fetch their data
            if (data.user) {
                console.log('Fetching user data after sign in');
                await fetchUserData(data.user);
            }
            
            return { error: null };
        } catch (err) {
            console.error('Unexpected error during sign in:', err);
            return { error: err };
        }
    };

    // Sign up with email and password
    const signUp = async (email: string, password: string) => {
        // Define the current origin for redirect
        const redirectBase = typeof window !== 'undefined' ? window.location.origin : '';
        const redirectUrl = `${redirectBase}/auth/callback`;
        console.log('Signing up with redirect URL:', redirectUrl);

        try {
            // Register with Supabase Auth using PKCE flow
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectUrl,
                    // Do not add custom data here as it can interfere with some providers
                }
            });
            
            console.log('Sign up attempt:', { email, error: !!error, redirectUrl });
            
            if (error) {
                console.error('Sign up error:', error);
            } else {
                // Check if email verification was sent or if user was auto-confirmed
                const emailConfirmationSent = !data?.user?.email_confirmed_at;
                
                if (emailConfirmationSent) {
                    console.log('Verification email has been sent to:', email);
                } else {
                    console.log('User was auto-confirmed or already exists:', email);
                }
            }
            
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

    const value = {
        user,
        userData,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUserData,
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