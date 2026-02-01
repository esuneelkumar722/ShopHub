import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  // For product detail pages (/products/[id]), hide the product ID from breadcrumbs
  const isProductDetail = pathnames.length >= 2 && pathnames[0] === 'products';
  const displayPathnames = isProductDetail ? pathnames.slice(0, -1) : pathnames;

  const breadcrumbNameMap: Record<string, string> = {
    products: 'Products',
    cart: 'Shopping Cart',
    wishlist: 'Wishlist',
    checkout: 'Checkout',
    orders: 'My Orders',
    admin: 'Admin Panel',
    login: 'Login',
    profile: 'Profile',
  };

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-6 lg:px-8">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            to="/"
            className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors focus-visible"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {displayPathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === displayPathnames.length - 1;
          const name = breadcrumbNameMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <li key={to} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {isLast ? (
                <span className="text-gray-900 dark:text-white font-medium" aria-current="page">
                  {name}
                </span>
              ) : (
                <Link
                  to={to}
                  className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors focus-visible"
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
