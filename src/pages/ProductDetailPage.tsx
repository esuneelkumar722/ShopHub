import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product, Review, ProductImage } from '../types';
import { useCartStore } from '../store/cartStore';
import { ProductDetailSkeleton } from '../components/skeleton/ProductDetailSkeleton';
import { ProductRecommendations } from '../components/product/ProductRecommendations';
import { ImageGallery } from '../components/product/ImageGallery';
import { AddToCartButton } from '../components/cart/AddToCartButton';
import { ShoppingCart, ArrowLeft, Star, Check, Trash2, Edit2, Heart } from 'lucide-react';
import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { toast } from 'sonner';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  const user = useUserStore((state) => state.user);
  const [added, setAdded] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('Product ID is required');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    }
  });

  // Fetch product images
  const { data: productImages = [] } = useQuery({
    queryKey: ['product-images', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('display_order', { ascending: true });

      if (error) return [];
      return data as ProductImage[];
    }
  });

  // Fetch reviews for this product
  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        // First try with user join
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('reviews')
          .select(`
            *,
            user:user_id (
              email,
              full_name
            )
          `)
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (!error) {
          return data as Review[];
        }

        console.warn('User join failed, trying without:', error.message);

        // Fallback: get reviews without user data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: simpleData, error: simpleError } = await (supabase as any)
          .from('reviews')
          .select('*')
          .eq('product_id', id)
          .order('created_at', { ascending: false });

        if (simpleError) {
          console.error('Simple reviews query failed:', simpleError);
          return [];
        }

        // Add dummy user data for display
        return simpleData.map((review: Omit<Review, 'user'>) => ({
          ...review,
          user: { email: `User ${review.user_id?.slice(0, 8)}...`, full_name: null }
        })) as Review[];

      } catch (err) {
        console.error('Reviews query completely failed:', err);
        return [];
      }
    }
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      if (!user || !id) throw new Error('Must be logged in');
      if (editingReviewId) {
        // Update existing review
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('reviews')
          .update({
            ...(reviewRating > 0 && { rating: reviewRating }), // Only include rating if > 0
            comment: data.comment,
            user_name: user.full_name || user.email.split('@')[0], // Update display name
            updated_at: new Date().toISOString()
          })
          .eq('id', editingReviewId);
        if (error) throw error;
      } else {
        // Insert new review
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('reviews')
          .insert({
            product_id: id,
            user_id: user.id,
            ...(reviewRating > 0 && { rating: reviewRating }), // Only include rating if > 0
            comment: data.comment,
            user_name: user.full_name || user.email.split('@')[0] // Store display name
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      setReviewRating(0);
      setReviewComment('');
      setEditingReviewId(null);
      toast.success(editingReviewId ? 'Review updated successfully!' : 'Review submitted successfully!');
    },
    onError: (error) => {
      console.error('Review submission error:', error);
      toast.error(`Failed to ${editingReviewId ? 'update' : 'submit'} review: ${error.message}`);
    }
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('reviews')
        .delete()
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    }
  });

  // Fetch wishlist
  const { data: wishlistItems } = useQuery({
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
      if (!user) throw new Error('Must be logged in');
      const isInWishlist = wishlistItems?.includes(productId);

      if (isInWishlist) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
      }
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = queryClient.getQueryData(['wishlist']);

      queryClient.setQueryData(['wishlist'], (old: string[] | undefined) => {
        if (!old) return [productId];
        const isInWishlist = old.includes(productId);
        return isInWishlist
          ? old.filter(id => id !== productId)
          : [...old, productId];
      });

      return { previousWishlist };
    },
    onError: (_err, _productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['wishlist'] });
    }
  });

  // Update user_name for existing reviews by current user
  React.useEffect(() => {
    if (user && reviews && reviews.length > 0) {
      const userReviewsWithoutName = reviews.filter(review =>
        review.user_id === user.id && !review.user_name
      );

      if (userReviewsWithoutName.length > 0) {
        // Update these reviews with the user's name
        const updatePromises = userReviewsWithoutName.map(review =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase as any)
            .from('reviews')
            .update({
              user_name: user.full_name || user.email.split('@')[0]
            })
            .eq('id', review.id)
        );

        Promise.all(updatePromises).then(() => {
          // Refresh reviews after updating
          queryClient.invalidateQueries({ queryKey: ['reviews', id] });
        }).catch(err => {
          console.warn('Failed to update review user names:', err);
        });
      }
    }
  }, [user, reviews, id, queryClient]);

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add products to your cart');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (product) {
      addItem(product);
      toast.success(`${product.name} added to cart!`);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    submitReviewMutation.mutate({ rating: reviewRating, comment: reviewComment });
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating || 0);
    setReviewComment(review.comment);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setReviewRating(0);
    setReviewComment('');
  };

  const userReview = reviews?.find((r) => r.user_id === user?.id);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Link to="/products" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 focus-visible"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image Gallery */}
        <div>
          {productImages.length > 0 ? (
            <div className="w-full max-w-sm mx-auto">
              <ImageGallery
                images={[product.image_url, ...productImages.map(img => img.image_url)]}
                productName={product.name}
              />
            </div>
          ) : (
            <div className="w-full max-w-sm mx-auto">
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="w-full h-auto max-h-80 object-cover rounded-2xl shadow-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Product+Image';
                }}
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-3">
            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium capitalize">
              {product.category}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                    }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">{product.rating}</span>
            </div>
            <span className="text-sm text-gray-600">({product.reviews_count} reviews)</span>
          </div>

          <div className="mb-4">
            <span className="text-3xl font-bold text-primary-600">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <p className="text-gray-700 text-base mb-6 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-3 mb-6">
            <div className={`px-3 py-1 rounded-md text-sm ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          </div>

          <div className="flex gap-3">
            <AddToCartButton
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 py-3 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all focus-visible ${added
                ? 'bg-green-600 text-white hover:bg-green-700'
                : product.stock > 0
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </AddToCartButton>

            {user && (
              <button
                onClick={() => product && toggleWishlist.mutate(product.id)}
                className="p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-400 transition-all hover:scale-105 focus-visible"
                aria-label={wishlistItems?.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className={`w-5 h-5 ${wishlistItems?.includes(product.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-400'
                    }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold text-base mb-1">Free Shipping</h3>
          <p className="text-gray-600 text-sm">On orders over $50</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-base mb-1">Easy Returns</h3>
          <p className="text-gray-600 text-sm">30-day return policy</p>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-base mb-1">Secure Payment</h3>
          <p className="text-gray-600 text-sm">SSL encrypted checkout</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {/* Review Form */}
        {user ? (
          !userReview || editingReviewId ? (
            <div className="card mb-6 p-6">
              <h3 className="text-lg font-semibold mb-3">
                {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Rating (Optional)</label>
                  <div className="flex gap-1 items-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewRating(rating)}
                        className="focus:outline-none transition-colors hover:scale-110"
                        aria-label={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-6 h-6 ${rating <= reviewRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-400'
                            }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                      {reviewRating > 0 ? `${reviewRating} star${reviewRating > 1 ? 's' : ''}` : 'No rating'}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="input min-h-[80px]"
                    placeholder="Share your thoughts about this product..."
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitReviewMutation.isPending}
                    className="btn btn-primary"
                  >
                    {submitReviewMutation.isPending
                      ? 'Submitting...'
                      : editingReviewId
                        ? 'Update Review'
                        : 'Submit Review'}
                  </button>
                  {editingReviewId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn border border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : null
        ) : (
          <div className="card mb-6 p-4 text-center">
            <p className="text-gray-600 mb-3">Please sign in to write a review</p>
            <Link to="/login" className="btn btn-primary inline-block">
              Sign In
            </Link>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {review.user_id === user?.id
                          ? (user.full_name || user.email.split('@')[0])
                          : (review.user_name || review.user?.full_name || review.user?.email || `User ${review.user_id?.slice(0, 8)}...` || 'Anonymous')
                        }
                      </span>
                      {review.user_id === user?.id && (
                        <span className="text-xs bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 px-2 py-1 rounded">
                          Your Review
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {review.rating ? (
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Star
                              key={rating}
                              className={`w-4 h-4 ${rating <= review.rating!
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No rating</span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {review.user_id === user?.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-1 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                        title="Edit review"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="card p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No reviews yet. Be the first to review this product!
            </div>
          )}
        </div>
      </div>

      {/* Product Recommendations */}
      <ProductRecommendations
        currentProductId={product.id}
        category={product.category}
      />
    </div>
  );
};
