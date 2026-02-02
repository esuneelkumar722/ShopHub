import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

export const AdminDashboard = () => {
  const { isAdmin, isLoading: adminLoading } = useAdmin();

  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        supabase.from('products').select('id, stock', { count: 'exact' }),
        supabase.from('orders').select('id, total', { count: 'exact' }),
        supabase.rpc('get_user_count'), // We'll create this function
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum: number, order: { total: number }) => sum + Number(order.total), 0) || 0;
      const lowStockProducts = productsRes.data?.filter((p: { stock: number }) => p.stock < 10).length || 0;

      return {
        totalProducts: productsRes.count || 0,
        totalOrders: ordersRes.count || 0,
        totalRevenue,
        totalUsers: usersRes.data || 0,
        lowStockProducts,
      };
    },
    enabled: isAdmin,
  });

  if (adminLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4 dark:text-white">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">You don't have permission to access this page.</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          Go Home →
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-green-500',
      link: '/admin/orders',
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue.toFixed(2) || 0}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      link: '/admin/orders',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-orange-500',
      link: '#',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your e-commerce store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold dark:text-white">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Low Stock Alert */}
      {stats?.lowStockProducts && stats.lowStockProducts > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                {stats.lowStockProducts} products have low stock (less than 10 items)
              </p>
              <Link to="/admin/products" className="text-yellow-700 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 text-sm">
                View Products →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products/new"
            className="bg-primary-600 dark:bg-primary-500 text-white px-6 py-4 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 text-center font-medium"
          >
            + Add New Product
          </Link>
          <Link
            to="/admin/products"
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-6 py-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-center font-medium"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-6 py-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-center font-medium"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};
