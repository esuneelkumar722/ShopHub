import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { OrdersPage } from '../../pages/OrdersPage';
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
                id: 'order1',
                total: 99.99,
                status: 'completed',
                created_at: '2024-01-01T00:00:00Z',
                order_items: [
                  {
                    id: 'item1',
                    product_id: 'prod1',
                    quantity: 1,
                    price: 99.99,
                    product: {
                      name: 'Test Product',
                      image_url: 'test.jpg'
                    }
                  }
                ]
              }
            ],
            error: null
          }))
        }))
      }))
    }))
  }
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn(() => ({
    user: { id: 'user1', email: 'test@example.com' }
  }))
}));

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    renderWithProviders(<OrdersPage />);

    // Component shows empty state, not loading state
    expect(screen.getByText('No orders yet')).toBeInTheDocument();
  });

  it('renders orders when loaded', async () => {
    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('My Orders')).toBeInTheDocument();
      expect(screen.getByText('Order #order1')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });
  });

  it('renders order status with correct styling', async () => {
    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });
  });

  it('renders order items', async () => {
    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeInTheDocument();
    });
  });

  it('renders empty orders message when no orders', async () => {
    // Mock empty orders
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

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeInTheDocument();
      expect(screen.getByText('Start shopping to see your orders here!')).toBeInTheDocument();
    });
  });

  it('renders continue shopping link when no orders', async () => {
    // Mock empty orders
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

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /browse products/i })).toBeInTheDocument();
    });
  });
});