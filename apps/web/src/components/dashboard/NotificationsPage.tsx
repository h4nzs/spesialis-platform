import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, formatDate } from '@ahlipanggilan/shared';
import { Button, EmptyState, Spinner } from '@ahlipanggilan/ui';

const POLL_INTERVAL = 30_000;
const NOTIF_UPDATED_EVENT = 'notifications:updated';

// ── Types ─────────────────────────────────────────────────────

interface NotificationItem {
  id: string;
  type: string;
  channel: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

// ── Notification type icon + label ────────────────────────────

const NOTIF_ICONS: Record<string, string> = {
  booking: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  payment: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z',
  partner: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
  complaint:
    'M12 9v4m0 4h.01M21.73 18l-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
  review:
    'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2 2 0 0 0 1.54 1.08l5.16.756a.53.53 0 0 1 .294.904l-3.736 3.638a2 2 0 0 0-.575 1.77l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2 2 0 0 0-1.862 0L6.395 18.8a.53.53 0 0 1-.771-.56l.882-5.14a2 2 0 0 0-.575-1.77L2.195 7.714a.53.53 0 0 1 .294-.904l5.16-.756a2 2 0 0 0 1.54-1.08l2.31-4.68Z',
  account:
    'M12 15c3.75 0 7.2-1.5 9.6-4.2M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z',
  system: 'M12 8v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
};

const NOTIF_COLORS: Record<string, string> = {
  booking: 'bg-primary-50 text-primary-600',
  payment: 'bg-success-50 text-success-600',
  partner: 'bg-accent-50 text-accent-600',
  complaint: 'bg-danger-50 text-danger-600',
  review: 'bg-warning-50 text-warning-600',
  account: 'bg-info-50 text-info-600',
  system: 'bg-neutral-100 text-neutral-600',
};

function getNotifType(type: string): string {
  const base = type.split('.')[0]!.toLowerCase();
  if (NOTIF_ICONS[base]) return base;
  return 'system';
}

// ── Pagination Component ──────────────────────────────────────

function Pagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('…');
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('…');
    pages.push(totalPages);
  }

  const from = (page - 1) * 20 + 1;
  const to = Math.min(page * 20, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
      <p className="text-body-sm text-text-muted">
        Menampilkan {from}–{to} dari {totalItems} notifikasi
      </p>
      <nav className="flex items-center gap-1" aria-label="Navigasi halaman">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-body-sm text-text-secondary transition-colors duration-150 hover:bg-neutral-100 hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
          aria-label="Halaman sebelumnya"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {pages.map((p, idx) =>
          p === '…' ? (
            <span
              key={`e${idx}`}
              className="inline-flex h-8 w-8 items-center justify-center text-body-sm text-text-muted"
            >
              …
            </span>
          ) : (
            <button
              key={p as number}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-body-sm font-medium transition-colors duration-150 ${
                p === page
                  ? 'bg-primary-500 text-white'
                  : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
              }`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p as number}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-body-sm text-text-secondary transition-colors duration-150 hover:bg-neutral-100 hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
          aria-label="Halaman selanjutnya"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────

export function NotificationsPage() {
  const api = useMemo(() => createBrowserClient(), []);

  // State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // ── Fetch unread count ───────────────────────────────────────
  const fetchUnread = useCallback(async () => {
    try {
      const data = await api.get<{ unread: number }>('/api/v1/notifications/unread-count');
      setUnreadCount(data?.unread ?? 0);
    } catch {
      // silent
    }
  }, [api]);

  // ── Fetch notifications ──────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (filter === 'unread') params.isRead = 'false';

      const result = await api.getPaginated<NotificationItem>('/api/v1/notifications', { params });
      setNotifications(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.total);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [api, page, filter]);

  // ── Broadcast helper: beri tahu komponen notifikasi lain ────
  function broadcastUpdate() {
    window.dispatchEvent(new CustomEvent(NOTIF_UPDATED_EVENT));
  }

  // ── Initial load ─────────────────────────────────────────────
  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ── Periodic polling untuk halaman notifikasi ────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnread();
      loadNotifications();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnread, loadNotifications]);

  // ── Visibilty change: refresh saat tab aktif kembali ─────────
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        fetchUnread();
        loadNotifications();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchUnread, loadNotifications]);

  // ── Window focus: refresh saat user kembali ke jendela ───────
  useEffect(() => {
    function handleFocus() {
      fetchUnread();
      loadNotifications();
    }
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUnread, loadNotifications]);

  // ── Mark single as read ──────────────────────────────────────
  async function handleMarkRead(id: string) {
    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      await api.patch('/api/v1/notifications/read', {
        body: { notificationIds: [id] },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      await fetchUnread();
      broadcastUpdate();
    } catch {
      // silent
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // ── Mark all as read ─────────────────────────────────────────
  async function handleMarkAllRead() {
    try {
      await api.post('/api/v1/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      broadcastUpdate();
    } catch {
      // silent
    }
  }

  // ── Filter change ────────────────────────────────────────────
  function handleFilterChange(newFilter: 'all' | 'unread') {
    setFilter(newFilter);
    setPage(1);
  }

  // ── Stats ────────────────────────────────────────────────────

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-h2 text-text-primary">Notifikasi</h2>
          <p className="mt-1 text-body-sm text-text-secondary">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="ghost" onClick={handleMarkAllRead}>
              Tandai Semua Dibaca
            </Button>
          )}
        </div>
      </div>

      {/* ── Filter tabs ──────────────────────────────── */}
      <div className="flex gap-1 rounded-lg border border-border-default bg-bg-page p-1 w-fit">
        <button
          type="button"
          onClick={() => handleFilterChange('all')}
          className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Semua
        </button>
        <button
          type="button"
          onClick={() => handleFilterChange('unread')}
          className={`cursor-pointer rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-primary text-white shadow-xs'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Belum Dibaca
          {unreadCount > 0 && (
            <span className="ml-1.5 rounded-full bg-danger-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Summary cards ───────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-caption font-medium text-text-muted">Total</p>
          <p className="text-h3 font-bold text-text-primary">{totalItems}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-caption font-medium text-text-muted">Belum Dibaca</p>
          <p className="text-h3 font-bold text-primary">{unreadCount}</p>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-4 space-y-1">
          <p className="text-caption font-medium text-text-muted">Sudah Dibaca</p>
          <p className="text-h3 font-bold text-text-secondary">{totalItems - unreadCount}</p>
        </div>
      </div>

      {/* ── Notifications List ──────────────────────── */}
      <div className="rounded-xl border border-border-default bg-bg-surface">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title={filter === 'unread' ? 'Semua notifikasi sudah dibaca' : 'Belum ada notifikasi'}
              description={
                filter === 'unread'
                  ? 'Tidak ada notifikasi yang belum dibaca.'
                  : 'Notifikasi akan muncul di sini saat ada aktivitas terkait akun Anda.'
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {notifications.map((n) => {
              const notifType = getNotifType(n.type);
              const iconPath = NOTIF_ICONS[notifType] ?? NOTIF_ICONS.system!;
              const colorClass = NOTIF_COLORS[notifType] ?? NOTIF_COLORS.system!;
              const isUpdating = updatingIds.has(n.id);

              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                    !n.isRead ? 'bg-primary/5' : ''
                  } ${isUpdating ? 'opacity-60' : ''}`}
                >
                  {/* Type icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={iconPath} />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p
                          className={`text-body-sm ${
                            n.isRead ? 'text-text-primary' : 'font-semibold text-text-primary'
                          }`}
                        >
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="mt-0.5 text-body-sm text-text-secondary">{n.message}</p>
                        )}
                      </div>

                      {/* Unread dot */}
                      {!n.isRead && (
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-caption text-text-muted">
                        {formatDate(n.createdAt)}
                      </span>
                      <span className="text-caption text-text-muted uppercase">{n.type}</span>
                    </div>
                  </div>

                  {/* Mark as read button */}
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      disabled={isUpdating}
                      className="shrink-0 rounded-md px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-50 disabled:opacity-50"
                    >
                      {isUpdating ? '...' : 'Tandai Dibaca'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────── */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />
    </div>
  );
}
