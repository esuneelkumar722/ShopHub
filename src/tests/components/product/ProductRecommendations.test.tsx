import { renderWithProviders, screen, fireEvent, waitFor } from '../../renderWithProviders';
import { vi } from 'vitest';
import React from 'react';
import type { Product } from '../../../types';
import type { UseQueryResult } from '@tanstack/react-query';
import { ProductRecommendations } from '../../../components/product/ProductRecommendations';

// Mock dependencies
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  };
});

vi.mock('lucide-react', () => ({
  ShoppingCart: ({ className }: { className?: string }) => <svg data-testid="shopping-cart-icon" className={className} />,
  Check: ({ className }: { className?: string }) => <svg data-testid="check-icon" className={className} />,
}));

vi.mock('../../../store/cartStore', () => ({
  useCartStore: vi.fn(),
}));

// Mock Supabase
vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            gt: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn(),
              })),
            })),
          })),
        })),
      })),
    })),
  },
}));

import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '../../../store/cartStore';

const mockUseQuery = vi.mocked(useQuery);
const mockUseCartStore = vi.mocked(useCartStore);

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Recommended Product 1',
    price: 29.99,
    image_url: 'https://example.com/image1.jpg',
    category: 'electronics',
    rating: 4.5,
    reviews_count: 25,
    stock: 10,
    description: 'A great product',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Recommended Product 2',
    price: 39.99,
    image_url: 'https://example.com/image2.jpg',
    category: 'electronics',
    rating: 4.2,
    reviews_count: 18,
    stock: 5,
    description: 'Another great product',
    created_at: '2024-01-01',
  },
];

describe('ProductRecommendations', () => {
  const mockAddItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCartStore.mockReturnValue(mockAddItem);
  });

  it('renders nothing when loading', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as UseQueryResult<Product[], Error>);

    const { container } = renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when no recommendations', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    const { container } = renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders recommendations when data is available', async () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    expect(screen.getByText('You May Also Like')).toBeInTheDocument();

    // Check that products are rendered
    expect(screen.getByText('Recommended Product 1')).toBeInTheDocument();
    expect(screen.getByText('Recommended Product 2')).toBeInTheDocument();

    // Check prices
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$39.99')).toBeInTheDocument();

    // Check ratings
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('renders product images with proper attributes', () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    const images = screen.getAllByAltText(/Recommended Product/);
    expect(images).toHaveLength(2);

    images.forEach((img, index) => {
      expect(img).toHaveAttribute('src', mockProducts[index].image_url);
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  it('handles image load errors', () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    const image = screen.getByAltText('Recommended Product 1');
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/300x200?text=Product+Image');
  });

  it('renders add to cart buttons', () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    const addButtons = screen.getAllByRole('button', { name: /Add/ });
    expect(addButtons).toHaveLength(2);

    const cartIcons = screen.getAllByTestId('shopping-cart-icon');
    expect(cartIcons).toHaveLength(2);

    addButtons.forEach(button => {
      expect(button).toHaveTextContent('Add');
    });
  });

  it('adds product to cart and shows success state', async () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    const addButton = screen.getAllByRole('button', { name: /Add/ })[0];
    fireEvent.click(addButton);

    // Check that addItem was called with the correct product
    expect(mockAddItem).toHaveBeenCalledWith(mockProducts[0]);

    // Check that button shows "Added" state
    await waitFor(() => {
      expect(screen.getByText('Added')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    // Check that "Added" state reverts after 2 seconds
    await waitFor(
      () => {
        expect(screen.getByText('Add')).toBeInTheDocument();
      },
      { timeout: 2500 }
    );
  });

  it('handles multiple add to cart actions', async () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    const addButtons = screen.getAllByRole('button', { name: /Add/ });

    // Add first product
    fireEvent.click(addButtons[0]);
    await waitFor(() => {
      expect(screen.getAllByText('Added')).toHaveLength(1);
    });

    // Add second product
    fireEvent.click(addButtons[1]);
    await waitFor(() => {
      expect(screen.getAllByText('Added')).toHaveLength(2);
    });

    expect(mockAddItem).toHaveBeenCalledWith(mockProducts[0]);
    expect(mockAddItem).toHaveBeenCalledWith(mockProducts[1]);
  });

  it('renders product links correctly', () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    // Check that there are 4 links total (2 images + 2 titles)
    const allLinks = screen.getAllByRole('link');
    expect(allLinks).toHaveLength(4);

    // Check product title links by finding h3 elements within links
    const titleElements = screen.getAllByText(/Recommended Product/);
    expect(titleElements).toHaveLength(2);

    // Verify the links contain the correct hrefs
    const linkElements = allLinks.filter(link =>
      link.textContent?.includes('Recommended Product 1') ||
      link.textContent?.includes('Recommended Product 2')
    );
    expect(linkElements).toHaveLength(2);
    expect(linkElements[0]).toHaveAttribute('href', '/products/1');
    expect(linkElements[1]).toHaveAttribute('href', '/products/2');

    // Check image links
    const imageLinks = allLinks.filter(link => link.querySelector('img'));
    expect(imageLinks).toHaveLength(2);
    expect(imageLinks[0]).toHaveAttribute('href', '/products/1');
    expect(imageLinks[1]).toHaveAttribute('href', '/products/2');
  });

  it('applies correct CSS classes', () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    // Main container
    const container = screen.getByText('You May Also Like').parentElement;
    expect(container).toHaveClass('mt-16', 'border-t', 'pt-16');

    // Product cards
    const productCards = screen.getAllByText(/Recommended Product/);
    productCards.forEach(card => {
      const cardElement = card.closest('.card');
      expect(cardElement).toHaveClass('flex-none', 'w-64', 'snap-start', 'card');
    });
  });

  it('has proper accessibility attributes', () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    // Images have alt text
    const images = screen.getAllByAltText(/Recommended Product/);
    expect(images[0]).toHaveAttribute('alt', 'Recommended Product 1');

    // Buttons are properly labeled
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders horizontal scroll container', () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    // Find the scroll container by its classes
    const scrollContainer = document.querySelector('.flex.gap-6.overflow-x-auto');
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer).toHaveClass('flex', 'gap-6', 'overflow-x-auto', 'pb-4', 'scroll-smooth');
  });

  it('calls useQuery with correct parameters', () => {
    mockUseQuery.mockReturnValue({
      data: mockProducts,
      isLoading: false,
    } as unknown as UseQueryResult<Product[], Error>);

    renderWithProviders(
      <ProductRecommendations currentProductId="current-product-id" category="test-category" />
    );

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ['recommendations', 'current-product-id', 'test-category'],
      queryFn: expect.any(Function),
    });
  });

  it('handles query error gracefully', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Query failed'),
    } as unknown as UseQueryResult<Product[], Error>);

    // Component should not crash and render nothing
    const { container } = renderWithProviders(
      <ProductRecommendations currentProductId="current-id" category="electronics" />
    );

    expect(container.firstChild).toBeNull();
  });
});