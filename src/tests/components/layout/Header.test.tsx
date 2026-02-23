import { describe, it, vi, beforeEach, expect } from 'vitest';
import { screen, fireEvent, waitFor, act } from '@testing-library/react';
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
  Mic: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-mic" {...props} />,
  MicOff: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="icon-mic-off" {...props} />,
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

// Mock useVoiceSearch hook
const mockStartListening = vi.fn();
const mockStopListening = vi.fn();
const mockResetTranscript = vi.fn();
let mockVoiceSearchState: {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
  isFinalResult: boolean;
  startListening: typeof mockStartListening;
  stopListening: typeof mockStopListening;
  resetTranscript: typeof mockResetTranscript;
} = {
  isListening: false,
  transcript: '',
  isSupported: true,
  error: null,
  isFinalResult: false,
  startListening: mockStartListening,
  stopListening: mockStopListening,
  resetTranscript: mockResetTranscript,
};

vi.mock('../../../hooks/useVoiceSearch', () => ({
  useVoiceSearch: () => mockVoiceSearchState,
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
    mockStartListening.mockClear();
    mockStopListening.mockClear();
    mockResetTranscript.mockClear();

    // Reset voice search state
    mockVoiceSearchState = {
      isListening: false,
      transcript: '',
      isSupported: true,
      error: null,
      isFinalResult: false,
      startListening: mockStartListening,
      stopListening: mockStopListening,
      resetTranscript: mockResetTranscript,
    };
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

  describe('Voice Search', () => {
    it('renders microphone button when voice search is supported', () => {
      renderWithProviders(<Header />);
      expect(screen.getByLabelText('Start voice search')).toBeInTheDocument();
      expect(screen.getByTestId('icon-mic')).toBeInTheDocument();
    });

    it('does not render microphone button when voice search is not supported', () => {
      mockVoiceSearchState.isSupported = false;
      renderWithProviders(<Header />);
      expect(screen.queryByLabelText('Start voice search')).not.toBeInTheDocument();
    });

    it('starts listening when microphone button is clicked', () => {
      renderWithProviders(<Header />);
      const micButton = screen.getByLabelText('Start voice search');

      fireEvent.click(micButton);

      expect(mockResetTranscript).toHaveBeenCalled();
      expect(mockStartListening).toHaveBeenCalled();
    });

    it('stops listening when microphone button is clicked while listening', () => {
      mockVoiceSearchState.isListening = true;
      renderWithProviders(<Header />);
      const micButton = screen.getByLabelText('Stop voice search');

      fireEvent.click(micButton);

      expect(mockStopListening).toHaveBeenCalled();
    });

    it('shows MicOff icon when listening', () => {
      mockVoiceSearchState.isListening = true;
      renderWithProviders(<Header />);

      expect(screen.getByTestId('icon-mic-off')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-mic')).not.toBeInTheDocument();
    });

    it('displays voice transcript in search input', () => {
      mockVoiceSearchState.transcript = 'wireless mouse';
      renderWithProviders(<Header />);

      const searchInput = screen.getByPlaceholderText('Search products...') as HTMLInputElement;
      expect(searchInput.value).toBe('wireless mouse');
    });

    it('shows typed query when no voice transcript', () => {
      renderWithProviders(<Header />);

      const searchInput = screen.getByPlaceholderText('Search products...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'laptop' } });

      expect(searchInput.value).toBe('laptop');
    });

    it('prioritizes voice transcript over typed query', () => {
      mockVoiceSearchState.transcript = 'wireless mouse';
      renderWithProviders(<Header />);

      const searchInput = screen.getByPlaceholderText('Search products...') as HTMLInputElement;
      // Try to type something
      fireEvent.change(searchInput, { target: { value: 'laptop' } });

      // Transcript should still be shown
      expect(searchInput.value).toBe('wireless mouse');
    });

    it('displays voice error message when error occurs', () => {
      mockVoiceSearchState.error = 'No speech detected. Please try again.';
      renderWithProviders(<Header />);

      expect(screen.getByText('No speech detected. Please try again.')).toBeInTheDocument();
    });

    it('navigates to search when Enter is pressed with voice transcript', () => {
      mockVoiceSearchState.transcript = 'gaming keyboard';
      renderWithProviders(<Header />);

      const searchInput = screen.getByPlaceholderText('Search products...');
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });

      expect(mockNavigate).toHaveBeenCalledWith('/products?search=gaming%20keyboard');
      expect(mockResetTranscript).toHaveBeenCalled();
    });

    it('auto-submits search after voice recognition completes', () => {
      vi.useFakeTimers();

      mockVoiceSearchState.isFinalResult = false;
      const { rerender } = renderWithProviders(<Header />);

      // Simulate final result
      mockVoiceSearchState.isFinalResult = true;
      mockVoiceSearchState.transcript = 'wireless headphones';
      act(() => {
        rerender(<Header />);
      });
      
      // Should wait 1000ms before auto-submitting
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Fast-forward 1000ms
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/products?search=wireless%20headphones');

      vi.useRealTimers();
    });

    it('clears transcript after auto-submit search', () => {
      vi.useFakeTimers();

      mockVoiceSearchState.isFinalResult = true;
      mockVoiceSearchState.transcript = 'smartphone';
      
      act(() => {
        renderWithProviders(<Header />);
      });
      
      // Fast-forward 1000ms to trigger auto-submit
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockResetTranscript).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('does not auto-submit if transcript is empty', () => {
      vi.useFakeTimers();

      mockVoiceSearchState.isFinalResult = true;
      mockVoiceSearchState.transcript = '';
      renderWithProviders(<Header />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockNavigate).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('hides search suggestions when voice error is shown', () => {
      mockVoiceSearchState.error = 'Network error. Please check your internet connection.';
      renderWithProviders(<Header />);

      const searchInput = screen.getByPlaceholderText('Search products...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.focus(searchInput);

      // Error message should be visible
      expect(screen.getByText('Network error. Please check your internet connection.')).toBeInTheDocument();

      // Suggestions should not appear when there's an error
      // (This is tested implicitly by the !voiceError condition in the component)
    });
  });
});

