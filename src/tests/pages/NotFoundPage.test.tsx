import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { renderWithProviders } from '../renderWithProviders';

// Mock window.history.back
const mockBack = vi.fn();
Object.defineProperty(window, 'history', {
  value: {
    back: mockBack
  },
  writable: true
});

describe('NotFoundPage', () => {
  it('renders 404 error message', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    expect(screen.getByText("Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.")).toBeInTheDocument();
  });

  it('renders go to homepage link', () => {
    renderWithProviders(<NotFoundPage />);

    const homeLink = screen.getByRole('link', { name: /go to homepage/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders go back button', () => {
    renderWithProviders(<NotFoundPage />);

    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('calls window.history.back when go back button is clicked', () => {
    renderWithProviders(<NotFoundPage />);

    const backButton = screen.getByRole('button', { name: /go back/i });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('renders popular links section', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText('You might be looking for:')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /cart/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
  });

  it('renders search emoji', () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText('🔍')).toBeInTheDocument();
  });
});