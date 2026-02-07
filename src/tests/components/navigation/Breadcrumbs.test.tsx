import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Breadcrumbs } from '../../../components/navigation/Breadcrumbs';
import { renderWithProviders } from '../../renderWithProviders';

describe('Breadcrumbs', () => {
  it('does not render on home page', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/' });

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders breadcrumbs for products page', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/products' });

    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders breadcrumbs for cart page', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/cart' });

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
  });

  it('renders breadcrumbs for wishlist page', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/wishlist' });

    expect(screen.getByText('Wishlist')).toBeInTheDocument();
  });

  it('renders breadcrumbs for checkout page', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/checkout' });

    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

  it('renders breadcrumbs for orders page', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/orders' });

    expect(screen.getByText('My Orders')).toBeInTheDocument();
  });

  it('renders breadcrumbs for nested routes', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/admin/products' });

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('hides product ID from breadcrumbs on product detail pages', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/products/123' });

    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.queryByText('123')).not.toBeInTheDocument();
  });

  it('renders home link with correct href', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/products' });

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders intermediate links as clickable', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/admin/products' });

    const adminLink = screen.getByRole('link', { name: /admin panel/i });
    expect(adminLink).toHaveAttribute('href', '/admin');
  });

  it('marks current page as aria-current', () => {
    renderWithProviders(<Breadcrumbs />, { route: '/products' });

    const currentPage = screen.getByText('Products');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });
});