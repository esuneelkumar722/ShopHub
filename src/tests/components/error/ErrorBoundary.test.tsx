import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import { ErrorBoundary } from "../../../components/error/ErrorBoundary";

// Mock window methods
const mockReload = vi.fn();
const mockHref = vi.fn();

Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
  },
  writable: true
});

Object.defineProperty(window.location, 'href', {
  set: mockHref,
  configurable: true
});

// Component that throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
};

// Component that renders normally
const NormalComponent = () => <div>Normal component</div>;

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal component')).toBeInTheDocument();
  });

  it('renders error UI when an error occurs', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByText("We're sorry, but something unexpected happened. Don't worry, your data is safe.")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('renders custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary fallback={<div>Custom error fallback</div>}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('shows error details in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as { DEV: boolean }).DEV = true;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();

    consoleSpy.mockRestore();
    (import.meta.env as { DEV: boolean }).DEV = originalEnv;
  });

  it('hides error details in production mode', () => {
    // Mock production environment
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as { DEV: boolean }).DEV = false;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
    (import.meta.env as { DEV: boolean }).DEV = originalEnv;
  });

  it('calls window.location.reload when try again is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockReload).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('calls window.location.href when go home is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    const goHomeButton = screen.getByRole('button', { name: /go home/i });
    fireEvent.click(goHomeButton);

    expect(mockHref).toHaveBeenCalledWith('/');

    consoleSpy.mockRestore();
  });

  it('renders action buttons', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});