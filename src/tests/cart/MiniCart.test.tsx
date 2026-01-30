import { renderWithProviders, screen, fireEvent } from '../renderWithProviders';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { CartItem, Product } from '../../types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, initial, animate, exit, transition, role, 'aria-label': ariaLabel, 'aria-modal': ariaModal, ...props }: any) => (
      <div
        className={className}
        onClick={onClick}
        role={role}
        aria-label={ariaLabel}
        aria-modal={ariaModal}
        {...props}
      >
        {children}
      </div>
    ),
  },
}));

// Mock accessibility hooks
vi.mock('../../hooks/useAccessibility', () => ({
  useKeyboardNavigation: vi.fn(),
  useFocusTrap: vi.fn(),
}));

// Mock cart store with controllable state
const mockCartStore = {
  items: [] as CartItem[],
  addItem: vi.fn(),
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  clearCart: vi.fn(),
  getTotalPrice: vi.fn(() => 0),
  getTotalItems: vi.fn(() => 0),
};

vi.mock('../../store/cartStore', () => ({
  useCartStore: vi.fn((selector) => {
    if (selector) {
      return selector(mockCartStore);
    }
    return mockCartStore;
  })
}));

import { MiniCart } from '../../components/cart/MiniCart';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'A test product',
  price: 29.99,
  category: 'Electronics',
  image_url: 'https://example.com/image.jpg',
  stock: 10,
  rating: 4.5,
  reviews_count: 25,
  created_at: '2023-01-01T00:00:00Z',
};

const mockCartItem: CartItem = {
  id: 'cart-1',
  product_id: '1',
  quantity: 2,
  product: mockProduct,
};

describe('MiniCart', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock store state
    mockCartStore.items = [] as CartItem[];
    mockCartStore.getTotalPrice.mockReturnValue(0);
    mockCartStore.getTotalItems.mockReturnValue(0);
  });

  it('does not render when isOpen is false', () => {
    renderWithProviders(
      <MiniCart {...defaultProps} isOpen={false} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders cart header with item count', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];
    mockCartStore.getTotalItems.mockReturnValue(2);

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Shopping Cart (1)')).toBeInTheDocument();
  });

  it('shows empty cart state when no items', () => {
    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });

  it('renders cart items with product details', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];
    mockCartStore.getTotalPrice.mockReturnValue(59.98);
    mockCartStore.getTotalItems.mockReturnValue(2);

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Test Product' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    const closeButton = screen.getByLabelText('Close cart');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    // Find backdrop by its unique class combination
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('calls updateQuantity when increase button is clicked', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    const increaseButton = screen.getByLabelText('Increase quantity');
    fireEvent.click(increaseButton);

    expect(mockCartStore.updateQuantity).toHaveBeenCalledWith('cart-1', 3);
  });

  it('calls updateQuantity when decrease button is clicked', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    const decreaseButton = screen.getByLabelText('Decrease quantity');
    fireEvent.click(decreaseButton);

    expect(mockCartStore.updateQuantity).toHaveBeenCalledWith('cart-1', 1);
  });

  it('calls removeItem when remove button is clicked', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    const removeButton = screen.getByLabelText('Remove Test Product from cart');
    fireEvent.click(removeButton);

    expect(mockCartStore.removeItem).toHaveBeenCalledWith('cart-1');
  });

  it('shows total price and checkout links when items exist', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];
    mockCartStore.getTotalPrice.mockReturnValue(59.98);

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    expect(screen.getByText('Total:')).toBeInTheDocument();
    expect(screen.getByText('$59.98')).toBeInTheDocument();
    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    expect(screen.getByText('View Full Cart')).toBeInTheDocument();
  });

  it('calls onClose when checkout link is clicked', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    const checkoutLink = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutLink);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when view full cart link is clicked', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    const viewCartLink = screen.getByText('View Full Cart');
    fireEvent.click(viewCartLink);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('handles multiple clicks', () => {
    // Set up cart with items
    mockCartStore.items = [mockCartItem];

    renderWithProviders(<MiniCart {...defaultProps} />, { wrapper: MemoryRouter });

    const closeButton = screen.getByLabelText('Close cart');
    fireEvent.click(closeButton);
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });
});