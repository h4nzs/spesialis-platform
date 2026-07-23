/**
 * Shared takeover button constants and utilities.
 *
 * Digunakan oleh:
 * - React LockBanner (apps/web/src/components/dashboard/admin/LockBanner.tsx)
 * - <content-lock-widget> Web Component (packages/ui/src/components/content-lock-widget.ts)
 *
 * Konsolidasi label teks, aria attributes, dan pola async handler
 * untuk mencegah duplikasi.
 */

// ─── Label texts ───────────────────────────────────────────────

export const TAKEOVER_BUTTON_LABELS = {
  /** Default: tombol siap diklik */
  default: 'Ambil Alih',
  /** Loading: sedang memproses takeover */
  loading: 'Mengambil alih…',
} as const;

// ─── ARIA attributes ───────────────────────────────────────────

export const TAKEOVER_BUTTON_ARIA = {
  loading: 'Sedang mengambil alih kunci…',
} as const;

// ─── Types ─────────────────────────────────────────────────────

/** Signature of the takeover action (receives no args, returns void or Promise<void>) */
export type TakeoverAction = () => void | Promise<void>;

/**
 * State helpers for components that manage takeover loading.
 * Both React (useState) and Web Component (class field) use the same shape.
 */
export interface TakeoverLoadingState {
  loading: boolean;
  setLoading: (v: boolean) => void;
}

// ─── Async click handler factory ──────────────────────────────

/**
 * Create an async click handler that:
 * 1. Sets loading=true
 * 2. Calls the takeover action
 * 3. Resets loading=false ONLY on failure (success usually unmounts the banner)
 *
 * @param action - The takeover callback (synchronous or async)
 * @param setLoading - State setter for loading flag
 * @returns Async click handler
 *
 * @example React
 * ```tsx
 * onClick={createTakeoverHandler(onTakeover, setTakeoverLoading)}
 * ```
 *
 * @example Web Component
 * ```ts
 * const handler = createTakeoverHandler(() => this.takeoverLock(), (v) => { this.takeoverLoading = v; this.render(); });
 * btn.addEventListener('click', handler);
 * ```
 */
export function createTakeoverHandler(
  action: TakeoverAction,
  setLoading: (v: boolean) => void,
): () => Promise<void> {
  return async () => {
    setLoading(true);
    try {
      await action();
    } catch {
      // Takeover gagal — reset loading agar user bisa coba lagi
      setLoading(false);
    }
  };
}
