'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/services/supabase/client';
import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/database';

type SupabaseContext = {
  supabase: SupabaseClient<Database> | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [mounted, setMounted] = useState(false);

  // Create client only on client-side
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setSupabase(createClient());
    }
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

  // Don't render children until client is ready
  if (!mounted || !supabase) {
    return <>{children}</>;
  }

  return (
    <Context.Provider value={{ supabase }}>
      {children}
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
