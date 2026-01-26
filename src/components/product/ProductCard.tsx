import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Heart, Eye } from 'lucide-react';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  isInWishlist: boolean;
  isAdded: boolean;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  showWishlist: boolean;
}

// React.memo prevents re-rendering if props haven't changed
export const ProductCard = memo(({
  product,
  isInWishlist,
  isAdded,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  showWishlist
}: ProductCardProps) => {
  return (
    <div className="card hover:shadow-lg transition-shadow group relative dark:bg-gray-800">
      {showWishlist && (
        <button
          onClick={() => onToggleWishlist(product.id)}
          className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:scale-110 transition-transform z-10"
          title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-5 h-5 ${isInWishlist
              ? 'fill-red-500 text-red-500'
              : 'text-gray-400 dark:text-gray-300'
              }`}
          />
        </button>
      )}

      {/* Quick View Button */}
      <button
        onClick={() => onQuickView(product)}
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
          className={`btn flex items-center gap-2 transition-all focus-visible ${isAdded
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'btn-primary'
            }`}
          onClick={() => onAddToCart(product)}
          aria-label={`Add ${product.name} to cart`}
        >
          {isAdded ? (
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
  );
});

ProductCard.displayName = 'ProductCard';
