import { motion } from 'framer-motion';
import { X, Heart, Package, User, LogOut, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';
import { useAdmin } from '../../hooks/useAdmin';

interface UserMenuProps {
  onClose: () => void;
}

export const UserMenu = ({ onClose }: UserMenuProps) => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();
  const { mode, setThemeMode } = useTheme();
  const { isAdmin } = useAdmin();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
    onClose();
  };

  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setThemeMode(newMode);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black bg-opacity-20 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
          duration: 0.4
        }}
        className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-r border-gray-200 dark:border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <motion.div
          className="flex-1 overflow-y-auto p-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
        >
          {/* User Info */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="mb-6"
          >
            {user ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Signed in</p>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                onClick={onClose}
                className="btn btn-primary w-full"
              >
                Sign In
              </Link>
            )}
          </motion.div>

          {/* Navigation */}
          <motion.nav
            className="space-y-2 mb-6"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <Link
              to="/wishlist"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </Link>
            <Link
              to="/orders"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200"
            >
              <Package className="w-5 h-5" />
              <span>Orders</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-purple-700 dark:text-purple-300"
              >
                <Shield className="w-5 h-5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </motion.nav>

          {/* Theme Settings */}
          <motion.div
            className="mb-6"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
          >
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Theme</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={mode === 'light'}
                  onChange={() => handleThemeChange('light')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-200">Light</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={mode === 'dark'}
                  onChange={() => handleThemeChange('dark')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-200">Dark</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={mode === 'system'}
                  onChange={() => handleThemeChange('system')}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700 dark:text-gray-200">System</span>
              </label>
            </div>
          </motion.div>

          {/* Logout */}
          {user && (
            <motion.button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 w-full text-left"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};