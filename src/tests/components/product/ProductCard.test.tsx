import { renderWithProviders, screen, fireEvent } from '../../renderWithProviders';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { Product } from '../../../types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

import { ProductCard } from '../../../components/product/ProductCard';

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  description: 'This is a test product description',
  price: 29.99,
  category: 'Electronics',
  image_url: 'https://example.com/image.jpg',
  stock: 10,
  rating: 4.5,
  reviews_count: 25,
  created_at: '2023-01-01T00:00:00Z',
};

describe('ProductCard', () => {
  const defaultProps = {
    product: mockProduct,
    isInWishlist: false,
    isAdded: false,
    onAddToCart: vi.fn(),
    onToggleWishlist: vi.fn(),
    onQuickView: vi.fn(),
    showWishlist: true,
  };

  it('renders product information correctly', () => {
    renderWithProviders(<ProductCard {...defaultProps} />, { wrapper: MemoryRouter });

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(25)')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Test Product' })).toBeInTheDocument();
  });

  it('shows wishlist button when showWishlist is true', () => {
    renderWithProviders(<ProductCard {...defaultProps} />, { wrapper: MemoryRouter });

    const wishlistButton = screen.getByLabelText('Add to wishlist');
    expect(wishlistButton).toBeInTheDocument();
  });

  it('hides wishlist button when showWishlist is false', () => {
    renderWithProviders(
      <ProductCard {...defaultProps} showWishlist={false} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.queryByLabelText('Add to wishlist')).not.toBeInTheDocument();
  });

  it('shows filled heart when product is in wishlist', () => {
    renderWithProviders(
      <ProductCard {...defaultProps} isInWishlist={true} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByLabelText('Remove from wishlist')).toBeInTheDocument();
  });

  it('calls onToggleWishlist when wishlist button is clicked', () => {
    const mockOnToggleWishlist = vi.fn();
    renderWithProviders(
      <ProductCard {...defaultProps} onToggleWishlist={mockOnToggleWishlist} />,
      { wrapper: MemoryRouter }
    );

    const wishlistButton = screen.getByLabelText('Add to wishlist');
    fireEvent.click(wishlistButton);

    expect(mockOnToggleWishlist).toHaveBeenCalledWith('1');
  });

  it('calls onQuickView when quick view button is clicked', () => {
    const mockOnQuickView = vi.fn();
    renderWithProviders(
      <ProductCard {...defaultProps} onQuickView={mockOnQuickView} />,
      { wrapper: MemoryRouter }
    );

    const quickViewButton = screen.getByLabelText('Quick view product');
    fireEvent.click(quickViewButton);

    expect(mockOnQuickView).toHaveBeenCalledWith(mockProduct);
  });

  it('calls onAddToCart when add to cart button is clicked', () => {
    const mockOnAddToCart = vi.fn();
    renderWithProviders(
      <ProductCard {...defaultProps} onAddToCart={mockOnAddToCart} />,
      { wrapper: MemoryRouter }
    );

    const addButton = screen.getByLabelText('Add Test Product to cart');
    fireEvent.click(addButton);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('shows "Added!" text when product is added to cart', () => {
    renderWithProviders(
      <ProductCard {...defaultProps} isAdded={true} />,
      { wrapper: MemoryRouter }
    );

    expect(screen.getByText('Added!')).toBeInTheDocument();
    expect(screen.getByLabelText('Add Test Product to cart')).toHaveAttribute('class', expect.stringContaining('bg-green-600'));
  });

  it('links to product detail page', () => {
    renderWithProviders(<ProductCard {...defaultProps} />, { wrapper: MemoryRouter });

    const productLinks = screen.getAllByRole('link');
    expect(productLinks[0]).toHaveAttribute('href', '/products/1');
    expect(productLinks[1]).toHaveAttribute('href', '/products/1');
  });
});