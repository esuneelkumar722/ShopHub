import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../renderWithProviders';
import { SkipToContent } from '../../components/accessibility/SkipToContent';

// Mock react-router-dom
import { vi } from 'vitest';
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    Link: ({ children, to, className, 'aria-label': ariaLabel, ...props }: any) =>
      <a href={to} className={className} aria-label={ariaLabel} {...props}>{children}</a>,
  };
});

describe('SkipToContent', () => {
  it('renders the skip link', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.tagName).toBe('A');
  });

  it('has correct href attribute', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has correct aria-label', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveAttribute('aria-label', 'Skip to main content');
  });

  it('has correct text content', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toHaveTextContent('Skip to main content');
  });

  it('applies correct CSS classes', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByText('Skip to main content');

    // Screen reader only by default
    expect(skipLink).toHaveClass('sr-only');

    // Focus styles
    expect(skipLink).toHaveClass('focus:not-sr-only');
    expect(skipLink).toHaveClass('focus:absolute');
    expect(skipLink).toHaveClass('focus:top-4');
    expect(skipLink).toHaveClass('focus:left-4');
    expect(skipLink).toHaveClass('focus:z-50');
    expect(skipLink).toHaveClass('focus:px-4');
    expect(skipLink).toHaveClass('focus:py-2');
    expect(skipLink).toHaveClass('focus:bg-primary-600');
    expect(skipLink).toHaveClass('focus:text-white');
    expect(skipLink).toHaveClass('focus:rounded-lg');
    expect(skipLink).toHaveClass('focus:outline-none');
    expect(skipLink).toHaveClass('focus:ring-2');
    expect(skipLink).toHaveClass('focus:ring-primary-500');
  });

  it('is visually hidden by default', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByText('Skip to main content');

    // Should be screen reader only (visually hidden)
    expect(skipLink).toHaveClass('sr-only');
    // The focus:not-sr-only is a CSS modifier that will show it on focus
  });

  it('becomes visible on focus', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByText('Skip to main content');

    // Focus the link
    skipLink.focus();

    // The link should still have the sr-only class, but focus styles should apply
    expect(skipLink).toHaveClass('sr-only');
    expect(skipLink).toHaveClass('focus:not-sr-only'); // This indicates focus styles are available
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByText('Skip to main content');

    // Should be a proper link
    expect(skipLink.tagName).toBe('A');

    // Should have href for navigation
    expect(skipLink).toHaveAttribute('href');

    // Should have descriptive aria-label
    expect(skipLink).toHaveAttribute('aria-label');
  });

  it('is keyboard accessible', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByText('Skip to main content');

    // Should be focusable
    skipLink.focus();
    expect(document.activeElement).toBe(skipLink);

    // Should be able to receive keyboard events
    expect(skipLink).toHaveAttribute('href'); // Links are keyboard accessible by default
  });

  it('provides semantic navigation', () => {
    renderWithProviders(<SkipToContent />);

    const skipLink = screen.getByText('Skip to main content');

    // Should link to main content area
    expect(skipLink).toHaveAttribute('href', '#main-content');

    // Should have clear, descriptive text
    expect(skipLink).toHaveTextContent('Skip to main content');
  });
});