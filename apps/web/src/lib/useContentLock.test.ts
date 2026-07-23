import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useContentLock } from './useContentLock';

// ── Hoisted mock helpers ───────────────────────────────────────
// vi.hoisted ensures this is defined before the vi.mock factory runs
const { mockPost } = vi.hoisted(() => ({
  mockPost: vi.fn<(url: string, opts?: Record<string, unknown>) => Promise<unknown>>(),
}));

vi.mock('@ahlipanggilan/shared', () => ({
  createBrowserClient: () => ({ post: mockPost }),
}));

// Captured by heartbeat tests so we can manually invoke interval callback
let heartbeatCallback: (() => Promise<void>) | undefined;
let setIntervalId: ReturnType<typeof setInterval>;
let heartbeatSpy: ReturnType<typeof vi.spyOn> | undefined;

beforeEach(() => {
  heartbeatCallback = undefined;
  heartbeatSpy = undefined;
  mockPost.mockReset();
});

afterEach(() => {
  // Restore ONLY the setInterval spy — NOT all mocks!
  // vi.restoreAllMocks() would also restore vi.mock(), breaking the module mock.
  if (heartbeatSpy) {
    heartbeatSpy.mockRestore();
    heartbeatSpy = undefined;
  }
  // Clean up any stubbed setInterval
  if (setIntervalId) {
    clearInterval(setIntervalId);
    setIntervalId = undefined!;
  }
});

// ── Helpers ────────────────────────────────────────────────────
/** Spy on setInterval and capture the callback for manual invocation */
function captureHeartbeat() {
  heartbeatSpy = vi.spyOn(global, 'setInterval').mockImplementation((cb, _ms, ...args) => {
    heartbeatCallback = cb as () => Promise<void>;
    setIntervalId = setIntervalId ?? (1 as unknown as ReturnType<typeof setInterval>);
    return setIntervalId;
  });
  return heartbeatSpy;
}

/** Wait for acquire to complete by waiting for the mock to be called */
async function waitForAcquire() {
  await waitFor(
    () => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/locks/acquire', expect.anything());
    },
    { timeout: 3000 },
  );
}

// ══════════════════════════════════════════════════════════════
//  Acquire
// ══════════════════════════════════════════════════════════════

describe('acquire', () => {
  it('calls POST /acquire with correct body', async () => {
    mockPost.mockResolvedValue({ acquired: true });

    renderHook(() => useContentLock('article', 'art-1'));

    await waitForAcquire();
    expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/locks/acquire', {
      body: { resourceType: 'article', resourceId: 'art-1' },
    });
  });

  it('sets isLockedByMe when lock acquired', async () => {
    mockPost.mockResolvedValue({ acquired: true });

    const { result } = renderHook(() => useContentLock('article', 'art-1'));

    await waitFor(() => {
      expect(result.current.isLockedByMe).toBe(true);
    });
    expect(result.current.locked).toBe(false);
    expect(result.current.lockLost).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets locked state when 409 conflict returned', async () => {
    mockPost.mockRejectedValue({
      status: 409,
      response: { lockedByEmail: 'other@user.com' },
    });

    const { result } = renderHook(() => useContentLock('article', 'art-1'));

    await waitFor(() => {
      expect(result.current.locked).toBe(true);
    });
    expect(result.current.lockedByEmail).toBe('other@user.com');
    expect(result.current.isLockedByMe).toBe(false);
    expect(result.current.error).toBe('Sumber daya sedang diedit oleh pengguna lain');
  });

  it('shows Unknown email when 409 has no lockedByEmail', async () => {
    mockPost.mockRejectedValue({ status: 409 });

    const { result } = renderHook(() => useContentLock('article', 'art-1'));

    await waitFor(() => {
      expect(result.current.lockedByEmail).toBe('Unknown');
    });
  });

  it('sets generic error on non-409 failure', async () => {
    mockPost.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useContentLock('article', 'art-1'));

    await waitFor(() => {
      expect(result.current.error).toBe('Gagal mengunci sumber daya');
    });
    expect(result.current.locked).toBe(false);
  });

  it('skips API call when resourceType is undefined', async () => {
    renderHook(() => useContentLock());
    // Wait a tick to ensure no async side-effects fire
    await new Promise((r) => setTimeout(r, 50));
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
//  Release
// ══════════════════════════════════════════════════════════════

describe('release', () => {
  it('sends POST /release and resets state', async () => {
    mockPost.mockResolvedValue({ acquired: true });

    const { result } = renderHook(() => useContentLock('article', 'art-1'));

    await waitFor(() => {
      expect(result.current.isLockedByMe).toBe(true);
    });

    mockPost.mockClear();
    mockPost.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.release();
    });

    expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/locks/release', {
      body: { resourceType: 'article', resourceId: 'art-1' },
    });
    expect(result.current.isLockedByMe).toBe(false);
    expect(result.current.locked).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does nothing when no lock was acquired', async () => {
    mockPost.mockRejectedValue({ status: 409 });

    const { result } = renderHook(() => useContentLock('article', 'art-1'));

    await waitFor(() => {
      expect(result.current.locked).toBe(true);
    });

    mockPost.mockClear();

    await act(async () => {
      await result.current.release();
    });

    // No release call because lockAcquiredRef.current is false
    expect(mockPost).not.toHaveBeenCalledWith('/api/v1/admin/locks/release', expect.anything());
  });
});

