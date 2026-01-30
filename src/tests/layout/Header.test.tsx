import { renderWithProviders, screen } from '../renderWithProviders';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock the stores with proper implementations
vi.mock('../../store/cartStore', () => ({
  useCartStore: vi.fn((selector) => {
    if (selector) {
      return selector({
        getTotalItems: () => 2,
        items: [],
        addItem: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
      });
    }
    return {
      getTotalItems: () => 2,
      items: [],
      addItem: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
    };
  })
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn((selector) => {
    if (selector) {
      return selector({
        user: { full_name: 'Test User' },
        setUser: vi.fn(),
        clearUser: vi.fn(),
      });
    }
    return {
      user: { full_name: 'Test User' },
      setUser: vi.fn(),
      clearUser: vi.fn(),
    };
  })
}));

vi.mock('../../hooks/useAdmin', () => ({
  useAdmin: vi.fn(() => ({ isAdmin: true }))
}));

vi.mock('../../lib/supabase', () => ({
  supabase: { auth: { signOut: vi.fn() } }
}));

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

vi.mock('../../components/cart/MiniCart', () => ({
  MiniCart: () => <div data-testid="minicart-mock" />
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() })
}));

import { Header } from '../../components/layout/Header';

describe('Header', () => {
  it('renders logo, search, and navigation', () => {
    renderWithProviders(<Header />, { wrapper: MemoryRouter });
    expect(screen.getByText('ShopHub')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    expect(screen.getByLabelText('Open shopping cart')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByLabelText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByLabelText('Logout')).toBeInTheDocument();
  });

  it('shows cart badge with item count', () => {
    renderWithProviders(<Header />, { wrapper: MemoryRouter });
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});