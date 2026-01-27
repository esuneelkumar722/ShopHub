import { Trash2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { Link } from 'react-router-dom';

export const CartPage = () => {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-primary">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex items-center gap-4">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Product';
                }}
              />

              <div className="flex-1">
                <h3 className="font-semibold text-lg text-primary">{item.product.name}</h3>
                <p className="text-secondary">${item.product.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg border border-theme hover:bg-tertiary text-primary"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium text-primary">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-theme hover:bg-tertiary text-primary"
                >
                  +
                </button>
              </div>

              <div className="text-lg font-semibold text-primary">
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>

              <button
                onClick={() => removeItem(item.product_id)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-primary">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-secondary">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Shipping</span>
                <span>$10.00</span>
              </div>
              <div className="border-t border-theme pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Total</span>
                  <span>${(getTotalPrice() + 10).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary w-full">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