// ══════════════════════════════════════════════════════════════
//  Takeover
// ══════════════════════════════════════════════════════════════

describe('takeover', () => {
  it('calls POST /takeover and sets isLockedByMe on success', async () => {
    mockPost.mockResolvedValue({ acquired: true });

    const { result } = renderHook(() => useContentLock('article', 'art-1'));

    await waitForAcquire();
    mockPost.mockClear();

    mockPost.mockResolvedValue({ acquired: true });

    await act(async () => {
      await result.current.takeover();
    });

    expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/locks/takeover', {
      body: { resourceType: 'article', resourceId: 'art-1' },
    });
    expect(result.current.isLockedByMe).toBe(true);
    expect(result.current.locked).toBe(false);
  });

  it('sets error on takeover failure', async () => {
    mockPost.mockResolvedValue({ acquired: true });

    const { result } = renderHook(() => useContentLock('article', 'art-1'));

    await waitForAcquire();
    mockPost.mockClear();

    mockPost.mockRejectedValue(new Error('fail'));

    await act(async () => {
      await result.current.takeover();
    });

    expect(result.current.error).toBe('Gagal mengambil alih kunci');
  });
});

// ══════════════════════════════════════════════════════════════
//  Heartbeat
// ══════════════════════════════════════════════════════════════

describe('heartbeat', () => {
  it('starts heartbeat after acquire succeeds', async () => {
    const spy = captureHeartbeat();
    mockPost.mockResolvedValue({ acquired: true });

    renderHook(() => useContentLock('article', 'art-1'));

    await waitForAcquire();
    expect(spy).toHaveBeenCalledWith(expect.any(Function), 30000);
  });

  it('sends POST /heartbeat with correct body', async () => {
    captureHeartbeat();
    mockPost.mockResolvedValue({ acquired: true });

    renderHook(() => useContentLock('article', 'art-1'));

    await waitForAcquire();
    mockPost.mockClear();

    await act(async () => {
      await heartbeatCallback!();
    });

    expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/locks/heartbeat', {
      body: { resourceType: 'article', resourceId: 'art-1' },
    });
  });

  it('sets lockLost when heartbeat returns 409', async () => {
    captureHeartbeat();
    mockPost.mockResolvedValue({ acquired: true });

    const { result } = renderHook(() => useContentLock('article', 'art-1'));

    await waitForAcquire();
    mockPost.mockClear();

    // Heartbeat returns 409 — someone took over
    mockPost.mockResolvedValue(Promise.reject({ status: 409 }));

    await act(async () => {
      await heartbeatCallback!();
    });

    expect(result.current.lockLost).toBe(true);
    expect(result.current.locked).toBe(true);
    expect(result.current.isLockedByMe).toBe(false);
    expect(result.current.error).toBe('Kunci telah diambil alih oleh pengguna lain');
  });

  it('does not call API when lock is lost and heartbeat fires', async () => {
    captureHeartbeat();
    mockPost.mockResolvedValue({ acquired: true });

    renderHook(() => useContentLock('article', 'art-1'));

    await waitForAcquire();
    mockPost.mockClear();

    // First heartbeat: returns 409 → lockLost
    mockPost.mockRejectedValue({ status: 409 });

    await act(async () => {
      await heartbeatCallback!();
    });

    mockPost.mockClear();

    // Second heartbeat: should not call API because lockAcquiredRef is now false
    await act(async () => {
      await heartbeatCallback!();
    });

    // The heartbeat callback checks lockAcquiredRef.current at start
    // But our spy fires the callback even if the interval guard bails early.
    // This test verifies that AFTER lock lost, the callback returns early
    // without making another API call.
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ══════════════════════════════════════════════════════════════
//  Lifecycle (useEffect mount/unmount)
// ══════════════════════════════════════════════════════════════

describe('lifecycle', () => {
  it('acquires lock on mount', async () => {
    mockPost.mockResolvedValue({ acquired: true });

    renderHook(() => useContentLock('article', 'art-1'));

    await waitForAcquire();
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('releases lock on unmount', async () => {
    mockPost.mockResolvedValue({ acquired: true });

    const { unmount } = renderHook(() => useContentLock('article', 'art-1'));

    await waitForAcquire();
    mockPost.mockClear();

    unmount();

    // The cleanup fires synchronously but the POST is async (but we don't await it).
    // We need a small wait for the promise microtask to queue.
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/locks/release', {
        body: { resourceType: 'article', resourceId: 'art-1' },
      });
    });
  });

  it('does not call acquire on mount when resourceType is undefined', () => {
    renderHook(() => useContentLock());
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('does not release on unmount when resourceType is undefined', () => {
    const { unmount } = renderHook(() => useContentLock());
    unmount();
    expect(mockPost).not.toHaveBeenCalled();
  });
});
