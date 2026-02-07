import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useUserStore } from '../../store/userStore';

// Mock cart store
vi.mock('../../store/cartStore', () => ({
  useCartStore: {
    getState: vi.fn(() => ({
      transferGuestToUser: vi.fn(),
      setUserId: vi.fn()
    }))
  }
}));

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useUserStore());
    act(() => {
      result.current.setUser(null);
    });
  });

  it('starts with null user', () => {
    const { result } = renderHook(() => useUserStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isAdmin()).toBe(false);
  });

  it('sets user correctly', () => {
    const { result } = renderHook(() => useUserStore());

    const user = {
      id: 'user1',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user' as const,
      created_at: '2024-01-01T00:00:00Z'
    };

    act(() => {
      result.current.setUser(user);
    });

    expect(result.current.user).toEqual(user);
  });

  it('transfers guest cart when user logs in', async () => {
    const { useCartStore } = await import('../../store/cartStore');
    const mockTransferGuestToUser = vi.fn();
    (useCartStore as unknown as { getState: typeof vi.fn }).getState = vi.fn().mockReturnValue({
      transferGuestToUser: mockTransferGuestToUser,
      setUserId: vi.fn()
    });

    const { result } = renderHook(() => useUserStore());

    const user = {
      id: 'user1',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user' as const,
      created_at: '2024-01-01T00:00:00Z'
    };

    act(() => {
      result.current.setUser(user);
    });

    expect(mockTransferGuestToUser).toHaveBeenCalledWith('user1');
  });

  it('clears user cart when user logs out', async () => {
    const { useCartStore } = await import('../../store/cartStore');
    const mockSetUserId = vi.fn();
    (useCartStore as unknown as { getState: typeof vi.fn }).getState = vi.fn().mockReturnValue({
      transferGuestToUser: vi.fn(),
      setUserId: mockSetUserId
    });

    const { result } = renderHook(() => useUserStore());

    // First set a user
    const user = {
      id: 'user1',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user' as const,
      created_at: '2024-01-01T00:00:00Z'
    };

    act(() => {
      result.current.setUser(user);
    });

    // Then log out
    act(() => {
      result.current.setUser(null);
    });

    expect(mockSetUserId).toHaveBeenCalledWith(null);
  });

  it('returns true for admin user', () => {
    const { result } = renderHook(() => useUserStore());

    const adminUser = {
      id: 'admin1',
      email: 'admin@example.com',
      full_name: 'Admin User',
      role: 'admin' as const,
      created_at: '2024-01-01T00:00:00Z'
    };

    act(() => {
      result.current.setUser(adminUser);
    });

    expect(result.current.isAdmin()).toBe(true);
  });

  it('returns false for non-admin user', () => {
    const { result } = renderHook(() => useUserStore());

    const regularUser = {
      id: 'user1',
      email: 'user@example.com',
      full_name: 'Regular User',
      role: 'user' as const,
      created_at: '2024-01-01T00:00:00Z'
    };

    act(() => {
      result.current.setUser(regularUser);
    });

    expect(result.current.isAdmin()).toBe(false);
  });

  it('returns false for null user', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setUser(null);
    });

    expect(result.current.isAdmin()).toBe(false);
  });
});