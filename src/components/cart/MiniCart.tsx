import { Link } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { motion } from 'framer-motion';
import { useKeyboardNavigation, useFocusTrap } from '../../hooks/useAccessibility';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiniCart = ({ isOpen, onClose }: MiniCartProps) => {
  useKeyboardNavigation(onClose);
  useFocusTrap(isOpen);

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus-visible"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
              >
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm mt-1">
                    ${item.product.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateQuantity(item.product_id, Math.max(1, item.quantity - 1));
                      }}
                      className="w-6 h-6 rounded border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm dark:text-white" aria-live="polite">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        updateQuantity(item.product_id, item.quantity + 1);
                      }}
                      className="w-6 h-6 rounded border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeItem(item.product_id);
                      }}
                      className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm focus:outline-none focus-visible"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t dark:border-gray-700 p-4 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span className="dark:text-white">Total:</span>
              <span className="text-primary-600 dark:text-primary-400">${getTotalPrice().toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block w-full bg-primary-600 text-white text-center py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors focus-visible"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="block w-full text-center py-2 text-primary-600 dark:text-primary-400 hover:underline focus-visible"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </motion.div>
    </>
  );
};
