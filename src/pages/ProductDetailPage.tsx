import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product, Review, ProductImage } from '../types';
import { useCartStore } from '../store/cartStore';
import { ProductDetailSkeleton } from '../components/skeleton/ProductDetailSkeleton';
import { ProductRecommendations } from '../components/ProductRecommendations';
import { ImageGallery } from '../components/product/ImageGallery';
import { AddToCartButton } from '../components/cart/AddToCartButton';
import { ShoppingCart, ArrowLeft, Star, Check, Trash2, Edit2, Heart } from 'lucide-react';
import { useState } from 'react';
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

      if (error) {
        // Silently return empty array if reviews table doesn't exist
        console.warn('Reviews table not available:', error.message);
        return [];
      }
      return data as Review[];
    }
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      if (!user || !id) throw new Error('Must be logged in');
      if (editingReviewId) {
        // Update existing review
        const { error } = await (supabase as any)
          .from('reviews')
          .update({
            rating: data.rating,
            comment: data.comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingReviewId);
        if (error) throw error;
      } else {
        // Insert new review
        const { error } = await (supabase as any)
          .from('reviews')
          .insert({
            product_id: id,
            user_id: user.id,
            rating: data.rating,
            comment: data.comment
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
    }
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
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
      const { data, error } = await (supabase as any)
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);
      if (error) throw error;
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
        const { error } = await (supabase as any)
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
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
    if (!reviewComment.trim() || reviewRating === 0) return;
    submitReviewMutation.mutate({ rating: reviewRating, comment: reviewComment });
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
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
            <ImageGallery
              images={[product.image_url, ...productImages.map(img => img.image_url)]}
              productName={product.name}
            />
          ) : (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="w-full rounded-2xl shadow-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/600x600?text=Product+Image';
              }}
            />
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
              {product.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                    }`}
                />
              ))}
              <span className="ml-2 font-medium">{product.rating}</span>
            </div>
            <span className="text-gray-600">({product.reviews_count} reviews)</span>
          </div>

          <div className="mb-6">
            <span className="text-5xl font-bold text-primary-600">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <p className="text-gray-700 text-lg mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-4 mb-8">
            <div className={`px-4 py-2 rounded-lg ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </div>
          </div>

          <div className="flex gap-4">
            <AddToCartButton
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-3 transition-all focus-visible ${added
                ? 'bg-green-600 text-white hover:bg-green-700'
                : product.stock > 0
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {added ? (
                <>
                  <Check className="w-6 h-6" />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-6 h-6" />
                  Add to Cart
                </>
              )}
            </AddToCartButton>

            {user && (
              <button
                onClick={() => product && toggleWishlist.mutate(product.id)}
                className="p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-400 transition-all hover:scale-110 focus-visible"
                aria-label={wishlistItems?.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className={`w-6 h-6 ${wishlistItems?.includes(product.id)
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
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card">
          <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
          <p className="text-gray-600">On orders over $50</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-lg mb-2">Easy Returns</h3>
          <p className="text-gray-600">30-day return policy</p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-lg mb-2">Secure Payment</h3>
          <p className="text-gray-600">SSL encrypted checkout</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>

        {/* Review Form */}
        {user ? (
          !userReview || editingReviewId ? (
            <div className="card mb-8">
              <h3 className="text-xl font-semibold mb-4">
                {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const faces = ['😡', '😞', '😐', '😊', '😍'];
                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewRating(rating)}
                          className={`focus:outline-none text-3xl transition-transform hover:scale-110 ${reviewRating === rating ? 'scale-125' : 'opacity-50'
                            }`}
                          aria-label={`Rate ${rating}`}
                        >
                          {faces[rating - 1]}
                        </button>
                      );
                    })}
                    <span className="ml-2 text-lg font-medium">
                      {reviewRating > 0 ? `${reviewRating}.0` : 'Select a rating'}
                    </span>
                  </div>
                  {reviewRating === 0 && (
                    <p className="text-xs text-red-500 mt-1">Please select a rating</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="input min-h-[120px]"
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
          <div className="card mb-8 text-center">
            <p className="text-gray-600 mb-4">Please sign in to write a review</p>
            <Link to="/login" className="btn btn-primary inline-block">
              Sign In
            </Link>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {review.user?.full_name || review.user?.email || 'Anonymous'}
                      </span>
                      {review.user_id === user?.id && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                          Your Review
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-xl">
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const faces = ['😡', '😞', '😐', '😊', '😍'];
                          return (
                            <span
                              key={rating}
                              className={rating === review.rating ? '' : 'opacity-30'}
                            >
                              {faces[rating - 1]}
                            </span>
                          );
                        })}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {review.user_id === user?.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditReview(review)}
                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded"
                        title="Edit review"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="card text-center text-gray-500">
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
