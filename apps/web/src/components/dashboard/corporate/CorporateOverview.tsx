import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createBrowserClient,
  formatCurrency,
  formatDate,
  formatDateRange,
  isExpiringSoon,
  getInvoiceBadge,
  getStatusLabel,
  getStatusColor,
} from '@specialist/shared';
import { Card, Grid, Skeleton, Badge, EmptyState } from '@specialist/ui';
import type { OrderStatus } from '@specialist/types';

// ── Types ──────────────────────────────────────────────────────

interface CompanyProfile {
  id: string;
  companyName: string;
  status: string;
  employeeCount: number | null;
  legalName?: string | null;
  email?: string;
  phone?: string | null;
  taxNumber?: string | null;
}

interface BranchItem {
  id: string;
  name: string;
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

interface ContractItem {
  id: string;
  companyId: string;
  contractNumber: string;
  startDate: string;
  endDate: string | null;
  status: string;
  slaResponseHours: number | null;
  slaResolutionHours: number | null;
  notes: string | null;
  createdAt: string;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  amount: string;
  status: string;
  dueDate: string | null;
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

const INVOICE_OUTSTANDING = new Set(['Draft', 'Issued', 'Overdue']);

// Inline SVG icons (Lucide-compatible, zero JS)
const ICONS = {
  building:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  orders:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2"/></svg>',
  invoice:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2 1Z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>',
  whatsapp:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>',
  check:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  wrench:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
} as const;

// Smaller icon variants
const ORDERS_ICON_SM = ICONS.orders.replace('width="24" height="24"', 'width="20" height="20"');

// ── Component ──────────────────────────────────────────────────

export function CorporateOverview() {
  const api = useMemo(() => createBrowserClient(), []);

  // State
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const profileData = (await api.get('/api/v1/companies/me')) as CompanyProfile | null;
      if (!profileData) return;
      setProfile(profileData);

      const [ordersData, branchesData, contractsData, invoicesData] = await Promise.all([
        api.get<OrderItem[]>('/api/v1/bookings').catch(() => []),
        api.get<BranchItem[]>(`/api/v1/companies/${profileData.id}/branches`).catch(() => []),
        api.get<ContractItem[]>('/api/v1/contracts/me').catch(() => []),
        api.get<InvoiceItem[]>('/api/v1/invoices').catch(() => []),
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setContracts(Array.isArray(contractsData) ? contractsData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived data
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.has(o.status));
  const completedOrders = orders.filter((o) => ['Completed', 'Paid', 'Closed'].includes(o.status));

  // Orders completed this month
  const now = new Date();
  const thisMonthOrders = completedOrders.filter((o) => {
    const d = new Date(o.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const activeContracts = contracts.filter((c) => ['Active', 'active'].includes(c.status));

  const outstandingInvoices = invoices.filter((inv) => INVOICE_OUTSTANDING.has(inv.status));

  const activeMaintenance = orders.filter((o) => ACTIVE_STATUSES.has(o.status)).slice(0, 4);

  const recentCompleted = completedOrders
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const greeting = getGreeting();
  const companyName = profile?.companyName ?? 'Perusahaan';

  // ══════════════════════════════════════════════════════════════
  // LOADING STATE
  // ══════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="space-y-6">
        <Card padding="lg">
          <Skeleton variant="text" className="w-1/3" />
          <div className="mt-2">
            <Skeleton variant="text" className="w-1/4" />
          </div>
        </Card>
        <Grid cols={3} gap={4}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
  // ERROR STATE
  // ══════════════════════════════════════════════════════════════
  if (!profile) {
    return (
      <EmptyState
        title="Gagal memuat data perusahaan"
        description="Silakan coba lagi atau hubungi admin."
        action={
          <a
            href="/kontak"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-500 px-5 text-body-sm font-semibold text-white"
          >
            Hubungi Admin
          </a>
        }
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ══════════════════════════════════════════════════════════════

  const firstContract = activeContracts[0] ?? null;

  return (
    <div className="space-y-6">
      {/* ── Welcome Card ──────────────────────────────────────── */}
      <Card padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-h4 text-text-primary">
              {greeting}, {companyName}
            </h2>
            <p className="mt-1 text-body text-text-secondary">
              Dashboard perusahaan — pantau seluruh aktivitas maintenance dan layanan.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-bg-surface px-3 py-1 text-caption font-medium text-text-secondary">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  profile.status === 'Verified' || profile.status === 'active'
                    ? 'bg-success-500'
                    : 'bg-warning-500'
                }`}
                aria-hidden="true"
              />
              {profile.status === 'Verified' || profile.status === 'active'
                ? 'Aktif'
                : profile.status}
            </span>
            <a
              href="/dashboard/corporate/orders"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary-500 px-4 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              + Request Baru
            </a>
          </div>
        </div>
      </Card>

      {/* ── Company Summary (6 widgets) ────────────────────────── */}
      <Grid cols={3} gap={4}>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Total Cabang</p>
          <p className="text-h3 font-bold text-primary-600">{branches.length}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Pesanan Aktif</p>
          <p className="text-h3 font-bold text-primary-600">{activeOrders.length}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Selesai Bulan Ini</p>
          <p className="text-h3 font-bold text-success-600">{thisMonthOrders.length}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Total Pesanan</p>
          <p className="text-h3 font-bold text-text-primary">{orders.length}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Invoice Outstanding</p>
          <p className="text-h3 font-bold text-warning-600">{outstandingInvoices.length}</p>
          {outstandingInvoices.length > 0 && (
            <p className="text-caption text-text-muted">
              Menunggu pembayaran{' '}
              {outstandingInvoices.length > 1 ? `(${outstandingInvoices.length} invoice)` : ''}
            </p>
          )}
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Karyawan</p>
          <p className="text-h3 font-bold text-text-primary">{profile.employeeCount ?? '-'}</p>
        </Card>
      </Grid>

      {/* ── Active Contract ───────────────────────────────────── */}
      {firstContract ? (
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-body font-semibold text-text-primary">Kontrak Aktif</h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-caption font-medium text-success-700">
              <span className="h-1.5 w-1.5 rounded-full bg-success-500" aria-hidden="true" />
              {firstContract.contractNumber}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-caption font-medium text-text-muted">Periode</p>
              <p className="mt-1 text-body-sm font-semibold text-text-primary">
                {formatDateRange(firstContract.startDate, firstContract.endDate)}
              </p>
            </div>
            <div>
              <p className="text-caption font-medium text-text-muted">SLA Respon</p>
              <p className="mt-1 text-body-sm font-semibold text-text-primary">
                {firstContract.slaResponseHours ? `${firstContract.slaResponseHours} jam` : '-'}
              </p>
            </div>
            <div>
              <p className="text-caption font-medium text-text-muted">SLA Penyelesaian</p>
              <p className="mt-1 text-body-sm font-semibold text-text-primary">
                {firstContract.slaResolutionHours ? `${firstContract.slaResolutionHours} jam` : '-'}
              </p>
            </div>
            <div>
              <p className="text-caption font-medium text-text-muted">Status</p>
              <div className="mt-1">
                <Badge variant="success">Aktif</Badge>
                {isExpiringSoon(firstContract.endDate) && (
                  <span className="ml-2 text-caption font-medium text-warning-600">
                    Segera berakhir
                  </span>
                )}
              </div>
            </div>
          </div>

          {firstContract.notes && (
            <p className="mt-4 text-body-sm text-text-secondary border-t border-border-default pt-4">
              {firstContract.notes}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3 border-t border-border-default pt-4">
            <a
              href="/kontak"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary-500 px-4 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm"
            >
              Hubungi Account Manager
            </a>
            {isExpiringSoon(firstContract.endDate) && (
              <a
                href="/kontak"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-warning-300 bg-warning-50 px-4 text-body-sm font-semibold text-warning-700 transition-all duration-150 ease-out hover:bg-warning-100"
              >
                Perpanjang Kontrak
              </a>
            )}
          </div>
        </Card>
      ) : contracts.length > 0 ? (
        /* Non-active contracts exist but none active */
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-body font-semibold text-text-primary">Kontrak</h3>
              <p className="mt-1 text-body-sm text-text-secondary">
                Tidak ada kontrak aktif saat ini.
              </p>
            </div>
            <a
              href="/kontak"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary-500 px-4 text-body-sm font-semibold text-white"
            >
              Hubungi Admin
            </a>
          </div>
        </Card>
      ) : null}

      {/* ── Active Maintenance Orders ──────────────────────────── */}
      {activeMaintenance.length > 0 && (
        <div>
          <h3 className="mb-4 text-body font-semibold text-text-primary">Maintenance Aktif</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeMaintenance.map((order) => (
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
                href="/dashboard/corporate/orders"
                className="text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-150"
              >
                Lihat semua ({activeOrders.length} pesanan aktif)
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <Card padding="lg">
        <h3 className="mb-4 text-body font-semibold text-text-primary">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <a
            href="/dashboard/corporate/orders"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.wrench }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Request Layanan</span>
          </a>
          <a
            href="/dashboard/corporate/branches"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.building }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Kelola Cabang</span>
          </a>
          <a
            href="/dashboard/corporate/invoices"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.invoice }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Lihat Invoice</span>
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
        </div>
      </Card>

      {/* ── Outstanding Invoices ───────────────────────────────── */}
      {outstandingInvoices.length > 0 && (
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-body font-semibold text-text-primary">Invoice Menunggu</h3>
            <a
              href="/dashboard/corporate/invoices"
              className="text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-150"
            >
              Lihat Semua
            </a>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="px-3 py-2.5 text-left font-medium text-text-muted">No. Invoice</th>
                  <th className="px-3 py-2.5 text-left font-medium text-text-muted">Status</th>
                  <th className="px-3 py-2.5 text-right font-medium text-text-muted">Jumlah</th>
                  <th className="px-3 py-2.5 text-right font-medium text-text-muted">
                    Jatuh Tempo
                  </th>
                </tr>
              </thead>
              <tbody>
                {outstandingInvoices.slice(0, 5).map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border-default last:border-b-0 hover:bg-neutral-50/80 transition-colors duration-100"
                  >
                    <td className="px-3 py-3 font-medium text-text-primary">{inv.invoiceNumber}</td>
                    <td className="px-3 py-3">
                      <Badge variant={getInvoiceBadge(inv.status).variant}>
                        {getInvoiceBadge(inv.status).label}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-text-primary">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-3 py-3 text-right text-text-secondary">
                      {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {outstandingInvoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="rounded-lg border border-border-default bg-bg-page p-4">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-semibold text-text-primary">
                    {inv.invoiceNumber}
                  </span>
                  <Badge variant={getInvoiceBadge(inv.status).variant}>
                    {getInvoiceBadge(inv.status).label}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-caption text-text-muted">
                  <span>{formatCurrency(inv.amount)}</span>
                  <span>{inv.dueDate ? `Jatuh tempo: ${formatDate(inv.dueDate)}` : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Recent Completed Orders ────────────────────────────── */}
      {recentCompleted.length > 0 && (
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-body font-semibold text-text-primary">Riwayat Pesanan</h3>
            <a
              href="/dashboard/corporate/orders"
              className="text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-150"
            >
              Lihat Semua
            </a>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="px-3 py-2.5 text-left font-medium text-text-muted">No. Booking</th>
                  <th className="px-3 py-2.5 text-left font-medium text-text-muted">Status</th>
                  <th className="px-3 py-2.5 text-left font-medium text-text-muted">Tanggal</th>
                  <th className="px-3 py-2.5 text-right font-medium text-text-muted">Harga</th>
                </tr>
              </thead>
              <tbody>
                {recentCompleted.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border-default last:border-b-0 hover:bg-neutral-50/80 transition-colors duration-100"
                  >
                    <td className="px-3 py-3 font-medium text-text-primary">
                      {order.bookingNumber}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="success">{getStatusLabel(order.status as OrderStatus)}</Badge>
                    </td>
                    <td className="px-3 py-3 text-text-secondary">
                      {order.bookingDate ? formatDate(order.bookingDate) : '-'}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-text-primary">
                      {formatCurrency(order.basePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {recentCompleted.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-border-default bg-bg-page p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-semibold text-text-primary">
                    {order.bookingNumber}
                  </span>
                  <Badge variant="success">{getStatusLabel(order.status as OrderStatus)}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-caption text-text-muted">
                  <span>{order.bookingDate ? formatDate(order.bookingDate) : '-'}</span>
                  <span className="font-semibold text-text-primary">
                    {formatCurrency(order.basePrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Empty state for new corporate with no orders ──────── */}
      {orders.length === 0 && (
        <EmptyState
          title="Belum ada aktivitas"
          description="Belum ada pesanan atau maintenance. Ajukan layanan pertama untuk perusahaan Anda."
          action={
            <a
              href="/dashboard/corporate/orders"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-500 px-5 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              + Request Layanan
            </a>
          }
        />
      )}
    </div>
  );
}
