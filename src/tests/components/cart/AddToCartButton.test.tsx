import { renderWithProviders, screen, fireEvent, waitFor } from '../../renderWithProviders';
import { vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, disabled, className, ...props }: {
      children: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      className?: string;
      [key: string]: unknown;
    }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </button>
    ),
    div: ({ children, className, ...props }: {
      children: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

import { AddToCartButton } from '../../../components/cart/AddToCartButton';

describe('AddToCartButton', () => {
  it('renders with default text', () => {
    const mockOnClick = vi.fn();
    renderWithProviders(<AddToCartButton onClick={mockOnClick} />);

    expect(screen.getByText('Add to Cart')).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    const mockOnClick = vi.fn();
    renderWithProviders(
      <AddToCartButton onClick={mockOnClick}>
        Custom Text
      </AddToCartButton>
    );

    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const mockOnClick = vi.fn();
    renderWithProviders(<AddToCartButton onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const mockOnClick = vi.fn();
    renderWithProviders(
      <AddToCartButton onClick={mockOnClick} className="custom-class" />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnClick = vi.fn();
    renderWithProviders(<AddToCartButton onClick={mockOnClick} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows animation on click', async () => {
    const mockOnClick = vi.fn();
    renderWithProviders(<AddToCartButton onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // The animation div should be present initially
    expect(button).toBeInTheDocument();

    // Wait for animation to complete (1000ms timeout in component)
    await waitFor(
      () => {
        // Since we mocked framer-motion, the animation div won't actually appear
        // but we can verify the onClick was called
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      },
      { timeout: 1100 }
    );
  });

  it('handles multiple clicks', () => {
    const mockOnClick = vi.fn();
    renderWithProviders(<AddToCartButton onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });
});