import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';

export type ResourceType = 'article' | 'cms_page' | 'faq';

interface LockResult {
  acquired: boolean;
  lockId?: string;
}

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

/**
 * Hook to manage content editing locks.
 *
 * Acquires a lock when the component mounts, sends heartbeats every 30s,
 * and releases the lock when the component unmounts or editing is done.
 */
export function useContentLock(resourceType?: ResourceType, resourceId?: string | null) {
  const api = useRef(createBrowserClient()).current;

  // State that triggers re-renders
  const [state, setState] = useState({
    locked: false,
    lockedByEmail: undefined as string | undefined,
    isLockedByMe: false,
    error: null as string | null,
    lockLost: false,
  });

  // Refs for values accessed inside intervals/cleanup (avoids stale closures)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockAcquiredRef = useRef(false);
  const resourceIdRef = useRef(resourceId);
  resourceIdRef.current = resourceId;
  const resourceTypeRef = useRef(resourceType);
  resourceTypeRef.current = resourceType;

  // ── Acquire lock ────────────────────────────────────────────
  const acquire = useCallback(async () => {
    const id = resourceIdRef.current;
    const rt = resourceTypeRef.current;
    if (!rt || !id) {
      setState({
        locked: false,
        lockedByEmail: undefined,
        isLockedByMe: false,
        error: null,
        lockLost: false,
      });
      return;
    }

    try {
      const res = await api.post<LockResult>('/api/v1/admin/locks/acquire', {
        body: { resourceType: rt, resourceId: id },
      });

      const data = res as unknown as LockResult;
      lockAcquiredRef.current = data.acquired;
      setState({
        locked: !data.acquired,
        lockedByEmail: undefined,
        isLockedByMe: data.acquired,
        error: null,
        lockLost: false,
      });
    } catch (err: unknown) {
      const httpErr = err as { status?: number; response?: { lockedByEmail?: string } };
      if (httpErr.status === 409) {
        lockAcquiredRef.current = false;
        setState({
          locked: true,
          lockedByEmail: httpErr.response?.lockedByEmail ?? 'Unknown',
          isLockedByMe: false,
          error: 'Sumber daya sedang diedit oleh pengguna lain',
          lockLost: false,
        });
      } else {
        setState({
          locked: false,
          lockedByEmail: undefined,
          isLockedByMe: false,
          error: 'Gagal mengunci sumber daya',
          lockLost: false,
        });
      }
    }
  }, [api]);

  // ── Release lock ────────────────────────────────────────────
  const release = useCallback(async () => {
    const id = resourceIdRef.current;
    const rt = resourceTypeRef.current;
    if (!rt || !id || !lockAcquiredRef.current) return;

    lockAcquiredRef.current = false;
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    try {
      await api.post('/api/v1/admin/locks/release', {
        body: { resourceType: rt, resourceId: id },
      });
    } catch {
      // Best-effort release — ignore errors
    }

    setState({
      locked: false,
      lockedByEmail: undefined,
      isLockedByMe: false,
      error: null,
      lockLost: false,
    });
  }, [api]);

  // ── Takeover lock ───────────────────────────────────────────
  const takeover = useCallback(async () => {
    const id = resourceIdRef.current;
    const rt = resourceTypeRef.current;
    if (!rt || !id) return;

    try {
      const res = await api.post<LockResult>('/api/v1/admin/locks/takeover', {
        body: { resourceType: rt, resourceId: id },
      });

      const data = res as unknown as LockResult;
      lockAcquiredRef.current = data.acquired;
      setState({
        locked: false,
        lockedByEmail: undefined,
        isLockedByMe: true,
        error: null,
        lockLost: false,
      });
    } catch {
      setState((prev) => ({ ...prev, error: 'Gagal mengambil alih kunci' }));
    }
  }, [api]);

  // ── Heartbeat sender ────────────────────────────────────────
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) return;

    heartbeatRef.current = setInterval(async () => {
      const id = resourceIdRef.current;
      const rt = resourceTypeRef.current;
      if (!rt || !id || !lockAcquiredRef.current) return;

      try {
        await api.post('/api/v1/admin/locks/heartbeat', {
          body: { resourceType: rt, resourceId: id },
        });
      } catch (err: unknown) {
        const httpErr = err as { status?: number };
        if (httpErr.status === 409) {
          lockAcquiredRef.current = false;
          clearInterval(heartbeatRef.current!);
          heartbeatRef.current = null;
          setState((prev) => ({
            ...prev,
            locked: true,
            isLockedByMe: false,
            lockLost: true,
            error: 'Kunci telah diambil alih oleh pengguna lain',
          }));
        }
      }
    }, HEARTBEAT_INTERVAL);
  }, [api]);

  // ── Lifecycle ───────────────────────────────────────────────
  useEffect(() => {
    const id = resourceIdRef.current;
    const rt = resourceTypeRef.current;

    // If there's nothing to lock (e.g. new article without editingId),
    // skip acquire, heartbeat, AND the release-on-unmount entirely.
    // Since `id` and `rt` are captured in the closure, the cleanup
    // will also skip — no wasted API call.
    if (!rt || !id) return;

    acquire().then(startHeartbeat);

    return () => {
      lockAcquiredRef.current = false;
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      // `id` + `rt` are from the closure — they reflect the resource
      // that THIS effect acquired the lock for. Using closure values
      // instead of refs ensures correctness if resource changes mid-lifecycle.
      api
        .post('/api/v1/admin/locks/release', {
          body: { resourceType: rt, resourceId: id },
        })
        .catch(() => {});
    };
  }, [acquire, startHeartbeat, api]);

  return {
    ...state,
    release,
    takeover,
  };
}
