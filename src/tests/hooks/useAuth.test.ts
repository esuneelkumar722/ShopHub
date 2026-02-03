import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';

// Create mock functions
const mockSetUser = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn((_callback?: any) => ({
  data: { subscription: { unsubscribe: vi.fn() } }
}));

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange
    }
  }
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn(() => mockSetUser)
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('checks for active session on mount', async () => {
    const mockSession = {
      user: {
        id: 'user1',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
        created_at: '2024-01-01T00:00:00Z'
      }
    };

    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith({
        id: 'user1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z'
      });
    });
  });

  it('sets user to null when no session exists', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(null);
    });
  });

  it('uses email prefix as full name when no metadata', async () => {
    const mockSession = {
      user: {
        id: 'user1',
        email: 'test@example.com',
        user_metadata: {},
        created_at: '2024-01-01T00:00:00Z'
      }
    };

    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({
        id: 'user1',
        email: 'test@example.com',
        full_name: 'test',
        role: 'user',
        created_at: '2024-01-01T00:00:00Z'
      });
    });
  });

  it('listens for auth state changes', () => {
    const mockUnsubscribe = vi.fn();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    });

    const { unmount } = renderHook(() => useAuth());

    expect(mockOnAuthStateChange).toHaveBeenCalled();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('handles auth state change to signed in', () => {
    const mockCallback = vi.fn();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      };
    });

    renderHook(() => useAuth());

    const mockSession = {
      user: {
        id: 'user1',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' },
        created_at: '2024-01-01T00:00:00Z'
      }
    };

    // Simulate auth state change
    mockCallback('SIGNED_IN', mockSession);

    expect(mockSetUser).toHaveBeenCalledWith({
      id: 'user1',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user',
      created_at: '2024-01-01T00:00:00Z'
    });
  });

  it('handles auth state change to signed out', () => {
    const mockCallback = vi.fn();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      };
    });

    renderHook(() => useAuth());

    // Simulate auth state change
    mockCallback('SIGNED_OUT', null);

    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});

