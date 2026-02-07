import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

// Mock dependencies
vi.mock('../../lib/supabase', () => {
  const mockGetSession = vi.fn();
  const mockOnAuthStateChange = vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } }
  }));

  return {
    supabase: {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange
      }
    }
  };
});

const mockSetUser = vi.fn();

vi.mock('../../store/userStore', () => {
  return {
    useUserStore: vi.fn((selector) => {
      if (selector && typeof selector === 'function') {
        return selector({ user: null, setUser: mockSetUser, isAdmin: vi.fn() });
      }
      return { user: null, setUser: mockSetUser, isAdmin: vi.fn() };
    })
  };
});

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
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z'
      },
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      token_type: 'bearer' as const
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn(), id: 'mock-id', callback: vi.fn() } }
    });

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(vi.mocked(supabase.auth.getSession)).toHaveBeenCalled();
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
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn(), id: 'mock-id', callback: vi.fn() } }
    });

    renderHook(() => useAuth());

    await waitFor(() => {
      expect(vi.mocked(supabase.auth.getSession)).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(null);
    });
  });

  it('uses email prefix as full name when no metadata', async () => {
    const mockSession = {
      user: {
        id: 'user1',
        email: 'test@example.com',
        user_metadata: {},
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z'
      },
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_in: 3600,
      token_type: 'bearer' as const
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: mockSession }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn(), id: 'mock-id', callback: vi.fn() } }
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
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe, id: 'mock-id', callback: vi.fn() } }
    });

    const { unmount } = renderHook(() => useAuth());

    expect(vi.mocked(supabase.auth.onAuthStateChange)).toHaveBeenCalled();

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('handles auth state change to signed in', () => {
    const mockCallback = vi.fn();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return {
        data: { subscription: { unsubscribe: vi.fn(), id: 'mock-id', callback: vi.fn() } }
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
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      mockCallback.mockImplementation(callback);
      return {
        data: { subscription: { unsubscribe: vi.fn(), id: 'mock-id', callback: vi.fn() } }
      };
    });

    renderHook(() => useAuth());

    // Simulate auth state change
    mockCallback('SIGNED_OUT', null);

    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});

