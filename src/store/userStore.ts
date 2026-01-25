import { create } from 'zustand';
import type { User } from '../types';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAdmin: () => get().user?.role === 'admin',
}));
