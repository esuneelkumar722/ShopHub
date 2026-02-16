import { Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useEffect, useMemo } from 'react';

export const CartPage = () => {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // Calculate order summary values
  const { subtotal, shipping, total } = useMemo(() => {
    const subtotal = getTotalPrice();
    const shipping = 10.00;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }, [getTotalPrice]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
    }
  }, [user, navigate]);

  if (!user) {
    return null; // or a loading state
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-primary">Your Cart is Empty</h1>
        <p className="text-secondary mb-8">Add some products to get started!</p>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-secondary border border-theme rounded-lg p-3 flex items-center gap-2">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-12 h-12 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Product';
                }}
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-xs text-primary truncate">{item.product.name}</h3>
                <p className="text-xs text-secondary">${item.product.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    updateQuantity(item.product_id, item.quantity - 1);
                  }}
                  className="w-5 h-5 rounded border border-theme hover:bg-tertiary focus:outline-none focus-visible text-primary text-xs cursor-pointer"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-medium text-primary">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => {
                    updateQuantity(item.product_id, item.quantity + 1);
                  }}
                  className="w-5 h-5 rounded border border-theme hover:bg-tertiary focus:outline-none focus-visible text-primary text-xs cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="text-xs font-semibold text-primary min-w-[50px] text-right">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>

              <button
                type="button"
                onClick={() => {
                  removeItem(item.product_id);
                }}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none focus-visible cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-secondary border border-theme rounded-lg p-4 sticky top-24 max-w-xs ml-36">
            <h2 className="text-lg font-bold mb-3 text-primary">Order Summary</h2>

            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-sm text-secondary">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-secondary">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-theme pt-2 mt-2">
                <div className="flex justify-between font-bold text-base text-primary">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary w-full text-sm py-2">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
