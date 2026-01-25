import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, Shield, Heart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../hooks/useAdmin';

export const Header = () => {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ShopHub</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              to="/products"
              className="text-gray-700 hover:text-primary-600 font-medium"
            >
              Products
            </Link>

            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-primary-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {user && (
              <Link
                to="/wishlist"
                className="text-gray-700 hover:text-primary-600"
                title="Wishlist"
              >
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 text-purple-700 hover:text-purple-800 font-medium"
                    title="Admin Panel"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-5 h-5 text-gray-700" />
                  <span className="font-medium text-gray-900">{user.full_name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-primary"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
