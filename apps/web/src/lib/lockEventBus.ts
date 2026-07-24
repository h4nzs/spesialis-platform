/**
 * Global lock event bus — menghubungkan SSE (Server-Sent Events) backend
 * dengan semua instance useLockPolling di frontend.
 *
 * Hanya SATU koneksi EventSource global untuk seluruh app, didistribusikan
 * ke listener via simple callback array.
 *
 * Jika SSE gagal / Redis tidak tersedia di backend, koneksi drop silently
 * dan setiap useLockPolling tetap mendapat update via polling fallback.
 */

// ── Types ────────────────────────────────────────────────────────

export interface LockEvent {
  type: 'acquired' | 'released' | 'takeover';
  resourceType: string;
  resourceId: string;
  lockedBy?: string;
  lockedByEmail?: string;
}

type LockEventHandler = (event: LockEvent) => void;

// ── Module-level state ───────────────────────────────────────────

let eventSource: EventSource | null = null;
const listeners = new Set<LockEventHandler>();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// ── Connection management ───────────────────────────────────────

function connect() {
  if (typeof EventSource === 'undefined') return;
  if (eventSource?.readyState === EventSource.OPEN) return;

  try {
    eventSource?.close();
  } catch {
    // ignore
  }

  eventSource = new EventSource('/api/v1/admin/locks/events');

  eventSource.addEventListener('connected', () => {
    reconnectAttempts = 0; // Reset pada koneksi sukses
  });

  eventSource.addEventListener('lock', (event: MessageEvent) => {
    try {
      const lockEvent = JSON.parse(event.data) as LockEvent;
      for (const handler of listeners) {
        try {
          handler(lockEvent);
        } catch {
          // handler error — jangan sampai satu listener matikan semua
        }
      }
    } catch {
      // invalid JSON — skip
    }
  });

  eventSource.onerror = () => {
    // EventSource auto-reconnect built-in — kita batasi percobaan ulang
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      disconnect();
    }
  };
}

function disconnect() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Subscribe ke lock events real-time.
 * Bisa dipanggil berkali-kali dari komponen yang berbeda —
 * hanya SATU koneksi EventSource global yang dibuat.
 */
export function subscribeLockEvents(handler: LockEventHandler): () => void {
  listeners.add(handler);

  if (listeners.size === 1) {
    // First listener — start connection
    connect();
  }

  return () => {
    listeners.delete(handler);

    if (listeners.size === 0) {
      // No more listeners — close connection
      disconnect();
    }
  };
}
