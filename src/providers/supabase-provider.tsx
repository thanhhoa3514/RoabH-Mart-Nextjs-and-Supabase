'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/services/supabase/client';
import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

type SupabaseContext = {
  supabase: SupabaseClient<Database> | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

const INIT_TIMEOUT = 10000; // 10 seconds timeout

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const initializeSupabase = async () => {
    setError(null);
    setIsRetrying(true);

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Supabase initialization timed out after 10 seconds'));
        }, INIT_TIMEOUT);
      });

      // Create the client initialization promise
      const initPromise = new Promise<SupabaseClient<Database>>((resolve, reject) => {
        try {
          if (typeof window === 'undefined') {
            reject(new Error('Cannot initialize Supabase client on server'));
            return;
          }
          const client = createClient();
          resolve(client);
        } catch (err) {
          reject(err);
        }
      });

      // Race between initialization and timeout
      const client = await Promise.race([initPromise, timeoutPromise]);

      setSupabase(client);
      setMounted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Supabase';
      console.error('Supabase initialization error:', err);
      setError(errorMessage);
      setMounted(true); // Still set mounted to show error UI
    } finally {
      setIsRetrying(false);
    }
  };

  // Initial mount and client creation
  useEffect(() => {
    initializeSupabase();
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // Refresh server data when auth state changes
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Always wrap with Provider
  return (
    <Context.Provider value={{ supabase }}>
      {!mounted ? (
        // Loading state
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Initializing...</p>
          </div>
        </div>
      ) : error ? (
        // Error state with retry
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Connection Error</h2>
              <p className="text-muted-foreground">
                {error}
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={initializeSupabase}
                disabled={isRetrying}
                className="w-full"
                size="lg"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Connection
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                If the problem persists, please check your internet connection or try again later.
              </p>
            </div>
          </div>
        </div>
      ) : !supabase ? (
        // Fallback if somehow mounted but no client and no error
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Unable to connect to services</p>
            <Button onClick={initializeSupabase} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        // Success - render children
        children
      )}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider');
  }
  return context;
};
