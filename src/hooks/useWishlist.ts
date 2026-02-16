import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import { toast } from 'sonner';

interface UseWishlistOptions {
  /** Whether to throw error for unauthenticated users (default: true) */
  requireAuth?: boolean;
  /** Whether to show toast notifications (default: true) */
  showToasts?: boolean;
}

export const useWishlist = (options: UseWishlistOptions = {}) => {
  const { requireAuth = true, showToasts = true } = options;
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  // Fetch wishlist items
  const { data: wishlistItems = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!user) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((item: any) => item.product_id);
    },
    enabled: !!user,
    refetchOnMount: 'always'
  });

  // Toggle wishlist mutation
  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) {
        if (requireAuth) {
          throw new Error('Must be logged in');
        }
        return; // Silent fail for pages that don't require auth
      }

      const isInWishlist = wishlistItems.includes(productId);

      if (isInWishlist) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
        return { action: 'removed', productId };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        return { action: 'added', productId };
      }
    },
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });

      // Get current data
      const previousWishlist = queryClient.getQueryData(['wishlist']);

      // Optimistically update
      queryClient.setQueryData(['wishlist'], (old: string[] | undefined) => {
        if (!old) return [productId];
        const isInWishlist = old.includes(productId);
        return isInWishlist
          ? old.filter(id => id !== productId)
          : [...old, productId];
      });

      return { previousWishlist };
    },
    onError: (error, _productId, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
      }

      // Show error toast if enabled
      if (showToasts) {
        if (error.message === 'Must be logged in') {
          toast.error('Please sign in');
        } else {
          toast.error('Wishlist error');
        }
      }
    },
    onSuccess: (result) => {
      // Refetch to ensure consistency
      queryClient.refetchQueries({ queryKey: ['wishlist'] });

      // Show success toast if enabled
      if (showToasts && user && result) {
        toast.success(
          result.action === 'added'
            ? 'Added'
            : 'Removed'
        );
      }
    }
  });

  return {
    wishlistItems,
    isLoading,
    toggleWishlist: toggleWishlist.mutate,
    isToggling: toggleWishlist.isPending,
    isInWishlist: (productId: string) => wishlistItems.includes(productId)
  };
};