import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdmin } from '../../hooks/useAdmin';

// Create mock functions
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockUseUserStore = vi.fn(() => ({ user: null }));

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: mockFrom
  }
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: mockUseUserStore
}));

describe('useAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when no user', () => {
    mockUseUserStore.mockReturnValue({ user: null });

    const { result } = renderHook(() => useAdmin());

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('returns true when user has admin role', async () => {
    mockUseUserStore.mockReturnValue({ user: { id: 'user1' } as any });

    mockSingle.mockResolvedValue({
      data: { role: 'admin' },
      error: null
    });

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFrom).toHaveBeenCalledWith('user_roles');
    expect(mockSelect).toHaveBeenCalledWith('role');
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user1');
  });

  it('returns false when user has non-admin role', async () => {
    mockUseUserStore.mockReturnValue({ user: { id: 'user1' } as any });

    mockSingle.mockResolvedValue({
      data: { role: 'user' },
      error: null
    });

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns false when query fails', async () => {
    mockUseUserStore.mockReturnValue({ user: { id: 'user1' } as any });

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Not found' }
    });

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('returns false when no role data', async () => {
    mockUseUserStore.mockReturnValue({ user: { id: 'user1' } as any });

    mockSingle.mockResolvedValue({
      data: null,
      error: null
    });

    const { result } = renderHook(() => useAdmin());

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('does not make query when user has no id', () => {
    mockUseUserStore.mockReturnValue({ user: { id: '' } as any });

    renderHook(() => useAdmin());

    expect(mockFrom).not.toHaveBeenCalled();
  });
});