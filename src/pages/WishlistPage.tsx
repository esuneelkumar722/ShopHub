import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../store/userStore';
import { useCartStore } from '../store/cartStore';
import type { Product } from '../types';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';

export const WishlistPage = () => {
  const user = useUserStore((state) => state.user);
  const addItem = useCartStore((state) => state.addItem);
  const queryClient = useQueryClient();
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  // Fetch wishlist items
  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from('wishlist')
        .select(`
          id,
          product_id,
          created_at,
          products (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchOnMount: 'always'
  });

  // Remove from wishlist mutation
  const removeFromWishlist = useMutation({
    mutationFn: async (wishlistId: string) => {
      const { error } = await (supabase as any)
        .from('wishlist')
        .delete()
        .eq('id', wishlistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['wishlist'] });
    }
  });

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
        <p className="text-gray-600 mb-6">Please sign in to view your wishlist</p>
        <Link to="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-primary-600 fill-primary-600" />
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <span className="text-gray-500">({wishlistItems?.length || 0} items)</span>
      </div>

      {wishlistItems && wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item: any) => {
            const product = item.products;

            // Skip if product was deleted
            if (!product) return null;

            return (
              <div key={item.id} className="card hover:shadow-lg transition-shadow relative group">
                <button
                  onClick={() => removeFromWishlist.mutate(item.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>

                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Product+Image';
                    }}
                  />
                </Link>

                <Link to={`/products/${product.id}`}>
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews_count})</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-primary-600">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className={`btn flex items-center gap-2 ${addedProducts.has(product.id)
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'btn-primary'
                      } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {addedProducts.has(product.id) ? (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Added!
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Add
                      </>
                    )}
                  </button>
                </div>

                {product.stock === 0 && (
                  <p className="text-xs text-red-500 mt-2">Out of stock</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Start adding products you love!</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      )}
    </div>
  );
};
