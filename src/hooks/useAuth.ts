import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';

export const useAuth = () => {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          role: 'user',
          created_at: session.user.created_at!
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          role: 'user',
          created_at: session.user.created_at!
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);
};
