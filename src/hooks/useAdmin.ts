import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';

export const useAdmin = () => {
  const user = useUserStore((state) => state.user);

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['adminRole', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('[useAdmin] No user ID found');
        return false;
      }

      console.log('[useAdmin] Checking admin status for user:', user.id);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('[useAdmin] Error fetching role:', error);
        return false;
      }

      console.log('[useAdmin] Role data:', data);
      const isAdminUser = data?.role === 'admin';
      console.log('[useAdmin] Is admin?', isAdminUser);

      return isAdminUser;
    },
    enabled: !!user?.id,
  });

  return { isAdmin: isAdmin || false, isLoading };
};
