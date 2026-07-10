import { useState, useEffect, useMemo } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  getStatusLabel,
  getStatusColor,
} from '@specialist/shared';
import { Card, Grid, Skeleton, Badge, EmptyState } from '@specialist/ui';
import type { OrderStatus } from '@specialist/types';

// ── Types ──────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  fullName?: string;
  role: string;
}

interface MeResponse {
  user: UserProfile & { emailVerifiedAt: string | null };
}

interface OrderItem {
  id: string;
  bookingNumber: string;
  status: string;
  bookingDate: string;
  basePrice: string;
  finalPrice: string | null;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

const ACTIVE_STATUSES = new Set([
  'Pending Confirmation',
  'Confirmed',
  'Waiting Assignment',
  'Partner Assigned',
  'Partner Accepted',
  'On The Way',
  'Working',
]);

// Inline SVG icons (Lucide-compatible, zero JS)
const ICONS = {
  booking:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  tracking:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  whatsapp:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>',
  history:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>',
  orders:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2"/></svg>',
  address:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
} as const;

// Smaller variant for compact contexts (20px instead of 24px)
const ORDERS_ICON_SM = ICONS.orders.replace('width="24" height="24"', 'width="20" height="20"');

// ── Component ──────────────────────────────────────────────────

export function CustomerOverview() {
  const api = useMemo(() => createBrowserClient(), []);

  // State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [addressCount, setAddressCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meData, ordersData, addressData] = await Promise.all([
          api.get<MeResponse>('/api/v1/auth/me'),
          api.get<OrderItem[]>('/api/v1/bookings', { params: { limit: 50 } }),
          api.get<unknown[]>('/api/v1/addresses').catch(() => []),
        ]);

        if (cancelled) return;

        setUser(meData.user ?? null);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setAddressCount(Array.isArray(addressData) ? addressData.length : 0);
      } catch {
        // silent — fallbacks applied
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [api]);

  // Derived data
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.has(o.status));
  const completedOrders = orders.filter((o) => ['Completed', 'Paid', 'Closed'].includes(o.status));
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const greeting = getGreeting();
  const userName = user?.fullName?.split(' ')[0] ?? 'Pengguna';

  // ══════════════════════════════════════════════════════════════
  // LOADING STATE
  // ══════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="space-y-6">
        <Card padding="lg">
          <Skeleton variant="text" className="w-1/3" />
          <div className="mt-2">
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </Card>
        <Grid cols={4} gap={4}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="lg">
              <Skeleton variant="text" className="w-1/2" />
              <div className="mt-2">
                <Skeleton variant="heading" className="w-1/3 h-8" />
              </div>
            </Card>
          ))}
        </Grid>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // EMPTY STATE — first-time user with no orders
  // ══════════════════════════════════════════════════════════════
  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        {/* Welcome */}
        <Card padding="lg">
          <h2 className="text-h4 text-text-primary">
            {greeting}, {userName}
          </h2>
          <p className="mt-1 text-body text-text-secondary">
            Selamat datang di dashboard Spesialis. Saatnya memesan layanan profesional pertama Anda.
          </p>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <a
            href="/services"
            className="group flex flex-col items-center gap-3 rounded-xl border border-border-default bg-bg-surface p-6 text-center transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors duration-150 group-hover:bg-primary-100">
              <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS.booking }} />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Booking Baru</span>
          </a>
          <a
            href="/tracking"
            className="group flex flex-col items-center gap-3 rounded-xl border border-border-default bg-bg-surface p-6 text-center transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-50 text-accent-600 transition-colors duration-150 group-hover:bg-accent-100">
              <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS.tracking }} />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Lacak Pesanan</span>
          </a>
          <a
            href="/kontak"
            className="group flex flex-col items-center gap-3 rounded-xl border border-border-default bg-bg-surface p-6 text-center transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success-50 text-success-600 transition-colors duration-150 group-hover:bg-success-100">
              <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS.whatsapp }} />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Hubungi Admin</span>
          </a>
          <a
            href="/dashboard/customer/settings"
            className="group flex flex-col items-center gap-3 rounded-xl border border-border-default bg-bg-surface p-6 text-center transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 text-text-muted transition-colors duration-150 group-hover:bg-neutral-200">
              <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS.address }} />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Atur Profil</span>
          </a>
        </div>

        <EmptyState
          title="Belum ada pesanan"
          description="Pesan layanan profesional pertama Anda. Proses cepat, harga transparan, teknisi terpercaya."
          action={
            <a
              href="/services"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-500 px-5 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              Booking Sekarang
            </a>
          }
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // MAIN DASHBOARD — user with orders
  // ══════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Welcome Card ──────────────────────────────────────── */}
      <Card padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-h4 text-text-primary">
              {greeting}, {userName}
            </h2>
            <p className="mt-1 text-body text-text-secondary">
              Berikut ringkasan aktivitas Anda di Spesialis.
            </p>
          </div>
          <a
            href="/services"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary-500 px-5 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            + Booking Baru
          </a>
        </div>
      </Card>

      {/* ── Active Order (if any) ─────────────────────────────── */}
      {activeOrders.length > 0 && (
        <div>
          <h3 className="mb-4 text-body font-semibold text-text-primary">Pesanan Aktif</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeOrders.slice(0, 4).map((order) => (
              <a
                key={order.id}
                href={`/tracking?q=${order.bookingNumber}`}
                className="group flex items-center gap-4 rounded-xl border border-primary-200 bg-bg-surface p-4 transition-all duration-150 ease-out hover:border-primary-400 hover:shadow-sm"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
                  aria-hidden="true"
                >
                  <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: ORDERS_ICON_SM }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-semibold text-text-primary group-hover:text-primary-600 transition-colors duration-150">
                    {order.bookingNumber}
                  </p>
                  <p className="mt-0.5 text-caption text-text-muted">
                    {getStatusLabel(order.status as OrderStatus)}
                    {' · '}
                    {order.bookingDate ? formatDate(order.bookingDate) : '-'}
                  </p>
                </div>
                <Badge
                  variant={
                    getStatusColor(order.status as OrderStatus) as
                      'default' | 'success' | 'warning' | 'danger' | 'info'
                  }
                >
                  {getStatusLabel(order.status as OrderStatus)}
                </Badge>
              </a>
            ))}
          </div>
          {activeOrders.length > 4 && (
            <div className="mt-3 text-center">
              <a
                href="/dashboard/customer/orders"
                className="text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-150"
              >
                Lihat semua ({activeOrders.length} pesanan aktif)
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <Grid cols={4} gap={4}>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Pesanan Aktif</p>
          <p className="text-h3 font-bold text-primary-600">{activeOrders.length}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Selesai</p>
          <p className="text-h3 font-bold text-success-600">{completedOrders.length}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Total Pesanan</p>
          <p className="text-h3 font-bold text-text-primary">{orders.length}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Alamat Tersimpan</p>
          <p className="text-h3 font-bold text-text-primary">{addressCount}</p>
        </Card>
      </Grid>

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <Card padding="lg">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <a
            href="/services"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.booking }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Booking Baru</span>
          </a>
          <a
            href="/tracking"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.tracking }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Lacak Pesanan</span>
          </a>
          <a
            href="/kontak"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.whatsapp }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Hubungi Admin</span>
          </a>
          <a
            href="/dashboard/customer/orders"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-text-muted">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.history }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Riwayat</span>
          </a>
        </div>
      </Card>

      {/* ── Recent Orders ──────────────────────────────────────── */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-body font-semibold text-text-primary">Pesanan Terbaru</h3>
          {orders.length > 5 && (
            <a
              href="/dashboard/customer/orders"
              className="text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-150"
            >
              Lihat Semua
            </a>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-6 text-center text-body-sm text-text-muted">Belum ada pesanan</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-body-sm">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="px-3 py-2.5 text-left font-medium text-text-muted">
                      No. Booking
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium text-text-muted">Status</th>
                    <th className="px-3 py-2.5 text-left font-medium text-text-muted">Tanggal</th>
                    <th className="px-3 py-2.5 text-right font-medium text-text-muted">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border-default last:border-b-0 hover:bg-neutral-50/80 transition-colors duration-100"
                    >
                      <td className="px-3 py-3 font-medium text-text-primary">
                        <a
                          href={`/tracking?q=${order.bookingNumber}`}
                          className="hover:text-primary-600 transition-colors duration-150"
                        >
                          {order.bookingNumber}
                        </a>
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          variant={
                            getStatusColor(order.status as OrderStatus) as
                              'default' | 'success' | 'warning' | 'danger' | 'info'
                          }
                        >
                          {getStatusLabel(order.status as OrderStatus)}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-text-secondary">
                        {order.bookingDate ? formatDate(order.bookingDate) : '-'}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-text-primary">
                        {formatCurrency(Number(order.basePrice))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
              {recentOrders.map((order) => (
                <a
                  key={order.id}
                  href={`/tracking?q=${order.bookingNumber}`}
                  className="block rounded-lg border border-border-default bg-bg-page p-4 transition-all duration-150 ease-out hover:border-primary-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-semibold text-text-primary">
                      {order.bookingNumber}
                    </span>
                    <Badge
                      variant={
                        getStatusColor(order.status as OrderStatus) as
                          'default' | 'success' | 'warning' | 'danger' | 'info'
                      }
                    >
                      {getStatusLabel(order.status as OrderStatus)}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-caption text-text-muted">
                    <span>{order.bookingDate ? formatDate(order.bookingDate) : '-'}</span>
                    <span className="font-semibold text-text-primary">
                      {formatCurrency(Number(order.basePrice))}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
