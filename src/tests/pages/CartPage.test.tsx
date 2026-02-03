import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { CartPage } from '../../pages/CartPage';
import { renderWithProviders } from '../renderWithProviders';

// Mock dependencies
const mockUseCartStore = vi.fn(() => ({
  items: [
    {
      id: '1',
      product_id: 'prod1',
      quantity: 2,
      product: {
        id: 'prod1',
        name: 'Test Product',
        price: 25.99,
        image_url: 'test.jpg'
      }
    }
  ],
  removeItem: vi.fn(),
  updateQuantity: vi.fn(),
  getTotalPrice: vi.fn(() => 51.98)
}));

vi.mock('../../store/cartStore', () => ({
  useCartStore: mockUseCartStore
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn(() => ({
    user: { id: 'user1', email: 'test@example.com' }
  }))
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn())
  };
});

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty cart message when no items', () => {
    mockUseCartStore.mockReturnValue({
      items: [],
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      getTotalPrice: vi.fn(() => 0)
    });

    renderWithProviders(<CartPage />);

    expect(screen.getByText('Your Cart is Empty')).toBeInTheDocument();
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument();
  });

  it('renders cart items when items exist', () => {
    mockUseCartStore.mockReturnValue({
      items: [
        {
          id: '1',
          product_id: 'prod1',
          quantity: 2,
          product: {
            id: 'prod1',
            name: 'Test Product',
            price: 25.99,
            image_url: 'test.jpg'
          }
        }
      ],
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      getTotalPrice: vi.fn(() => 51.98)
    });

    renderWithProviders(<CartPage />);

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders order summary with correct calculations', async () => {
    mockUseCartStore.mockReturnValue({
      items: [
        {
          id: '1',
          product_id: 'prod1',
          quantity: 2,
          product: {
            id: 'prod1',
            name: 'Test Product',
            price: 25.99,
            image_url: 'test.jpg'
          }
        }
      ],
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      getTotalPrice: vi.fn(() => 51.98)
    });

    renderWithProviders(<CartPage />);

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    const prices = await screen.findAllByText('$51.98');
    expect(prices.length).toBeGreaterThan(0);
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$61.98')).toBeInTheDocument();
  });

  it('renders proceed to checkout button', () => {
    mockUseCartStore.mockReturnValue({
      items: [
        {
          id: '1',
          product_id: 'prod1',
          quantity: 2,
          product: {
            id: 'prod1',
            name: 'Test Product',
            price: 25.99,
            image_url: 'test.jpg'
          }
        }
      ],
      removeItem: vi.fn(),
      updateQuantity: vi.fn(),
      getTotalPrice: vi.fn(() => 51.98)
    });

    renderWithProviders(<CartPage />);

    expect(screen.getByRole('link', { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it('calls updateQuantity when quantity buttons are clicked', () => {
    const mockUpdateQuantity = vi.fn();
    mockUseCartStore.mockReturnValue({
      items: [
        {
          id: '1',
          product_id: 'prod1',
          quantity: 2,
          product: {
            id: 'prod1',
            name: 'Test Product',
            price: 25.99,
            image_url: 'test.jpg'
          }
        }
      ],
      removeItem: vi.fn(),
      updateQuantity: mockUpdateQuantity,
      getTotalPrice: vi.fn(() => 51.98)
    });

    renderWithProviders(<CartPage />);

    const decreaseButton = screen.getByRole('button', { name: '-' });
    const increaseButton = screen.getByRole('button', { name: '+' });

    fireEvent.click(decreaseButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod1', 1);

    fireEvent.click(increaseButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('prod1', 3);
  });

  it('calls removeItem when remove button is clicked', () => {
    const mockRemoveItem = vi.fn();
    mockUseCartStore.mockReturnValue({
      items: [
        {
          id: '1',
          product_id: 'prod1',
          quantity: 2,
          product: {
            id: 'prod1',
            name: 'Test Product',
            price: 25.99,
            image_url: 'test.jpg'
          }
        }
      ],
      removeItem: mockRemoveItem,
      updateQuantity: vi.fn(),
      getTotalPrice: vi.fn(() => 51.98)
    });

    renderWithProviders(<CartPage />);

    const removeButton = screen.getAllByRole('button').find(btn => btn.className.includes('text-red'));
    fireEvent.click(removeButton!);

    expect(mockRemoveItem).toHaveBeenCalledWith('prod1');
  });
});