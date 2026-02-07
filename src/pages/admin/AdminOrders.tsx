import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../hooks/useAdmin';
import { Link } from 'react-router-dom';

type Order = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }[];
  user?: {
    email: string;
    full_name: string;
  };
};

type FetchedOrder = Omit<Order, 'user'>;

export const AdminOrders = () => {
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          total,
          status,
          created_at,
          order_items (
            id,
            quantity,
            price,
            product:products (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user details separately
      const ordersWithUsers = await Promise.all(
        data.map(async (order: FetchedOrder) => {
          const { data: userData } = await supabase
            .from('users')
            .select('email, full_name')
            .eq('id', order.user_id)
            .single();

          return { ...order, user: userData ? userData : undefined };
        })
      );

      // Note: Type assertion needed due to dynamic user field addition
      return ordersWithUsers as Order[];
    },
    enabled: isAdmin,
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      // Note: Using 'as any' due to TypeScript strict mode with Supabase update types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      alert('Order status updated!');
    },
    onError: (error: unknown) => {
      alert('Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    },
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <Link to="/" className="text-primary-600">Go Home →</Link>
      </div>
    );
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const filteredOrders = orders?.filter((order) =>
    statusFilter === 'all' ? true : order.status === statusFilter
  );

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Orders Management</h1>
        <p className="text-gray-600 dark:text-gray-300">View and manage all customer orders</p>
      </div>

      {/* Status Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === status
                ? 'bg-primary-600 dark:bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'all' && orders && ` (${orders.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                    <p className="font-mono font-medium dark:text-white">{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                    <p className="font-medium dark:text-white">{order.user?.full_name || order.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                    <p className="font-medium dark:text-white">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                    <p className="font-bold text-lg dark:text-white">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updateStatusMutation.isPending}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm font-medium dark:bg-gray-700 dark:text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Items ({order.order_items.length})
                  </p>
                  <div className="space-y-1">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="text-sm text-gray-600 dark:text-gray-300">
                        {item.quantity}x {item.product.name} - ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No orders found with the selected filter.</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
        Showing {filteredOrders?.length || 0} of {orders?.length || 0} orders
      </div>
    </div>
  );
};
