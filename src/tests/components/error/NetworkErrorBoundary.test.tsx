import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, render, waitFor } from '@testing-library/react';
import { NetworkErrorBoundary } from "../../../components/error/NetworkErrorBoundary";

// Mock navigator.onLine
const mockNavigator = {
  onLine: true
};

Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

// Mock window.location.reload
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload
  },
  writable: true
});

// Component that throws a network error
const NetworkErrorComponent = () => {
  throw new Error('Failed to fetch');
};

// Component that throws a non-network error
const RegularErrorComponent = () => {
  throw new Error('Regular error');
};

// Component that renders normally
const NormalComponent = () => <div>Normal component</div>;

describe('NetworkErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
  });

  afterEach(() => {
    // Clean up event listeners
    window.dispatchEvent(new Event('online'));
    window.dispatchEvent(new Event('offline'));
  });

  it('renders children when no error occurs', () => {
    render(
      <NetworkErrorBoundary>
        <NormalComponent />
      </NetworkErrorBoundary>
    );

    expect(screen.getByText('Normal component')).toBeInTheDocument();
  });

  it('renders network error UI when a network error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <NetworkErrorBoundary>
        <NetworkErrorComponent />
      </NetworkErrorBoundary>
    );

    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect to the server. Please check your connection and try again.')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('does not catch non-network errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    expect(() => {
      render(
        <NetworkErrorBoundary>
          <RegularErrorComponent />
        </NetworkErrorBoundary>
      );
    }).toThrow('Regular error');

    consoleSpy.mockRestore();
  });

  it('shows offline message when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    render(
      <NetworkErrorBoundary>
        <NormalComponent />
      </NetworkErrorBoundary>
    );

    expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
    expect(screen.getByText('Please check your internet connection and try again.')).toBeInTheDocument();
  });

  it('shows online status when connected', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    render(
      <NetworkErrorBoundary>
        <NormalComponent />
      </NetworkErrorBoundary>
    );

    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('handles online event', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    render(
      <NetworkErrorBoundary>
        <NormalComponent />
      </NetworkErrorBoundary>
    );

    // Initially offline
    expect(screen.getByText('Offline')).toBeInTheDocument();

    // Simulate coming online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(screen.queryByText('Offline')).not.toBeInTheDocument();
    });
  });

  it('handles offline event', async () => {
    render(
      <NetworkErrorBoundary>
        <NormalComponent />
      </NetworkErrorBoundary>
    );

    // Initially online
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    window.dispatchEvent(new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  it('calls window.location.reload when retry is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <NetworkErrorBoundary>
        <NetworkErrorComponent />
      </NetworkErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    expect(mockReload).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('disables retry button when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    render(
      <NetworkErrorBoundary>
        <NormalComponent />
      </NetworkErrorBoundary>
    );

    const retryButton = screen.getByRole('button', { name: /waiting for connection/i });
    expect(retryButton).toBeDisabled();
  });

  it('shows technical details for network errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <NetworkErrorBoundary>
        <NetworkErrorComponent />
      </NetworkErrorBoundary>
    );

    expect(screen.getByText('Technical Details')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});