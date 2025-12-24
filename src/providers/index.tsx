'use client';

import React from 'react';
import { AuthProvider } from './auth-provider';
import { CartProvider } from './cart-provider';
import { AlertProvider } from './alert-provider';
import SupabaseProvider from './supabase-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SupabaseProvider>
            <AuthProvider>
                <AlertProvider>
                    <CartProvider>
                        <ThemeProvider defaultTheme="light">
                            {children}
                        </ThemeProvider>
                    </CartProvider>
                </AlertProvider>
            </AuthProvider>
        </SupabaseProvider>
    );
}
