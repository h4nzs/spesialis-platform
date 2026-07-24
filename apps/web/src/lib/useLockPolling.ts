import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import type { ApiClient } from '@ahlipanggilan/shared';
import { subscribeLockEvents } from './lockEventBus.ts';
import type { LockEvent } from './lockEventBus.ts';

export type LockEntry = { locked: boolean; lockedByEmail: string };
export type LockMap = Record<string, LockEntry>;

const POLL_INTERVAL = 30_000;

/**
 * Polls `/api/v1/admin/locks/batch?type={resourceType}&ids=...` every 30s,
 * dengan update real-time via Redis Pub/Sub + SSE ketika tersedia.
 *
 * Kombinasi:
 * 1. **Polling** (30s) — safety net, selalu jalan
 * 2. **SSE** (real-time) — update lockMap langsung saat ada event
 *    dari user lain (acquire / release / takeover)
 *
 * Jika Redis tidak tersedia di backend, SSE gagal silent —
 * polling tetap jalan seperti biasa.
 *
 * @param ids          Array of resource IDs visible on the current page
 * @param resourceType One of `'article'`, `'cms_page'`, `'faq'`
 * @param api          Optional API client to reuse
 * @returns A map of `resourceId → { locked, lockedByEmail }`
 */
export function useLockPolling(ids: string[], resourceType: string, api?: ApiClient): LockMap {
  const client = api ?? useRef(createBrowserClient()).current;
  const [lockMap, setLockMap] = useState<LockMap>({});

  // Keep resourceType in ref for SSE event handler
  const resourceTypeRef = useRef(resourceType);
  resourceTypeRef.current = resourceType;

  // Keep ids in a ref so the interval callback always reads the latest value
  // without needing to re-create the interval on every ids change.
  const idsRef = useRef(ids);
  idsRef.current = ids;

  const fetchLocks = useCallback(async () => {
    const currentIds = idsRef.current;
    if (currentIds.length === 0) {
      setLockMap({});
      return;
    }

    try {
      const result = await client.get<{ locks: LockMap }>('/api/v1/admin/locks/batch', {
        params: { type: resourceType, ids: currentIds.join(',') },
      });
      const data = result as unknown as { locks?: LockMap };
      setLockMap(data?.locks ?? {});
    } catch {
      // silent — lock status is cosmetic
    }
  }, [resourceType, client]);

  // ── Polling interval (safety net) ──────────────────────────
  useEffect(() => {
    fetchLocks();
    const interval = setInterval(fetchLocks, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLocks]);

  // ── Real-time via SSE ──────────────────────────────────────
  useEffect(() => {
    if (ids.length === 0) return;

    const unsub = subscribeLockEvents((event: LockEvent) => {
      // Hanya proses event untuk resource type yang kita pantau
      if (event.resourceType !== resourceTypeRef.current) return;

      setLockMap((prev) => {
        // Abaikan event untuk resource yang tidak ada di halaman
        if (!idsRef.current.includes(event.resourceId)) return prev;

        if (event.type === 'released') {
          // Lock dilepas — hapus dari map
          const next = { ...prev };
          delete next[event.resourceId];
          return next;
        }

        // acquired / takeover — set lock state
        return {
          ...prev,
          [event.resourceId]: {
            locked: true,
            lockedByEmail: event.lockedByEmail ?? 'Unknown',
          },
        };
      });
    });

    return unsub;
  }, [ids.length > 0 ? ids.join(',') : 'empty']);
  // ^ re-subscribe hanya saat set IDs berubah (dari kosong ke isi atau sebaliknya)

  return lockMap;
}
