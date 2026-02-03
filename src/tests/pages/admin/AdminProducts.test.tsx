// Mock dependencies
vi.mock('../../../hooks/useAdmin', () => ({
  useAdmin: vi.fn()
}));
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
      error: null,
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    })),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() }))
  };
});
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
}));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useNavigate: vi.fn(() => mockNavigate),
  };
});

import { renderWithProviders, screen, fireEvent, waitFor } from '../../renderWithProviders';
import { vi } from 'vitest';
import { AdminProducts } from '../../../pages/admin/AdminProducts';
import { useAdmin } from '../../../hooks/useAdmin';
import { useQuery, useMutation } from '@tanstack/react-query';

const mockUseAdmin = vi.mocked(useAdmin);
const mockUseQuery = vi.mocked(useQuery);

// Mock window.confirm
const mockConfirm = vi.fn();
globalThis.confirm = mockConfirm;

// Mock window.alert
const mockAlert = vi.fn();
globalThis.alert = mockAlert;

const mockNavigate = vi.fn();

const createMockQueryResult = (overrides: any = {}) => ({
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
  fetchStatus: 'idle',
  ...overrides,
});

const mockProducts = [
  {
    id: '1',
    name: 'Test Product 1',
    price: 29.99,
    category: 'electronics',
    stock: 10,
    image_url: 'https://example.com/image1.jpg',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Test Product 2',
    price: 49.99,
    category: 'clothing',
    stock: 5,
    image_url: 'https://example.com/image2.jpg',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Test Product 3',
    price: 19.99,
    category: 'books',
    stock: 100,
    image_url: 'https://example.com/image3.jpg',
    created_at: '2024-01-03T00:00:00Z',
  },
];

describe('AdminProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockClear();
    mockAlert.mockClear();
  });

  it('renders access denied for non-admin users', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: false, isLoading: false });

    renderWithProviders(<AdminProducts />);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Go Home →')).toBeInTheDocument();
  });

  it('renders loading state while fetching products', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
    mockUseQuery.mockReturnValue(createMockQueryResult({
      data: undefined,
      isLoading: true,
    }));

    renderWithProviders(<AdminProducts />);

    expect(screen.getByText('Products Management')).toBeInTheDocument();
    // Loading skeleton should be present
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders products table with data', async () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
    mockUseQuery.mockReturnValue(createMockQueryResult({
      data: mockProducts,
      isLoading: false,
    }));

    renderWithProviders(<AdminProducts />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('Test Product 3')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  it('filters products by search term', async () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
    mockUseQuery.mockReturnValue(createMockQueryResult({
      data: mockProducts,
      isLoading: false,
    }));

    renderWithProviders(<AdminProducts />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'Product 1' } });

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Product 3')).not.toBeInTheDocument();
  });

  it('filters products by category', async () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
    mockUseQuery.mockReturnValue(createMockQueryResult({
      data: mockProducts,
      isLoading: false,
    }));

    renderWithProviders(<AdminProducts />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'electronics' } });

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Product 3')).not.toBeInTheDocument();
  });

  it('navigates to add product page when add button is clicked', async () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
    mockUseQuery.mockReturnValue(createMockQueryResult({
      data: mockProducts,
      isLoading: false,
    }));

    renderWithProviders(<AdminProducts />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const addLink = screen.getByRole('link', { name: /add product/i });
    expect(addLink).toHaveAttribute('href', '/admin/products/new');
  });

  it('navigates to edit page when edit button is clicked', async () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
    mockUseQuery.mockReturnValue(createMockQueryResult({
      data: mockProducts,
      isLoading: false,
    }));

    renderWithProviders(<AdminProducts />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    // Find the first row and click the edit button (first button in actions)
    const actionCells = screen.getAllByRole('cell').filter(cell =>
      cell.querySelector('button')
    );
    const firstRowActions = actionCells[0];
    const editButton = firstRowActions.querySelector('button:first-child') as HTMLButtonElement;

    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products/edit/1');
  });

  it('deletes product when confirmed', async () => {
    (useAdmin as any).mockReturnValue({ isAdmin: true });
    mockConfirm.mockReturnValue(true);

    (useQuery as any).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    });

    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    renderWithProviders(<AdminProducts />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg.lucide-trash2')
    );
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Product 1"?');
  });

  it('does not delete product when not confirmed', async () => {
    (useAdmin as any).mockReturnValue({ isAdmin: true });
    mockConfirm.mockReturnValue(false);

    (useQuery as any).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      error: null,
    });

    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    renderWithProviders(<AdminProducts />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button').filter(button =>
      button.querySelector('svg.lucide-trash2')
    );
    fireEvent.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Product 1"?');
  });

  it('shows empty state when no products match filters', async () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
    mockUseQuery.mockReturnValue(createMockQueryResult({
      data: mockProducts,
      isLoading: false,
    }));

    renderWithProviders(<AdminProducts />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search products...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No products found. Try adjusting your filters.')).toBeInTheDocument();
  });

  it('displays correct product count', async () => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
    mockUseQuery.mockReturnValue(createMockQueryResult({
      data: mockProducts,
      isLoading: false,
    }));

    renderWithProviders(<AdminProducts />);

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Showing 3 of 3 products')).toBeInTheDocument();
  });
});