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
    toast.success(`${product.name} added to cart!`);
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image */}
              <div>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full rounded-lg"
                  loading="lazy"
                />
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-sm rounded-full mb-2">
                    {product.category}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        data-testid={i < Math.floor(product.rating) ? 'filled-star' : 'empty-star'}
                        className={`w-5 h-5 ${i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {product.rating.toFixed(1)} ({product.reviews_count} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  ${product.price.toFixed(2)}
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>

                {/* Stock */}
                <div>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center text-sm text-green-600 dark:text-green-400">
                      <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mr-2"></span>
                      {product.stock} in stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm text-red-600 dark:text-red-400">
                      <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full mr-2"></span>
                      Out of stock
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 focus-visible"
                  >
                    <ShoppingCart className="w-5 h-5" />
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
