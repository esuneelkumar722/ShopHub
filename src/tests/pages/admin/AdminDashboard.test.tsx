// Mock dependencies
vi.mock('../../hooks/useAdmin', () => ({
  useAdmin: vi.fn()
}));
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useQuery: () => ({
      data: {
        totalProducts: 10,
        totalOrders: 5,
        totalRevenue: 1000,
        totalUsers: 20,
        lowStockProducts: 2,
      },
      isLoading: false,
    })
  };
});

import { renderWithProviders, screen } from '../../renderWithProviders';
import { vi } from 'vitest';
import { AdminDashboard } from '../../../pages/admin/AdminDashboard';
import { useAdmin } from '../../../hooks/useAdmin';

describe('AdminDashboard', () => {
  const mockUseAdmin = vi.mocked(useAdmin);

  beforeEach(() => {
    mockUseAdmin.mockReturnValue({ isAdmin: true, isLoading: false });
  });

  it('renders stats grid with correct values', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1000.00')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('renders low stock alert', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText(/products have low stock/i)).toBeInTheDocument();
    expect(screen.getByText('View Products →')).toBeInTheDocument();
  });

  it('renders quick actions', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText('+ Add New Product')).toBeInTheDocument();
    expect(screen.getByText('Manage Products')).toBeInTheDocument();
    expect(screen.getByText('View All Orders')).toBeInTheDocument();
  });

  it('renders loading state when admin status is loading', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: false, isLoading: true });
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders access denied if not admin', () => {
    mockUseAdmin.mockReturnValue({ isAdmin: false, isLoading: false });
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/don\'t have permission/i)).toBeInTheDocument();
    expect(screen.getByText('Go Home →')).toBeInTheDocument();
  });
});
