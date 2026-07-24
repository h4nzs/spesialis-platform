import { getRedis } from './redis.ts';

// ── Types ────────────────────────────────────────────────────────

export interface LockEvent {
  type: 'acquired' | 'released' | 'takeover';
  resourceType: string;
  resourceId: string;
  lockedBy?: string;
  lockedByEmail?: string;
}

// ── Constants ────────────────────────────────────────────────────

const LOCK_EVENT_CHANNEL = 'lock:events';

// ── Publish ──────────────────────────────────────────────────────

/**
 * Publish a lock event to Redis Pub/Sub.
 *
 * Best-effort — jika Redis tidak tersedia, event di-drop silently.
 * UI tetap mendapat update via polling fallback.
 */
export function publishLockEvent(event: LockEvent): void {
  const redis = getRedis();
  if (!redis) return;

  try {
    redis.publish(LOCK_EVENT_CHANNEL, JSON.stringify(event)).catch(() => {
      // Best-effort — polling fallback tetap jalan
    });
  } catch {
    // Best-effort
  }
}

// ── Subscribe (for SSE) ──────────────────────────────────────────

/**
 * Subscribe to lock events via Redis Pub/Sub.
 *
 * Returns an unsubscribe function. Hanya satu subscriber Redis global
 * yang dibuat — pesan didistribusikan ke semua callback via EventEmitter.
 * Jika Redis tidak tersedia, callback tidak pernah dipanggil.
 */

type LockEventHandler = (event: LockEvent) => void;

const listeners = new Set<LockEventHandler>();
let subscribed = false;

export function subscribeLockEvents(handler: LockEventHandler): () => void {
  listeners.add(handler);
  ensureSubscribed();
  return () => {
    listeners.delete(handler);
    // Tidak unsubscribe dari Redis channel — biarkan subscription tetap aktif.
    // Redis channel idle tidak makan resource berarti, dan ini mencegah
    // duplikasi handler 'message' jika ada cycle subscribe/unsubscribe.
  };
}

function ensureSubscribed() {
  if (subscribed) return;

  const redis = getRedis();
  if (!redis) return;

  redis.subscribe(LOCK_EVENT_CHANNEL, (err) => {
    if (err) return;
    subscribed = true;
  });

  redis.on('message', (_channel: string, message: string) => {
    if (_channel !== LOCK_EVENT_CHANNEL) return;
    try {
      const event = JSON.parse(message) as LockEvent;
      for (const handler of listeners) {
        try {
          handler(event);
        } catch {
          // handler error — jangan sampai satu listener matikan semua
        }
      }
    } catch {
      // invalid JSON — skip
    }
  });
}
