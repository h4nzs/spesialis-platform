import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient, formatDate } from '@specialist/shared';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const api = createBrowserClient();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await api.get<{ unread: number }>('/api/v1/notifications/unread-count');
      setUnread(data?.unread ?? 0);
    } catch {
      // silent
    }
  }, []);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ data: NotificationItem[] }>('/api/v1/notifications', {
        params: { limit: 5 },
      });
      const items = Array.isArray(data) ? data : (data?.data ?? []);
      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) fetchRecent();
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleMarkRead(id: string) {
    try {
      await api.patch('/api/v1/notifications/read', {
        body: { notificationIds: [id] },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }

  const unreadItems = notifications.filter((n) => !n.isRead);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-text-muted transition-colors hover:bg-background hover:text-text"
        aria-label={`Notifikasi${unread > 0 ? ` (${unread} belum dibaca)` : ''}`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-text">Notifikasi</span>
            {unreadItems.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  const ids = unreadItems.map((n) => n.id);
                  try {
                    await api.patch('/api/v1/notifications/read', {
                      body: { notificationIds: ids },
                    });
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                    setUnread(0);
                  } catch {
                    // silent
                  }
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">Memuat...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-text-muted">Belum ada notifikasi</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={`w-full border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-background ${
                    !n.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-sm ${
                        n.isRead ? 'text-text-muted' : 'font-medium text-text'
                      }`}
                    >
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  {n.message && (
                    <p className="mt-0.5 text-xs text-text-muted line-clamp-2">{n.message}</p>
                  )}
                  <p className="mt-1 text-[10px] text-text-muted">{formatDate(n.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
