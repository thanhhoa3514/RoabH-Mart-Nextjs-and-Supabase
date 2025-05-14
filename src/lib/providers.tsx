'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { AlertProvider } from '@/lib/context/alert-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AlertProvider>
        {children}
      </AlertProvider>
    </AuthProvider>
  );
} 