import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => set((state) => {
        const existingItem = state.items.find(item => item.product_id === product.id);

        if (existingItem) {
          return {
            items: state.items.map(item =>
              item.product_id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          };
        }

        return {
          items: [
            ...state.items,
            {
              id: crypto.randomUUID(),
              product_id: product.id,
              quantity: 1,
              product
            }
          ]
        };
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.product_id !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter(item => item.product_id !== productId) };
        }

        return {
          items: state.items.map(item =>
            item.product_id === productId ? { ...item, quantity } : item
          )
        };
      }),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
