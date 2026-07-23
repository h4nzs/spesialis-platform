import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLockPolling } from './useLockPolling';

// ── Hoisted mock helpers ───────────────────────────────────────
const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn<(url: string, opts?: Record<string, unknown>) => Promise<unknown>>(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ get: mockGet }),
}));

let setIntervalSpy: ReturnType<typeof vi.spyOn> | undefined;

beforeEach(() => {
  setIntervalSpy = undefined;
  mockGet.mockReset();
});

afterEach(() => {
  if (setIntervalSpy) {
    setIntervalSpy.mockRestore();
    setIntervalSpy = undefined;
  }
  vi.useRealTimers();
});

// ══════════════════════════════════════════════════════════════
//  Initial fetch
// ══════════════════════════════════════════════════════════════

describe('initial fetch', () => {
  it('calls GET /batch with type and ids on mount', async () => {
    mockGet.mockResolvedValue({ locks: {} });

    renderHook(() => useLockPolling(['a1', 'a2'], 'article'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/locks/batch', {
        params: { type: 'article', ids: 'a1,a2' },
      });
    });
  });

  it('populates lockMap from response', async () => {
    mockGet.mockResolvedValue({
      locks: {
        a1: { locked: true, lockedByEmail: 'user1@test.com' },
        a2: { locked: false, lockedByEmail: '' },
      },
    });

    const { result } = renderHook(() => useLockPolling(['a1', 'a2'], 'article'));

    await waitFor(() => {
      expect(result.current['a1']?.locked).toBe(true);
      expect(result.current['a1']?.lockedByEmail).toBe('user1@test.com');
      expect(result.current['a2']?.locked).toBe(false);
    });
  });

  it('handles missing .locks in response gracefully', async () => {
    mockGet.mockResolvedValue({});

    const { result } = renderHook(() => useLockPolling(['a1'], 'article'));

    await waitFor(() => {
      expect(result.current).toEqual({});
    });
  });

  it('does not call API when ids is empty', async () => {
    renderHook(() => useLockPolling([], 'article'));
    await new Promise((r) => setTimeout(r, 50));
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('returns empty object when ids is empty', () => {
    const { result } = renderHook(() => useLockPolling([], 'article'));
    expect(result.current).toEqual({});
  });

  it('silently handles API error', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLockPolling(['a1'], 'article'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });
    expect(result.current).toEqual({});
  });
});

// ══════════════════════════════════════════════════════════════
//  Polling interval
// ══════════════════════════════════════════════════════════════

describe('polling interval', () => {
  it('starts setInterval with 30s after mount', async () => {
    setIntervalSpy = vi.spyOn(global, 'setInterval');
    mockGet.mockResolvedValue({ locks: {} });

    renderHook(() => useLockPolling(['a1'], 'article'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
  });

  it('re-fetches locks via interval tick', async () => {
    mockGet.mockResolvedValue({ locks: {} });

    // Fake timers BEFORE mount so the interval uses fake timer system
    vi.useFakeTimers();

    renderHook(() => useLockPolling(['a1'], 'article'));

    // Let microtasks flush (the async fetchLocks() called in effect body)
    await act(async () => {});
    expect(mockGet).toHaveBeenCalledTimes(1);

    mockGet.mockClear();
    mockGet.mockResolvedValue({ locks: {} });

    // Advance 30s to trigger the fake interval
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    // After vi.advanceTimersByTime the interval callback was invoked synchronously,
    // but the async await inside fetchLocks needs microtasks to resolve.
    await act(async () => {});

    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/locks/batch', {
      params: { type: 'article', ids: 'a1' },
    });
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('clears interval on unmount', async () => {
    // Spy returns a known ID so we can assert clearInterval was called with it
    setIntervalSpy = vi
      .spyOn(global, 'setInterval')
      .mockReturnValue(42 as unknown as ReturnType<typeof setInterval>);
    mockGet.mockResolvedValue({ locks: {} });

    const clearSpy = vi.spyOn(global, 'clearInterval');

    const { unmount } = renderHook(() => useLockPolling(['a1'], 'article'));

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });

    unmount();

    expect(clearSpy).toHaveBeenCalledWith(42);
  });
});

// ══════════════════════════════════════════════════════════════
//  Ref-based ids (interval uses ref, not re-created on ids change)
// ══════════════════════════════════════════════════════════════

describe('ref-based ids', () => {
  it('reads updated ids from ref on interval tick after rerender', async () => {
    mockGet.mockResolvedValue({ locks: {} });

    // Fake timers BEFORE mount
    vi.useFakeTimers();

    const { rerender } = renderHook(({ ids }) => useLockPolling(ids, 'article'), {
      initialProps: { ids: ['a1'] },
    });

    // Let microtasks flush (initial fetch)
    await act(async () => {});
    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/locks/batch', {
      params: { type: 'article', ids: 'a1' },
    });

    mockGet.mockClear();
    mockGet.mockResolvedValue({ locks: {} });

    // Rerender with new ids — this updates the ref WITHOUT re-creating the interval
    rerender({ ids: ['a1', 'a2', 'a3'] });

    // Advance 30s to trigger the fake interval — should read updated ref
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    await act(async () => {});

    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/locks/batch', {
      params: { type: 'article', ids: 'a1,a2,a3' },
    });
  });

  it('stops polling when ids become empty (sets empty map, no API call)', async () => {
    mockGet.mockResolvedValue({ locks: {} });

    vi.useFakeTimers();

    const { result, rerender } = renderHook(({ ids }) => useLockPolling(ids, 'article'), {
      initialProps: { ids: ['a1'] },
    });

    await act(async () => {});
    expect(mockGet).toHaveBeenCalledTimes(1);

    mockGet.mockClear();
    mockGet.mockResolvedValue({ locks: {} });

    // Rerender with empty ids
    rerender({ ids: [] });

    // The interval callback should detect idsRef.current is empty
    // and set lockMap to {} without calling the API
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    expect(mockGet).not.toHaveBeenCalled();
    expect(result.current).toEqual({});
  });

  it('starts polling when ids become non-empty on interval tick', async () => {
    mockGet.mockResolvedValue({ locks: {} });

    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ ids }: { ids: string[] }) => useLockPolling(ids, 'article'),
      {
        initialProps: { ids: [] },
      },
    );

    // No initial fetch since ids is empty
    await act(async () => {});
    expect(mockGet).not.toHaveBeenCalled();

    mockGet.mockClear();
    mockGet.mockResolvedValue({ locks: { a1: { locked: false, lockedByEmail: '' } } });

    // Rerender with non-empty ids — but the interval was already running (from mount)
    // It just wasn't calling the API because ids were empty. Now the ref is updated.
    rerender({ ids: ['a1'] });

    // Advance 30s — the interval callback should now call the API
    await act(async () => {
      vi.advanceTimersByTime(30000);
    });

    await act(async () => {});

    expect(mockGet).toHaveBeenCalledWith('/api/v1/admin/locks/batch', {
      params: { type: 'article', ids: 'a1' },
    });
    expect(result.current['a1']?.locked).toBe(false);
  });
});
