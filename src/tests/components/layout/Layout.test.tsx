import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Layout } from '../../../components/layout/Layout';
import { renderWithProviders } from '../../renderWithProviders';

// Mock child components
vi.mock('../../../components/layout/Header', () => ({
  Header: () => <header data-testid="header">Header</header>
}));

vi.mock('../../../components/layout/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>
}));

vi.mock('../../../components/navigation/Breadcrumbs', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs">Breadcrumbs</nav>
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>
  };
});

describe('Layout', () => {
  it('renders header component', () => {
    renderWithProviders(<Layout />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders breadcrumbs component', () => {
    renderWithProviders(<Layout />);

    expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
  });

  it('renders main content area with outlet', () => {
    renderWithProviders(<Layout />);

    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders footer component', () => {
    renderWithProviders(<Layout />);

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    renderWithProviders(<Layout />);

    const container = screen.getByTestId('header').parentElement;
    expect(container).toHaveClass('min-h-screen', 'flex', 'flex-col', 'bg-gray-50', 'dark:bg-gray-950');
  });
});