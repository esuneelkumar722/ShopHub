import { useState, useCallback, useMemo, useTransition, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import type { Product, ProductFilters } from '../types';
import { fetchProducts, fetchCategories } from '../lib/productsApi';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { useWishlist } from '../hooks/useWishlist';
import { useDebounce } from '../hooks/useDebounce';
import { ProductCardSkeleton } from '../components/skeleton/ProductCardSkeleton';
import { ProductQuickView } from '../components/product/ProductQuickView';
import { ShoppingCart, Check, ChevronLeft, ChevronRight, Heart, Eye } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // useTransition marks state updates as non-urgent (won't block UI during search)
  const [, startTransition] = useTransition();

  const [filters, setFilters] = useState<ProductFilters>(() => {
    // Initialize filters from URL parameters
    const categoryParam = searchParams.get('category') || '';
    const searchParam = searchParams.get('search') || '';
    return {
      search: searchParam,
      category: categoryParam,
      sortBy: 'newest'
    };
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const user = useUserStore((state) => state.user);
  const filtersRef = useRef(filters);

  // Update category and search filters when URL parameters change (for navigation/bookmarks)
  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    const searchParam = searchParams.get('search') || '';
    // Only update if the URL params are different from current filters
    // This prevents overriding user selections
    if (categoryParam !== filtersRef.current.category || searchParam !== filtersRef.current.search) {
      // eslint-disable-next-line
      setFilters(prev => ({ ...prev, category: categoryParam, search: searchParam }));
      setCurrentPage(1);
    }
  }, [searchParams]); // Remove filters from dependency to avoid loops

  // Update ref when filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Debounced search value (500ms delay)
  const debouncedSearch = useDebounce(filters.search, 500);

  // Wishlist functionality
  const { wishlistItems, toggleWishlist } = useWishlist({
    requireAuth: false, // Don't throw error for unauthenticated users on products page
    showToasts: false   // Don't show toasts on products page (handled by individual components)
  });

  // useCallback prevents function recreation, keeping reference stable for memoized child components
  const handleAddToCart = useCallback((product: Product) => {
    addItem(product);
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  }, [addItem]);

  // Fetch unique categories from API (mock or real based on environment)
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // SERVER-SIDE PAGINATION: Fetch only products for current page using mocked API
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', debouncedSearch, filters.category, filters.sortBy, currentPage],
    queryFn: async () => {
      return await fetchProducts(
        {
          search: debouncedSearch,
          category: filters.category,
          sortBy: filters.sortBy
        },
        currentPage,
        ITEMS_PER_PAGE
      )
    }
  });

  // Reset to page 1 when filters change
  // useCallback + startTransition = stable function reference + non-blocking updates
  const handleFilterChange = useCallback((newFilters: Partial<ProductFilters>) => {
    startTransition(() => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      setCurrentPage(1);
    });

    // Update URL parameters for category and search changes
    const newSearchParams = new URLSearchParams(searchParams);

    if (newFilters.category !== undefined) {
      if (newFilters.category) {
        newSearchParams.set('category', newFilters.category);
      } else {
        newSearchParams.delete('category');
      }
    }

    if (newFilters.search !== undefined) {
      if (newFilters.search.trim()) {
        newSearchParams.set('search', newFilters.search.trim());
      } else {
        newSearchParams.delete('search');
      }
    }

    setSearchParams(newSearchParams);
  }, [filters, searchParams, setSearchParams]);

  // Pagination: useMemo caches expensive calculations - only recalculates when dependencies change
  const paginationData = useMemo(() => {
    const products = productsData?.products || [];
    const totalProducts = productsData?.totalCount || 0;
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return { products, totalProducts, totalPages, startIndex };
  }, [productsData, currentPage]);

  const { products, totalProducts, totalPages, startIndex } = paginationData;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Products</h1>

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
            onChange={(e) => handleFilterChange({ sortBy: e.target.value as ProductFilters['sortBy'] })}
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
        <div className="mb-4 text-sm text-secondary">
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
          // Show skeleton loaders instead of spinner
          <>
            {[...Array(12)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </>
        ) : products?.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No products found
          </div>
        ) : (
          products?.map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow group relative dark:bg-gray-800">
              {user && (
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:scale-110 transition-transform z-10"
                  title={wishlistItems?.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  aria-label={wishlistItems?.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 ${wishlistItems?.includes(product.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400 dark:text-gray-300'
                      }`}
                  />
                </button>
              )}

              {/* Quick View Button */}
              <button
                onClick={() => setQuickViewProduct(product)}
                className="absolute top-3 left-3 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-10"
                title="Quick view"
                aria-label="Quick view product"
              >
                <Eye className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              <Link to={`/products/${product.id}`}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-48 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    // Use a base64 placeholder to avoid external URL errors
                    e.currentTarget.onerror = null; // Prevent infinite loop
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </Link>
              <Link to={`/products/${product.id}`}>
                <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm ml-1 dark:text-gray-200">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">({product.reviews_count})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  ${product.price.toFixed(2)}
                </span>
                <button
                  className={`btn flex items-center gap-2 transition-all focus-visible ${addedProducts.has(product.id)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'btn-primary'
                    }`}
                  onClick={() => handleAddToCart(product)}
                  aria-label={`Add ${product.name} to cart`}
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

      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          {/* Pagination Numbers */}
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700"
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
                      : 'border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200'
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
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Load More Button (Alternative pagination style) */}
          {currentPage < totalPages && (
            <button
              onClick={() => {
                setCurrentPage(currentPage + 1);
                // Smooth scroll to newly loaded items
                setTimeout(() => {
                  window.scrollTo({
                    top: document.documentElement.scrollHeight - window.innerHeight - 200,
                    behavior: 'smooth'
                  });
                }, 100);
              }}
              className="btn btn-secondary flex items-center gap-2"
            >
              Load More Products
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
