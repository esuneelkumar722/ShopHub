import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAdmin } from '../../hooks/useAdmin';
import { useUserStore } from '../../store/userStore';

// Mock @tanstack/react-query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  const mockUseQuery = vi.fn(() => ({ data: false, isLoading: false }));
  return {
    ...actual,
    useQuery: mockUseQuery
  };
});

// Mock dependencies
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

vi.mock('../../store/userStore', () => ({
  useUserStore: vi.fn()
}));

// Create a wrapper with QueryClient for hook testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when no user', () => {
    vi.mocked(useUserStore).mockReturnValue({ user: null });

    const { result } = renderHook(() => useAdmin(), {
      wrapper: createWrapper()
    });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns true when user has admin role', async () => {
    vi.mocked(useUserStore).mockReturnValue({ user: { id: 'user1' } });

    // Mock useQuery to return admin status
    vi.mocked(useQuery).mockReturnValue({
      data: true,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isSuccess: true,
      isFetched: true,
      isFetching: false,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetchedAfterMount: true,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as unknown as UseQueryResult<boolean, Error>);

    const { result } = renderHook(() => useAdmin(), {
      wrapper: createWrapper()
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns false when user has non-admin role', async () => {
    vi.mocked(useUserStore).mockReturnValue({ user: { id: 'user1' } });

    vi.mocked(useQuery).mockReturnValue({
      data: false,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isSuccess: true,
      isFetched: true,
      isFetching: false,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetchedAfterMount: true,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as unknown as UseQueryResult<boolean, Error>);

    const { result } = renderHook(() => useAdmin(), {
      wrapper: createWrapper()
    });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns false when query fails', async () => {
    vi.mocked(useUserStore).mockReturnValue({ user: { id: 'user1' } });

    vi.mocked(useQuery).mockReturnValue({
      data: false,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isSuccess: true,
      isFetched: true,
      isFetching: false,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetchedAfterMount: true,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as unknown as UseQueryResult<boolean, Error>);

    const { result } = renderHook(() => useAdmin(), {
      wrapper: createWrapper()
    });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns false when no role data', async () => {
    vi.mocked(useUserStore).mockReturnValue({ user: { id: 'user1' } });

    vi.mocked(useQuery).mockReturnValue({
      data: false,
      isLoading: false,
      isError: false,
      error: null,
      isPending: false,
      isSuccess: true,
      isFetched: true,
      isFetching: false,
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetchedAfterMount: true,
      isLoadingError: false,
      isPaused: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle'
    } as unknown as UseQueryResult<boolean, Error>);

    const { result } = renderHook(() => useAdmin(), {
      wrapper: createWrapper()
    });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not make query when user has no id', () => {
    vi.mocked(useUserStore).mockReturnValue({ user: { id: '' } });

    const { result } = renderHook(() => useAdmin(), {
      wrapper: createWrapper()
    });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});