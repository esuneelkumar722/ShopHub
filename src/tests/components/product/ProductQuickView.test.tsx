import { renderWithProviders, screen, fireEvent, waitFor } from '../../renderWithProviders';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import React from 'react';
import type { Product } from '../../../types';
import { ProductQuickView } from '../../../components/product/ProductQuickView';

// Mock variables
const mockCartStore = {
  addItem: vi.fn(),
};

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, onKeyDown, role, 'aria-modal': ariaModal, 'aria-labelledby': ariaLabelledby, ...props }: React.ComponentProps<'div'>) => React.createElement('div', { children, className, onClick, onKeyDown, role, 'aria-modal': ariaModal, 'aria-labelledby': ariaLabelledby, ...props }),
  },
}));

// Mock accessibility hooks
vi.mock('../../../hooks/useAccessibility', () => ({
  useKeyboardNavigation: vi.fn(),
  useFocusTrap: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Mock cart store
vi.mock('../../../store/cartStore', () => ({
  useCartStore: vi.fn((selector) => {
    if (selector) {
      return selector(mockCartStore);
    }
    return mockCartStore;
  })
}));


const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'This is a detailed test product description for quick view testing.',
  price: 99.99,
  category: 'Electronics',
  image_url: 'https://example.com/image.jpg',
  stock: 5,
  rating: 4.2,
  reviews_count: 42,
  created_at: '2023-01-01T00:00:00Z',
};

const mockOutOfStockProduct: Product = {
  ...mockProduct,
  stock: 0,
};

describe('ProductQuickView', () => {
  const defaultProps = {
    product: mockProduct,
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    renderWithProviders(
      <ProductQuickView {...defaultProps} isOpen={false} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not render when product is null', () => {
    renderWithProviders(
      <ProductQuickView {...defaultProps} product={null} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal with product details when open', () => {
    renderWithProviders(<ProductQuickView {...defaultProps} />, { wrapper: MemoryRouter });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Quick View')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('This is a detailed test product description for quick view testing.')).toBeInTheDocument();
    expect(screen.getByText('4.2 (42 reviews)')).toBeInTheDocument();
    expect(screen.getByText('5 in stock')).toBeInTheDocument();
  });

  it('displays correct rating stars', () => {
    renderWithProviders(<ProductQuickView {...defaultProps} />, { wrapper: MemoryRouter });

    // Should have 4 filled stars (rating 4.2, floor is 4) and 1 empty star
    const filledStars = screen.getAllByTestId('filled-star');
    const emptyStars = screen.getAllByTestId('empty-star');

    expect(filledStars).toHaveLength(4);
    expect(emptyStars).toHaveLength(1);
  });

  it('shows out of stock status when stock is 0', () => {
    renderWithProviders(
      <ProductQuickView {...defaultProps} product={mockOutOfStockProduct} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('disables add to cart button when out of stock', () => {
    renderWithProviders(
      <ProductQuickView {...defaultProps} product={mockOutOfStockProduct} />,
      { wrapper: MemoryRouter }
    );

    const addButton = screen.getByRole('button', { name: 'Add to Cart' });
    expect(addButton).toBeDisabled();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithProviders(<ProductQuickView {...defaultProps} />, { wrapper: MemoryRouter });

    const closeButton = screen.getByLabelText('Close quick view');
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    renderWithProviders(<ProductQuickView {...defaultProps} />, { wrapper: MemoryRouter });

    // Find backdrop by its unique class combination
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('prevents modal close when modal content is clicked', () => {
    renderWithProviders(<ProductQuickView {...defaultProps} />, { wrapper: MemoryRouter });

    // Click on the inner modal content (not the backdrop)
    const modalContent = screen.getByRole('dialog').querySelector('.bg-white');
    if (modalContent) {
      fireEvent.click(modalContent);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    }
  });

  it('calls addItem when add to cart is clicked', () => {
    renderWithProviders(<ProductQuickView {...defaultProps} />, { wrapper: MemoryRouter });

    const addButton = screen.getByRole('button', { name: 'Add to Cart' });
    fireEvent.click(addButton);

    expect(mockCartStore.addItem).toHaveBeenCalledWith(mockProduct);
  });

  it('shows success toast when add to cart is clicked', async () => {
    const sonner = await import('sonner');
    renderWithProviders(<ProductQuickView {...defaultProps} />, { wrapper: MemoryRouter });

    const addButton = screen.getByRole('button', { name: 'Add to Cart' });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(vi.mocked(sonner.toast.success)).toHaveBeenCalled();
    });
  });

  it('renders product image with correct attributes', () => {
    renderWithProviders(<ProductQuickView {...defaultProps} />, { wrapper: MemoryRouter });

    const image = screen.getByAltText('Test Product');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('handles multiple clicks', () => {
    renderWithProviders(<ProductQuickView {...defaultProps} />, { wrapper: MemoryRouter });

    const closeButton = screen.getByLabelText('Close quick view');
    fireEvent.click(closeButton);
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });
});