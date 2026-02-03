import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { OrdersPage } from '../../pages/OrdersPage';
import { renderWithProviders } from '../renderWithProviders';

// Mock dependencies
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useQuery: vi.fn()
  };
});

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn(() => ({
    user: { id: 'user1', email: 'test@example.com' }
  }))
}));

import { useQuery } from '@tanstack/react-query';

const mockUseQuery = vi.mocked(useQuery);

const mockOrders = [
  {
    id: 'order1',
    total: 99.99,
    status: 'delivered',
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
];

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: mockOrders,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as any);
  });

  it('renders loading state initially', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isPending: true,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      status: 'pending',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: true,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'fetching'
    } as any);

    renderWithProviders(<OrdersPage />);

    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders orders when loaded', async () => {
    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('My Orders')).toBeInTheDocument();
      expect(screen.getByText('ORDER1')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  it('renders order status with correct styling', async () => {
    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });
  });

  it('renders order items', async () => {
    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
    });
  });

  it('renders empty orders message when no orders', async () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as any);

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeInTheDocument();
      expect(screen.getByText('Start shopping to see your orders here!')).toBeInTheDocument();
    });
  });

  it('renders continue shopping link when no orders', async () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as any);

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /browse products/i })).toBeInTheDocument();
    });
  });
});