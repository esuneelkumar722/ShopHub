// Mock dependencies
vi.mock('../../hooks/useAdmin', () => ({
  useAdmin: vi.fn()
}));
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() }))
  };
});

import { renderWithProviders, screen, fireEvent } from '../../renderWithProviders';
import { vi } from 'vitest';
import { AdminOrders } from '../../../pages/admin/AdminOrders';
import { useAdmin } from '../../../hooks/useAdmin';
import { useQuery, useMutation } from '@tanstack/react-query';

const mockUseAdmin = vi.mocked(useAdmin);
const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);

const mockOrders = [
  {
    id: 'order-123',
    user_id: 'user-456',
    total: 99.99,
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
    order_items: [
      {
        id: 'item-1',
        quantity: 2,
        price: 25.00,
        product: { name: 'Test Product' }
      }
    ],
    user: {
      email: 'test@example.com',
      full_name: 'Test User'
    }
  }
];

describe('AdminOrders', () => {
  beforeEach(() => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
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
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      isPending: false,
      isIdle: true,
      isError: false,
      isSuccess: false,
      status: 'idle',
      error: null,
      data: undefined,
      variables: undefined,
      submittedAt: 0,
      failureCount: 0,
      failureReason: null
    } as any);
  });

  it('renders access denied for non-admin users', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: false, isLoading: false });
    renderWithProviders(<AdminOrders />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Go Home →')).toBeInTheDocument();
  });

  it('renders loading state', () => {
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
    renderWithProviders(<AdminOrders />);
    expect(screen.getByText('Orders Management')).toBeInTheDocument();
  });

  it('renders orders list with correct data', () => {
    renderWithProviders(<AdminOrders />);
    expect(screen.getByText('Orders Management')).toBeInTheDocument();
    expect(screen.getByText('ORDER-12')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('2x Test Product - $50.00')).toBeInTheDocument();
  });

  it('filters orders by status', () => {
    renderWithProviders(<AdminOrders />);
    const pendingButton = screen.getByRole('button', { name: 'Pending' });
    fireEvent.click(pendingButton);
    expect(pendingButton).toHaveClass('bg-primary-600');
  });

  it('shows all orders when all filter is selected', () => {
    renderWithProviders(<AdminOrders />);
    const allButton = screen.getByText('All (1)');
    expect(allButton).toBeInTheDocument();
  });

  it('updates order status when select changes', () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      isPending: false,
      isIdle: true,
      isError: false,
      isSuccess: false,
      status: 'idle',
      error: null,
      data: undefined,
      variables: undefined,
      submittedAt: 0,
      failureCount: 0,
      failureReason: null
    } as any);

    renderWithProviders(<AdminOrders />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'processing' } });
    expect(mockMutate).toHaveBeenCalledWith({
      orderId: 'order-123',
      status: 'processing'
    });
  });

  it('shows empty state when no orders match filter', () => {
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
    renderWithProviders(<AdminOrders />);
    expect(screen.getByText('No orders found with the selected filter.')).toBeInTheDocument();
  });

  it('displays order count correctly', () => {
    renderWithProviders(<AdminOrders />);
    expect(screen.getByText('Showing 1 of 1 orders')).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    renderWithProviders(<AdminOrders />);
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });
});