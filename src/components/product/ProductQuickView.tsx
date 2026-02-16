import { X, Star, ShoppingCart } from 'lucide-react';
import type { Product } from '../../types';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useKeyboardNavigation, useFocusTrap } from '../../hooks/useAccessibility';
import { toast } from 'sonner';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickView = ({ product, isOpen, onClose }: ProductQuickViewProps) => {
  useKeyboardNavigation(onClose);
  useFocusTrap(isOpen);

  const addItem = useCartStore((state) => state.addItem);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addItem(product);
    toast.success('Added to cart');
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md sm:max-w-md md:max-w-lg max-h-[80vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 p-4 flex items-center justify-between z-10">
            <h2 id="quick-view-title" className="text-xl font-semibold dark:text-white">
              Quick View
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus-visible"
              aria-label="Close quick view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-4 items-start">
              {/* Image with fixed aspect ratio and object-cover */}
              <div className="w-full flex items-center justify-center">
                <div className="w-full aspect-[4/3] max-w-[180px] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover object-center rounded-lg max-h-44"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs rounded-full mb-1">
                    {product.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        data-testid={i < Math.floor(product.rating) ? 'filled-star' : 'empty-star'}
                        className={`w-4 h-4 ${i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {product.rating.toFixed(1)} ({product.reviews_count} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  ${product.price.toFixed(2)}
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  {product.description}
                </p>

                {/* Stock */}
                <div>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center text-xs text-green-600 dark:text-green-400">
                      <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mr-1"></span>
                      {product.stock} in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs text-red-600 dark:text-red-400">
                      <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full mr-1"></span>
                      Out of stock
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus-visible text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
