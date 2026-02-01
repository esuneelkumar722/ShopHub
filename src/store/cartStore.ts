import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartStore {
  guestItems: CartItem[];
  userItems: Record<string, CartItem[]>;
  currentUserId: string | null;
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setUserId: (userId: string | null) => void;
  transferGuestToUser: (userId: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      guestItems: [],
      userItems: {},
      currentUserId: null,
      items: [],

      addItem: (product) => set((state) => {
        const existingItem = state.items.find(item => item.product_id === product.id);

        let newItems;
        if (existingItem) {
          newItems = state.items.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [
            ...state.items,
            {
              id: crypto.randomUUID(),
              product_id: product.id,
              quantity: 1,
              product
            }
          ];
        }

        // Update the appropriate storage
        if (state.currentUserId) {
          return {
            items: newItems,
            userItems: {
              ...state.userItems,
              [state.currentUserId]: newItems
            }
          };
        } else {
          return { 
            items: newItems,
            guestItems: newItems 
          };
        }
      }),

      removeItem: (productId) => set((state) => {
        const newItems = state.items.filter(item => item.product_id !== productId);

        if (state.currentUserId) {
          return {
            items: newItems,
            userItems: {
              ...state.userItems,
              [state.currentUserId]: newItems
            }
          };
        } else {
          return { 
            items: newItems,
            guestItems: newItems 
          };
        }
      }),

      updateQuantity: (productId, quantity) => set((state) => {
        let newItems;
        if (quantity <= 0) {
          newItems = state.items.filter(item => item.product_id !== productId);
        } else {
          newItems = state.items.map(item =>
            item.product_id === productId ? { ...item, quantity } : item
          );
        }

        if (state.currentUserId) {
          return {
            items: newItems,
            userItems: {
              ...state.userItems,
              [state.currentUserId]: newItems
            }
          };
        } else {
          return { 
            items: newItems,
            guestItems: newItems 
          };
        }
      }),

      clearCart: () => set((state) => {
        if (state.currentUserId) {
          return {
            items: [],
            userItems: {
              ...state.userItems,
              [state.currentUserId]: []
            }
          };
        } else {
          return { 
            items: [],
            guestItems: [] 
          };
        }
      }),

      setUserId: (userId) => set((state) => {
        const newItems = userId ? state.userItems[userId] || [] : state.guestItems;
        return {
          currentUserId: userId,
          items: newItems
        };
      }),

      transferGuestToUser: (userId) => set((state) => {
        const guestItems = [...state.guestItems];
        if (guestItems.length > 0) {
          return {
            userItems: {
              ...state.userItems,
              [userId]: [...(state.userItems[userId] || []), ...guestItems]
            },
            guestItems: [],
            currentUserId: userId,
            items: [...(state.userItems[userId] || []), ...guestItems]
          };
        } else {
          // No guest items, just switch to user cart
          const userCart = state.userItems[userId] || [];
          return {
            currentUserId: userId,
            items: userCart
          };
        }
      }),

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
