import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Footer } from "../../../components/layout/Footer";
import { renderWithProviders } from "../../renderWithProviders";

describe('Footer', () => {
  it('renders ShopHub branding', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText('ShopHub')).toBeInTheDocument();
    expect(screen.getByText('Your one-stop shop for quality products at great prices.')).toBeInTheDocument();
  });

  it('renders shop navigation links', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole('link', { name: /all products/i })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /electronics/i })).toHaveAttribute('href', '/products?category=electronics');
    expect(screen.getByRole('link', { name: /clothing/i })).toHaveAttribute('href', '/products?category=clothing');
    expect(screen.getByRole('link', { name: /home & garden/i })).toHaveAttribute('href', '/products?category=home');
  });

  it('renders customer service links', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: /faq/i })).toHaveAttribute('href', '/faq');
    expect(screen.getByRole('link', { name: /shipping info/i })).toHaveAttribute('href', '/shipping');
    expect(screen.getByRole('link', { name: /returns/i })).toHaveAttribute('href', '/returns');
  });

  it('renders account links', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByRole('link', { name: /my account/i })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: /order history/i })).toHaveAttribute('href', '/orders');
    expect(screen.getByRole('link', { name: /wishlist/i })).toHaveAttribute('href', '/wishlist');
  });

  it('renders copyright with current year', () => {
    renderWithProviders(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} ShopHub. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders section headings', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Customer Service')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });
});