import { describe, it, vi, beforeEach, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../renderWithProviders';
import { Header } from '../../../components/layout/Header';

// Mock all external dependencies
vi.mock('lucide-react', () => ({
  ShoppingCart: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-cart" {...props} />,
  User: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-user" {...props} />,
  Search: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-search" {...props} />,
  LogOut: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-logout" {...props} />,
  Shield: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-shield" {...props} />,
  Heart: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-heart" {...props} />,
  Moon: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-moon" {...props} />,
  Sun: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-sun" {...props} />,
  X: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-x" {...props} />,
  Package: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-package" {...props} />,
}));

vi.mock('../../../store/cartStore', () => ({
  useCartStore: (fn: (state: { getTotalItems: () => number }) => unknown) => fn({ getTotalItems: () => 2 }),
}));

const mockUser = { full_name: 'Test User' };
let userState: { full_name: string } | null = mockUser;
const setUser = vi.fn((u) => { userState = u; });
vi.mock('../../../store/userStore', () => ({
  useUserStore: (fn: (state: { user: { full_name: string } | null; setUser: (user: { full_name: string } | null) => void }) => unknown) => fn({ user: userState, setUser }),
}));

vi.mock('../../../hooks/useAdmin', () => ({
  useAdmin: () => ({ isAdmin: true }),
}));

vi.mock('../../../lib/supabase', () => ({
  supabase: { auth: { signOut: vi.fn().mockResolvedValue({}) } },
}));

vi.mock('../../../components/ui/DarkModeToggle', () => ({
  DarkModeToggle: () => <button data-testid="darkmode-toggle">Dark</button>,
}));

vi.mock('../../../components/cart/MiniCart', () => ({
  MiniCart: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => isOpen ? (
    <div data-testid="minicart">
      <button onClick={onClose}>Close</button>
      <span>MiniCart Content</span>
    </div>
  ) : null,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Header', () => {
  beforeEach(() => {
    userState = mockUser;
    setUser.mockClear();
    mockNavigate.mockClear();
  });

  it('renders logo and navigation links', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('ShopHub')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByLabelText('Open shopping cart')).toBeInTheDocument();
    expect(screen.getByTestId('darkmode-toggle')).toBeInTheDocument();
  });

  it('shows cart item count badge', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByLabelText('2 items in cart')).toBeInTheDocument();
  });

  it('shows wishlist and orders links for logged-in user', () => {
    renderWithProviders(<Header />);
    // Open the user menu
    fireEvent.click(screen.getByLabelText('Open user menu'));
    expect(screen.getByLabelText('Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('shows admin panel link for admin', () => {
    renderWithProviders(<Header />);
    expect(screen.getByLabelText('Admin Panel')).toBeInTheDocument();
  });

  it('shows user name and menu button', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByLabelText('Open user menu')).toBeInTheDocument();
  });

  it('calls logout and navigates home', async () => {
    renderWithProviders(<Header />);
    // Open the user menu
    fireEvent.click(screen.getByLabelText('Open user menu'));
    // Click logout in the menu
    fireEvent.click(screen.getByText('Logout'));
    await waitFor(() => {
      expect(setUser).toHaveBeenCalledWith(null);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('opens and closes MiniCart', () => {
    renderWithProviders(<Header />);
    fireEvent.click(screen.getByLabelText('Open shopping cart'));
    expect(screen.getByTestId('minicart')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('minicart')).not.toBeInTheDocument();
  });

  it('opens and closes user menu', async () => {
    renderWithProviders(<Header />);
    // Menu should not be open initially
    expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    
    // Open menu
    fireEvent.click(screen.getByLabelText('Open user menu'));
    expect(screen.getByText('Menu')).toBeInTheDocument();
    
    // Close menu
    fireEvent.click(screen.getByLabelText('Close menu'));
    await waitFor(() => {
      expect(screen.queryByText('Menu')).not.toBeInTheDocument();
    });
  });

  it('shows Sign In button when user is not logged in', () => {
    userState = null;
    renderWithProviders(<Header />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
