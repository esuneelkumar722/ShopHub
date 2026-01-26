import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, Shield, Heart } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../hooks/useAdmin';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import { MiniCart } from '../cart/MiniCart';

export const Header = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 focus-visible">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ShopHub</span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                  aria-label="Search products"
                />
              </div>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-6">
              <Link
                to="/products"
                className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium focus-visible"
              >
                Products
              </Link>

              <DarkModeToggle />

              <button
                onClick={() => setIsMiniCartOpen(true)}
                className="relative text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 focus-visible"
                aria-label="Open shopping cart"
              >
                <ShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    aria-label={`${totalItems} items in cart`}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {user && (
                <Link
                  to="/wishlist"
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 focus-visible"
                  aria-label="Wishlist"
                >
                  <Heart className="w-6 h-6" />
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-4">
                  <Link
                    to="/orders"
                    className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium focus-visible"
                  >
                    Orders
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium focus-visible"
                      aria-label="Admin Panel"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="sr-only">Admin Panel</span>
                    </Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <span className="font-medium text-gray-900 dark:text-white">{user.full_name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors focus-visible"
                    aria-label="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary focus-visible"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMiniCartOpen && (
          <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};
