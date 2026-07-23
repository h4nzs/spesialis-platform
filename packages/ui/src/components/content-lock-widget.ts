/**
 * <content-lock-widget> — Web Component for content lock lifecycle.
 *
 * Handles acquire, heartbeat, and release of editing locks on CMS resources
 * (articles, CMS pages, FAQ) without any framework dependency.
 *
 * Usage:
 * ```html
 * <content-lock-widget
 *   resource-type="article"
 *   resource-id="uuid-here"
 *   resource-name="Artikel"
 * >
 *   <!-- Editor content here — visible when lock is held by current user -->
 * </content-lock-widget>
 * ```
 *
 * Attributes:
 *   resource-type     — 'article' | 'cms_page' | 'faq'
 *   resource-id       — UUID of the resource being edited
 *   resource-name     — Display name (e.g. "Artikel", "Halaman", "FAQ")
 *   api-base          — API base URL (default: '/api/v1')
 *   heartbeat-interval— ms between heartbeats (default: 30000)
 *   takeoverable      — Show "Ambil Alih" button (default: 'true')
 *
 * Events (bubbles, composed):
 *   lock-acquired    — Lock successfully acquired
 *   lock-conflict    — Another user holds the lock { lockedByEmail }
 *   lock-lost        — Lock taken over by another user (heartbeat returned 409)
 *   lock-released    — Lock successfully released
 *   takeover-started — Takeover action initiated
 *   takeover-complete— Takeover succeeded
 *   lock-error       — API error occurred { message }
 *
 * CSS Shadow Parts:
 *   ::part(banner)        — Lock status banner container
 *   ::part(takeover-btn)  — "Ambil Alih" button
 *
 * Registration:
 * ```ts
 * import { defineContentLockWidget } from '@ahlipanggilan/ui';
 * defineContentLockWidget(); // registers <content-lock-widget>
 * // or use a custom tag name:
 * // defineContentLockWidget('my-lock-widget');
 * ```
 */

// ─── Imports ───────────────────────────────────────────────────
import {
  TAKEOVER_BUTTON_LABELS,
  TAKEOVER_BUTTON_ARIA,
  createTakeoverHandler,
} from '../shared/takeover-button.ts';

// ─── Types ──────────────────────────────────────────────────────

type LockStatus = 'loading' | 'locked-by-me' | 'locked-by-other' | 'lock-lost' | 'error';

interface LockState {
  status: LockStatus;
  lockedByEmail?: string;
  error?: string;
}

// ─── CSS ────────────────────────────────────────────────────────

const STYLES = `
  :host { display: contents; }

  .lock-banner {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    animation: lockFadeIn 0.2s ease-out;
  }

  @keyframes lockFadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .lock-banner--warning {
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #92400e;
  }
  .lock-banner--danger {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }
  .lock-banner--info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
  }
  .lock-banner--loading {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    color: #6b7280;
  }

  .lock-banner__content { flex: 1; min-width: 0; }
  .lock-banner__title { font-weight: 600; margin: 0; font-size: 14px; }
  .lock-banner__description { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
  .lock-banner__actions { display: flex; gap: 8px; flex-shrink: 0; align-items: center; }

  .lock-banner__btn {
    padding: 6px 14px;
    border-radius: 6px;
    border: 1px solid transparent;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }
  .lock-banner__btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .lock-banner__btn--primary {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }
  .lock-banner__btn--primary:not(:disabled):hover { background: #1d4ed8; }
  .lock-banner__btn--secondary {
    background: white;
    color: #374151;
    border-color: #d1d5db;
  }
  .lock-banner__btn--secondary:not(:disabled):hover { background: #f9fafb; }

  .lock-icon { width: 20px; height: 20px; flex-shrink: 0; margin-top: 2px; }
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: lockSpin 0.6s linear infinite;
    flex-shrink: 0;
  }
  @keyframes lockSpin { to { transform: rotate(360deg); } }
`;

// ─── SVG Icons (inline) ─────────────────────────────────────────

const LOCK_ICON = `<svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;

const LOCK_LOST_ICON = `<svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

