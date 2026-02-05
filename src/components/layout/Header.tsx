import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Shield, Heart } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../hooks/useAdmin';
import { DarkModeToggle } from '../ui/DarkModeToggle';
import { MiniCart } from '../cart/MiniCart';
import { useQuery } from '@tanstack/react-query';
import { UserMenu } from './UserMenu';

// Animated Hamburger Icon Component
const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <motion.div
      className="w-6 h-6 relative"
      animate={isOpen ? "open" : "closed"}
    >
      <motion.span
        className="absolute top-0 left-0 w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transform-gpu"
        variants={{
          closed: { rotate: 0, y: 0 },
          open: { rotate: 45, y: 8 }
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="absolute top-2 left-0 w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transform-gpu"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 }
        }}
        transition={{ duration: 0.2 }}
      />
      <motion.span
        className="absolute top-4 left-0 w-6 h-0.5 bg-gray-700 dark:bg-gray-200 transform-gpu"
        variants={{
          closed: { rotate: 0, y: 0 },
          open: { rotate: -45, y: -8 }
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

export const Header = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const user = useUserStore((state) => state.user);
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch search suggestions
  const { data: suggestions = [] } = useQuery({
    queryKey: ['search-suggestions', searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];

      const { data, error } = await supabase
        .from('products')
        .select('name')
        .ilike('name', `%${searchQuery}%`)
        .limit(8);

      if (error) {
        console.error('Error fetching suggestions:', error);
        return [];
      }

      // Return unique product names
      const uniqueNames = [...new Set((data as { name: string }[]).map(item => item.name))];
      return uniqueNames.slice(0, 5);
    },
    enabled: searchQuery.length >= 2,
  });

  // Show suggestions when they become available
  useEffect(() => {
    if (suggestions.length > 0 && searchQuery.length >= 2) {
      // eslint-disable-next-line
      setShowSuggestions(true);
    }
  }, [suggestions, searchQuery]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear after navigation
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Auto-submit the search
    navigate(`/products?search=${encodeURIComponent(suggestion)}`);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 mr-4"
              aria-label={isMenuOpen ? "Close user menu" : "Open user menu"}
            >
              <HamburgerIcon isOpen={isMenuOpen} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ShopHub</span>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                  aria-label="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />

                {/* Autocomplete Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(suggestion);
                        }}
                      >
                        <Search className="inline w-4 h-4 mr-2 text-gray-400" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center space-x-6">
              <Link
                to="/products"
                className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded px-2 py-1"
              >
                Products
              </Link>

              <DarkModeToggle />

              <button
                onClick={() => setIsMiniCartOpen(true)}
                className="relative text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded p-1"
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
                  className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded p-1"
                  aria-label="Wishlist"
                >
                  <Heart className="w-6 h-6" />
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-4">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1 text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded px-2 py-1"
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
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
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

      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <UserMenu onClose={() => setIsMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
};
