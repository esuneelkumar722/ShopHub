import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { WishlistPage } from '../../pages/WishlistPage';
import { renderWithProviders } from '../renderWithProviders';

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [
              {
                id: '1',
                product_id: 'prod1',
                created_at: '2024-01-01',
                products: {
                  id: 'prod1',
                  name: 'Test Product',
                  price: 99.99,
                  image_url: 'test.jpg'
                }
              }
            ],
            error: null
          }))
        }))
      })),
      delete: vi.fn(() => ({ error: null }))
    }))
  }
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn(() => ({
    user: { id: 'user1', email: 'test@example.com' }
  }))
}));

vi.mock('../../store/cartStore', () => ({
  useCartStore: vi.fn(() => vi.fn())
}));

describe('WishlistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    renderWithProviders(<WishlistPage />);

    expect(screen.getByText('Loading wishlist...')).toBeInTheDocument();
  });

  it('renders wishlist items when loaded', async () => {
    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('My Wishlist')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });
  });

  it('renders empty wishlist message when no items', async () => {
    // Mock empty wishlist
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;
    supabaseMock.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
      expect(screen.getByText('Start adding products you love!')).toBeInTheDocument();
    });
  });

  it('renders browse products link when empty', async () => {
    // Mock empty wishlist
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;
    supabaseMock.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /browse products/i })).toBeInTheDocument();
    });
  });

  it('calls remove from wishlist when remove button is clicked', async () => {
    const { supabase } = await import('../../lib/supabase');
    const supabaseMock = supabase as any;
    const mockDelete = vi.fn(() => ({ error: null }));
    supabaseMock.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [
              {
                id: '1',
                product_id: 'prod1',
                created_at: '2024-01-01',
                products: {
                  id: 'prod1',
                  name: 'Test Product',
                  price: 99.99,
                  image_url: 'test.jpg'
                }
              }
            ],
            error: null
          }))
        }))
      })),
      delete: mockDelete
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Find button by its red color class which indicates remove/delete action
    const buttons = screen.getAllByRole('button');
    const removeButton = buttons.find(btn => btn.className.includes('text-red'));
    fireEvent.click(removeButton!);

    expect(mockDelete).toHaveBeenCalled();
  });

  it('renders add to cart button for each item', async () => {
    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });
  });
});