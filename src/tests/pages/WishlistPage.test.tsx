import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { WishlistPage } from '../../pages/WishlistPage';
import { renderWithProviders } from '../renderWithProviders';

// Mock dependencies
vi.mock('@tanstack/react-query', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({ refetchQueries: vi.fn() }))
  };
});

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn(() => ({
    user: { id: 'user1', email: 'test@example.com' }
  }))
}));

vi.mock('../../store/cartStore', () => ({
  useCartStore: vi.fn(() => vi.fn())
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Link: ({ children, ...props }: any) => <a {...props}>{children}</a>
  };
});

import { useQuery, useMutation } from '@tanstack/react-query';

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);

const mockWishlistData = [
  {
    id: '1',
    product_id: 'prod1',
    created_at: '2024-01-01',
    products: {
      id: 'prod1',
      name: 'Test Product',
      price: 99.99,
      image_url: 'test.jpg',
      description: 'Test description',
      rating: 4.5,
      reviews_count: 10,
      stock: 5
    }
  }
];

describe('WishlistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseQuery.mockImplementation((options: any) => {
      if (options.queryKey?.[0] === 'wishlist') {
        return {
          data: mockWishlistData,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }
      return {
        data: null,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  });

  it('renders loading state initially', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseQuery.mockImplementationOnce((options: any) => {
      if (options.queryKey?.[0] === 'wishlist') {
        return {
          data: null,
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
          isStale: true,
          refetch: vi.fn(),
          fetchStatus: 'fetching'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }
      return {
        data: null,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseQuery.mockImplementationOnce((options: any) => {
      if (options.queryKey?.[0] === 'wishlist') {
        return {
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }
      return {
        data: null,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
      expect(screen.getByText('Start adding products you love!')).toBeInTheDocument();
    });
  });

  it('renders browse products link when empty', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseQuery.mockImplementationOnce((options: any) => {
      if (options.queryKey?.[0] === 'wishlist') {
        return {
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      }
      return {
        data: null,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
    });
  });

  it('calls remove from wishlist when remove button is clicked', async () => {
    const mockMutate = vi.fn();
    mockUseMutation.mockReturnValueOnce({
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Find the remove button by its title attribute
    const removeButton = screen.getByTitle('Remove from wishlist');
    fireEvent.click(removeButton);

    expect(mockMutate).toHaveBeenCalledWith('1');
  });

  it('renders add to cart button for each item', async () => {
    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });
  });
});