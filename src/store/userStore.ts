import { create } from 'zustand';
import type { User } from '../types';
import { useCartStore } from './cartStore';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user) => {
    const cartStore = useCartStore.getState();
    
    if (user) {
      // User logging in - transfer guest cart to user cart
      cartStore.transferGuestToUser(user.id);
    } else {
      // User logging out - switch to empty guest cart
      cartStore.setUserId(null);
    }
    
    set({ user });
  },
  isAdmin: () => get().user?.role === 'admin',
}));
