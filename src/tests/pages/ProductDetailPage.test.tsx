import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { ProductDetailPage } from '../../pages/ProductDetailPage';
import { renderWithProviders } from '../renderWithProviders';

// Mock dependencies
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() }))
  };
});

vi.mock('../../store/cartStore', () => ({
  useCartStore: vi.fn(() => vi.fn())
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn(() => ({ user: null }))
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: '1' })),
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ state: null }))
  };
});

vi.mock('sonner', () => ({
  toast: vi.fn()
}));

import { useQuery, useMutation } from '@tanstack/react-query';

const mockUseQuery = vi.mocked(useQuery);
const mockUseMutation = vi.mocked(useMutation);

const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test description',
  price: 99.99,
  category: 'electronics',
  rating: 4.5,
  image_url: 'test.jpg'
};

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockImplementation((options: any) => {
      if (options.queryKey?.[0] === 'product') {
        return {
          data: mockProduct,
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
        } as any;
      }
      if (options.queryKey?.[0] === 'product-images') {
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
        } as any;
      }
      if (options.queryKey?.[0] === 'reviews') {
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
        } as any;
      }
      if (options.queryKey?.[0] === 'recommendations') {
        return {
          data: [
            {
              id: '2',
              name: 'Recommended Product',
              description: 'Recommended description',
              price: 49.99,
              category: 'electronics',
              rating: 4.0,
              image_url: 'rec.jpg',
              stock: 10,
              reviews_count: 5
            }
          ],
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
        } as any;
      }
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
    } as any);
  });

  it('renders loading skeleton when loading', () => {
    mockUseQuery.mockImplementation((options: any) => {
      if (options.queryKey?.[0] === 'product') {
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
          isStale: false,
          refetch: vi.fn(),
          fetchStatus: 'fetching'
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
      } as any;
    });

    renderWithProviders(<ProductDetailPage />);

    // Should show loading skeleton
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders product details when loaded', async () => {
    renderWithProviders(<ProductDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });
  });

  it('renders back button', async () => {
    renderWithProviders(<ProductDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });
  });

  it('renders add to cart button', async () => {
    renderWithProviders(<ProductDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
    });
  });

  it('shows error when product not found', async () => {
    mockUseQuery.mockImplementation((options: any) => {
      if (options.queryKey?.[0] === 'product') {
        return {
          data: null,
          isLoading: false,
          error: { message: 'Product not found' },
          isError: true,
          isPending: false,
          isLoadingError: false,
          isRefetchError: false,
          isSuccess: false,
          status: 'error',
          dataUpdatedAt: 0,
          errorUpdatedAt: Date.now(),
          failureCount: 1,
          failureReason: { message: 'Product not found' },
          errorUpdateCount: 1,
          isFetched: true,
          isFetchedAfterMount: true,
          isFetching: false,
          isRefetching: false,
          isStale: false,
          refetch: vi.fn(),
          fetchStatus: 'idle'
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
      } as any;
    });

    renderWithProviders(<ProductDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Product Not Found')).toBeInTheDocument();
    });
  });

  it('renders product recommendations section', async () => {
    renderWithProviders(<ProductDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      // ProductRecommendations component should be rendered
      expect(screen.getByText('You May Also Like')).toBeInTheDocument();
    });
  });

  it('renders reviews section', async () => {
    renderWithProviders(<ProductDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      // Reviews section should be rendered
      expect(screen.getByText('Customer Reviews')).toBeInTheDocument();
    });
  });
});