const ERROR_ICON = `<svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

// ─── Component ──────────────────────────────────────────────────

class ContentLockWidget extends HTMLElement {
  static observedAttributes = ['resource-type', 'resource-id', 'resource-name'] as const;

  private state: LockState = { status: 'loading' };
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private readonly shadow: ShadowRoot;
  private lockedByMe = false;
  private takeoverLoading = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  // ─── Attribute getters ──────────────────────────────────────

  private get resourceType(): string {
    return this.getAttribute('resource-type')?.trim() || '';
  }
  private get resourceId(): string {
    return this.getAttribute('resource-id')?.trim() || '';
  }
  private get resourceName(): string {
    return this.getAttribute('resource-name')?.trim() || 'Sumber daya';
  }
  private get apiBase(): string {
    return this.getAttribute('api-base')?.replace(/\/+$/, '') || '/api/v1';
  }
  private get heartbeatInterval(): number {
    const val = parseInt(this.getAttribute('heartbeat-interval') || '30000', 10);
    return Number.isFinite(val) && val >= 5000 ? val : 30000;
  }
  private get takeoverable(): boolean {
    return this.getAttribute('takeoverable') !== 'false';
  }

  // ─── Lifecycle ──────────────────────────────────────────────

  connectedCallback(): void {
    // Event delegation for takeover button (lives in shadow DOM)
    this.shadow.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('takeover-btn')) {
        e.preventDefault();
        e.stopPropagation();
        if (this.takeoverLoading) return;
        const handler = createTakeoverHandler(
          () => this.takeoverLock(),
          (v: boolean) => {
            this.takeoverLoading = v;
            this.render();
          },
        );
        void handler();
      }
    });

    // Defer to microtask so attributes are set before we start
    void Promise.resolve().then(() => {
      if (!this.isConnected) return;
      this.render();
      void this.acquireLock();
      this.startHeartbeat();
    });
  }

  disconnectedCallback(): void {
    this.stopHeartbeat();
    void this.releaseLock();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (oldValue === newValue) return;
    if (name === 'resource-type' || name === 'resource-id') {
      void this.onResourceChanged();
    }
  }

  private async onResourceChanged(): Promise<void> {
    this.stopHeartbeat();
    await this.releaseLock();
    if (this.resourceType && this.resourceId) {
      this.setState({ status: 'loading' });
      await this.acquireLock();
      this.startHeartbeat();
    }
  }

  // ─── API calls ──────────────────────────────────────────────

  /**
   * Acquire a lock on the resource.
   * POST /api/v1/admin/locks/acquire
   */
  async acquireLock(): Promise<void> {
    if (!this.resourceType || !this.resourceId) {
      this.setState({
        status: 'error',
        error: 'Attribute resource-type dan resource-id wajib diisi',
      });
      return;
    }

    try {
      const res = await fetch(`${this.apiBase}/admin/locks/acquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType: this.resourceType, resourceId: this.resourceId }),
        credentials: 'include',
      });

      if (res.ok) {
        this.lockedByMe = true;
        this.setState({ status: 'locked-by-me' });
        this.dispatchEvent(new CustomEvent('lock-acquired', { bubbles: true, composed: true }));
        return;
      }

      if (res.status === 409) {
        const body: { lockedByEmail?: string } = await res.json().catch(() => ({}));
        this.lockedByMe = false;
        this.setState({
          status: 'locked-by-other',
          lockedByEmail: body.lockedByEmail || 'Unknown',
        });
        this.dispatchEvent(
          new CustomEvent('lock-conflict', {
            bubbles: true,
            composed: true,
            detail: { lockedByEmail: body.lockedByEmail || 'Unknown' },
          }),
        );
        return;
      }

      // Non-409 error
      this.setState({ status: 'error', error: `Gagal mengunci: ${res.status}` });
      this.dispatchEvent(
        new CustomEvent('lock-error', {
          bubbles: true,
          composed: true,
          detail: { message: `Gagal mengunci: ${res.status}` },
        }),
      );
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      this.setState({ status: 'error', error: 'Gagal terhubung ke server' });
      this.dispatchEvent(
        new CustomEvent('lock-error', {
          bubbles: true,
          composed: true,
          detail: { message: 'Gagal terhubung ke server' },
        }),
      );
    }
  }

  /**
   * Release the current lock.
   * POST /api/v1/admin/locks/release
   */
  async releaseLock(): Promise<void> {
    if (!this.lockedByMe || !this.resourceType || !this.resourceId) return;

    this.lockedByMe = false;
    try {
      const res = await fetch(`${this.apiBase}/admin/locks/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType: this.resourceType, resourceId: this.resourceId }),
        credentials: 'include',
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        this.dispatchEvent(new CustomEvent('lock-released', { bubbles: true, composed: true }));
      }
    } catch {
      // Best-effort — the lock will expire via TTL
    }
  }

  /**
   * Force-takeover the lock from another user.
   * POST /api/v1/admin/locks/takeover
   */
  async takeoverLock(): Promise<void> {
    if (!this.resourceType || !this.resourceId) return;

    this.dispatchEvent(new CustomEvent('takeover-started', { bubbles: true, composed: true }));

    try {
      const res = await fetch(`${this.apiBase}/admin/locks/takeover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType: this.resourceType, resourceId: this.resourceId }),
        credentials: 'include',
      });

      if (res.ok) {
        this.lockedByMe = true;
        this.setState({ status: 'locked-by-me' });
        this.dispatchEvent(new CustomEvent('takeover-complete', { bubbles: true, composed: true }));
      } else {
        this.setState({ status: 'error', error: 'Gagal mengambil alih kunci' });
        this.dispatchEvent(
          new CustomEvent('lock-error', {
            bubbles: true,
            composed: true,
            detail: { message: 'Gagal mengambil alih kunci' },
          }),
        );
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      this.setState({ status: 'error', error: 'Gagal mengambil alih kunci' });
      this.dispatchEvent(
        new CustomEvent('lock-error', {
          bubbles: true,
          composed: true,
          detail: { message: 'Gagal mengambil alih kunci' },
        }),
      );
    }
  }

  // ─── Heartbeat ──────────────────────────────────────────────

  private startHeartbeat(): void {
    this.stopHeartbeat();
    if (!this.resourceType || !this.resourceId) return;

    this.heartbeatTimer = setInterval(() => {
      if (!this.lockedByMe || !this.resourceType || !this.resourceId) return;

      fetch(`${this.apiBase}/admin/locks/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceType: this.resourceType, resourceId: this.resourceId }),
        credentials: 'include',
      })
        .catch(() => {
          // Network errors are non-critical — next heartbeat will retry
        })
        .then(async (res) => {
          if (!res) return;
          if (res.status === 409) {
            this.lockedByMe = false;
            this.setState({ status: 'lock-lost' });
            this.dispatchEvent(new CustomEvent('lock-lost', { bubbles: true, composed: true }));
          }
        });
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ─── State & Render ─────────────────────────────────────────

  private setState(next: LockState): void {
    this.state = next;
    this.render();
  }

  private render(): void {
    this.shadow.innerHTML = `<style>${STYLES}</style>${this.renderContent()}`;
  }

  private renderContent(): string {
    const s = this.state;

    switch (s.status) {
      case 'loading':
        return `
          <div class="lock-banner lock-banner--loading" role="status" aria-live="polite">
            <div class="spinner"></div>
            <div class="lock-banner__content">
              <p class="lock-banner__title">Memeriksa status kunci…</p>
            </div>
          </div>
        `;

      case 'locked-by-me':
        // Slot is visible — host page renders the editor within
        return '<slot></slot>';

      case 'locked-by-other':
        return `
          <div class="lock-banner lock-banner--warning" part="banner" role="alert" aria-live="assertive" data-testid="lock-banner">
            ${LOCK_ICON}
            <div class="lock-banner__content">
              <p class="lock-banner__title">${this.escapeHtml(this.resourceName)} sedang diedit oleh <strong>${this.escapeHtml(s.lockedByEmail || 'Unknown')}</strong></p>
              <p class="lock-banner__description">Anda hanya dapat melihat, tidak dapat menyimpan perubahan.</p>
            </div>
            ${
              this.takeoverable
                ? `
              <div class="lock-banner__actions">
                <button class="lock-banner__btn lock-banner__btn--primary takeover-btn" part="takeover-btn" ${this.takeoverLoading ? 'disabled aria-label="' + TAKEOVER_BUTTON_ARIA.loading + '"' : ''}>
                  ${this.takeoverLoading ? TAKEOVER_BUTTON_LABELS.loading : TAKEOVER_BUTTON_LABELS.default}
                </button>
              </div>
            `
                : ''
            }
          </div>
        `;

      case 'lock-lost':
        return `
          <div class="lock-banner lock-banner--danger" part="banner" role="alert" aria-live="assertive" data-testid="lock-banner-lost">
            ${LOCK_LOST_ICON}
            <div class="lock-banner__content">
              <p class="lock-banner__title">Kunci telah diambil alih oleh pengguna lain</p>
              <p class="lock-banner__description">Salin perubahan Anda dan mulai ulang halaman.</p>
            </div>
          </div>
        `;

      case 'error':
        return `
          <div class="lock-banner lock-banner--danger" role="alert" aria-live="assertive">
            ${ERROR_ICON}
            <div class="lock-banner__content">
              <p class="lock-banner__title">${this.escapeHtml(s.error || 'Terjadi kesalahan')}</p>
            </div>
          </div>
        `;

      default:
        return '';
    }
  }

  // ─── Utility ────────────────────────────────────────────────

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// ─── Registration ───────────────────────────────────────────────

/**
 * Register the `<content-lock-widget>` custom element.
 * Call once at app entry point (or lazy-load on editor pages).
 *
 * @param tag - Custom element tag name (default: 'content-lock-widget')
 */
export function defineContentLockWidget(tag = 'content-lock-widget'): void {
  if (!customElements.get(tag)) {
    customElements.define(tag, ContentLockWidget);
  }
}

export { ContentLockWidget };
export type { LockStatus, LockState };
