import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { Product, ProductFilters } from '../types';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { ShoppingCart, Check, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export const ProductsPage = () => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const addItem = useCartStore((state) => state.addItem);
  const user = useUserStore((state) => state.user);
  const queryClient = useQueryClient();

  // Fetch wishlist items
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

  // Toggle wishlist
  const toggleWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) return;
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
    onError: (_err, _productId, context) => {
      // Rollback on error
      if (context?.previousWishlist) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
      }
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

  // Fetch unique categories from database
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');

      if (error) throw error;
      const uniqueCategories = [...new Set(data.map((p: any) => p.category))];
      return uniqueCategories as string[];
    }
  });

  // SERVER-SIDE PAGINATION: Fetch only products for current page
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', filters, currentPage],
    queryFn: async () => {
      // Calculate range for current page
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' }); // Get total count for pagination

      // Apply category filter
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Apply search filter
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination - fetch only needed rows
      query = query.range(startIndex, endIndex);

      const { data, error, count } = await query;
      if (error) throw error;
      
      return {
        products: data as Product[],
        totalCount: count || 0
      };
    }
  });

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
  };

  // Pagination calculations
  const products = productsData?.products || [];
  const totalProducts = productsData?.totalCount || 0;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      {/* Filters */}
      <div className="mb-8 card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            className="input"
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />

          <select
            className="input"
            value={filters.category}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories?.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Product Count */}
      {!isLoading && !error && products.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, totalProducts)} of {totalProducts} products
        </div>
      )}

      {/* Products Grid */}
      {error && (
        <div className="col-span-full text-center py-12">
          <p className="text-red-600 mb-2">Error loading products</p>
          <p className="text-sm text-gray-500">Please check your Supabase configuration</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : products?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No products found
          </div>
        ) : (
          products?.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow group relative">
              {user && (
                <button
                  onClick={() => toggleWishlist.mutate(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform z-10"
                  title={wishlistItems?.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      wishlistItems?.includes(product.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              )}
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
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm ml-1">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({product.reviews_count})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary-600">
                  ${product.price.toFixed(2)}
                </span>
                <button
                  className={`btn flex items-center gap-2 transition-all ${addedProducts.has(product.id)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'btn-primary'
                    }`}
                  onClick={() => handleAddToCart(product)}
                >
                  {addedProducts.has(product.id) ? (
                    <>
                      <Check className="w-4 h-4" />
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
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              const showPage =
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1);

              // Show ellipsis
              const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
              const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

              if (!showPage && !showEllipsisBefore && !showEllipsisAfter) {
                return null;
              }

              if (showEllipsisBefore || showEllipsisAfter) {
                return (
                  <span key={page} className="px-3 py-2 text-gray-400">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-lg ${currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
