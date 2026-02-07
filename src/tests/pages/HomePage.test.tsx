import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { HomePage } from '../../pages/HomePage';
import { renderWithProviders } from '../renderWithProviders';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [
            { category: 'electronics' },
            { category: 'clothing' },
            { category: 'electronics' },
            { category: 'home' }
          ],
          error: null
        }))
      }))
    }))
  }
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the hero section with welcome message', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText('Welcome to ShopHub')).toBeInTheDocument();
    expect(screen.getByText('Discover amazing products at unbeatable prices')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shop now/i })).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByText('Wide Selection')).toBeInTheDocument();
    expect(screen.getByText('Best Prices')).toBeInTheDocument();
    expect(screen.getByText('Secure Checkout')).toBeInTheDocument();
    expect(screen.getByText('Fast Shipping')).toBeInTheDocument();
  });

  it('renders featured categories section', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Shop by Category')).toBeInTheDocument();
    });

    // Check that unique categories are rendered
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('renders category links with correct hrefs', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      const electronicsLink = screen.getByRole('link', { name: /electronics/i });
      const clothingLink = screen.getByRole('link', { name: /clothing/i });
      const homeLink = screen.getByRole('link', { name: /home/i });

      expect(electronicsLink).toHaveAttribute('href', '/products?category=electronics');
      expect(clothingLink).toHaveAttribute('href', '/products?category=clothing');
      expect(homeLink).toHaveAttribute('href', '/products?category=home');
    });
  });

  it('renders category descriptions and emojis', async () => {
    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Phones, Laptops & More')).toBeInTheDocument();
      expect(screen.getByText('Fashion & Footwear')).toBeInTheDocument();
      expect(screen.getByText('Appliances & Decor')).toBeInTheDocument();
    });
  });

  it('handles empty categories gracefully', async () => {
    // Mock empty response
    const { supabase } = await import('../../lib/supabase');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabaseMock = supabase as any;
    supabaseMock.from.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    });

    renderWithProviders(<HomePage />);

    // Should still render the page structure even with no categories
    expect(screen.getByText('Welcome to ShopHub')).toBeInTheDocument();
    expect(screen.getByText('Shop by Category')).toBeInTheDocument();
  });
});