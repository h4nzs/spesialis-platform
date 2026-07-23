import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import type { ApiClient } from '@ahlipanggilan/shared';

export type LockEntry = { locked: boolean; lockedByEmail: string };
export type LockMap = Record<string, LockEntry>;

const POLL_INTERVAL = 30_000;

/**
 * Polls `/api/v1/admin/locks/batch?type={resourceType}&ids=...` every 30s.
 *
 * @param ids          Array of resource IDs visible on the current page (e.g. sliced + paginated).
 *                     Uses a ref internally so the polling interval is NOT re-created on every
 *                     re-render — it always reads the latest `ids` value.
 * @param resourceType One of `'article'`, `'cms_page'`, `'faq'`
 * @param api          Optional API client to reuse (avoids creating a duplicate instance).
 *                     If omitted, a new client is created internally.
 * @returns A map of `resourceId → { locked, lockedByEmail }`
 */
export function useLockPolling(ids: string[], resourceType: string, api?: ApiClient): LockMap {
  const client = api ?? useRef(createBrowserClient()).current;
  const [lockMap, setLockMap] = useState<LockMap>({});

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

  useEffect(() => {
    fetchLocks();
    const interval = setInterval(fetchLocks, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchLocks]);

  return lockMap;
}
