import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  createBrowserClient,
  formatDate,
  getStatusLabel,
  formatCurrency,
} from '@specialist/shared';
import { Card, Grid, Skeleton, Badge, Button, EmptyState } from '@specialist/ui';
import type { OrderStatus } from '@specialist/types';

// ── Types ──────────────────────────────────────────────────────

interface PartnerProfile {
  fullName: string;
  ratingAverage: string | null;
  completedJobs: number;
  availability: string;
  verificationStatus: string;
  bio: string | null;
}

interface JobItem {
  id: string;
  orderId: string;
  status: string;
  assignedAt: string;
  acceptedAt: string | null;
  completedAt: string | null;
  orderStatus: string;
  bookingNumber: string;
}

interface EarningsData {
  totalEarnings: number;
  paidCount: number;
  recentEarnings: Array<{
    id: string;
    bookingNumber: string;
    status: string;
    finalPrice: string | null;
    completedAt: string | null;
  }>;
}

// ── Helpers ────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

const PENDING_STATUSES = new Set(['Partner Assigned']);
const ACTIVE_JOB_STATUSES = new Set(['Partner Accepted', 'On The Way', 'Working']);

const AVAILABILITY_COLORS: Record<string, string> = {
  Available: 'text-success-600 bg-success-50 border-success-200',
  Busy: 'text-warning-600 bg-warning-50 border-warning-200',
  Vacation: 'text-info-600 bg-info-50 border-info-200',
  Offline: 'text-neutral-500 bg-neutral-100 border-neutral-200',
};

const AVAILABILITY_LABELS: Record<string, string> = {
  Available: 'Tersedia',
  Busy: 'Sibuk',
  Vacation: 'Cuti',
  Offline: 'Offline',
};

// Inline SVG icons (Lucide-compatible, zero JS)
const ICONS = {
  assignment:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2"/></svg>',
  clock:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  whatsapp:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/></svg>',
  wallet:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2 2 0 0 0 1.54 1.08l5.16.756a.53.53 0 0 1 .294.904l-3.736 3.638a2 2 0 0 0-.575 1.77l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2 2 0 0 0-1.862 0L6.395 18.8a.53.53 0 0 1-.771-.56l.882-5.14a2 2 0 0 0-.575-1.77L2.195 7.714a.53.53 0 0 1 .294-.904l5.16-.756a2 2 0 0 0 1.54-1.08l2.31-4.68Z"/></svg>',
  check:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
} as const;

// Smaller icon variants for compact contexts
const ASSIGNMENT_ICON_SM = ICONS.assignment.replace(
  'width="24" height="24"',
  'width="20" height="20"',
);

// ── Component ──────────────────────────────────────────────────

export function PartnerOverview() {
  const api = useMemo(() => createBrowserClient(), []);

  // State
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAvail, setSavingAvail] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [prof, jobsData, earningsData] = await Promise.all([
        api.get<PartnerProfile>('/api/v1/partners/me'),
        api.get<JobItem[]>('/api/v1/partners/me/jobs').catch(() => []),
        api.get<EarningsData>('/api/v1/partners/me/earnings').catch(() => null),
      ]);
      setProfile(prof);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setEarnings(earningsData);
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
  const pendingJobs = jobs.filter((j) => PENDING_STATUSES.has(j.orderStatus));
  const activeJobs = jobs.filter((j) => ACTIVE_JOB_STATUSES.has(j.orderStatus));
  const completedJobs = jobs.filter((j) => ['Completed', 'Paid', 'Closed'].includes(j.orderStatus));

  // Today's active jobs sorted by most recently assigned
  const todaysJobs = activeJobs
    .slice()
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

  // ── Availability toggle ──────────────────────────────────────
  async function toggleAvailability() {
    if (!profile) return;
    const newStatus = profile.availability === 'Available' ? 'Busy' : 'Available';
    setSavingAvail(true);
    try {
      await api.patch('/api/v1/partners/me/availability', {
        body: { availability: newStatus },
      });
      setProfile((prev) => (prev ? { ...prev, availability: newStatus } : prev));
    } catch {
      // silent
    } finally {
      setSavingAvail(false);
    }
  }

  // ── Job actions ──────────────────────────────────────────────
  async function handleAccept(orderId: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/accept`);
      await loadData();
    } catch {
      // silent
    }
  }

  async function handleReject(orderId: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/reject`, {
        body: { reason: 'Tidak tersedia' },
      });
      await loadData();
    } catch {
      // silent
    }
  }

  const greeting = getGreeting();
  const userName = profile?.fullName?.split(' ')[0] ?? 'Mitra';

  // ══════════════════════════════════════════════════════════════
  // LOADING STATE
  // ══════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="space-y-6">
        <Card padding="lg">
          <Skeleton variant="text" className="w-1/3" />
          <div className="mt-3">
            <Skeleton variant="text" className="w-1/4" />
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
  // ERROR STATE — no profile loaded
  // ══════════════════════════════════════════════════════════════
  if (!profile) {
    return (
      <EmptyState
        title="Gagal memuat profil mitra"
        description="Silakan coba lagi atau hubungi admin."
        action={<Button onClick={() => window.location.reload()}>Muat Ulang</Button>}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // MAIN DASHBOARD
  // ══════════════════════════════════════════════════════════════

  const availStyle = AVAILABILITY_COLORS[profile.availability] ?? 'text-neutral-500 bg-neutral-100';
  const availLabel = AVAILABILITY_LABELS[profile.availability] ?? profile.availability;

  return (
    <div className="space-y-6">
      {/* ── Welcome + Availability ─────────────────────────────── */}
      <Card padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-h4 text-text-primary">
              {greeting}, {userName}
            </h2>
            <p className="mt-1 text-body text-text-secondary">Dashboard Mitra Spesialis</p>
          </div>

          {/* Availability toggle */}
          <div className="flex shrink-0 items-center gap-3">
            <span className="text-body-sm text-text-secondary">Status:</span>
            <button
              type="button"
              onClick={toggleAvailability}
              disabled={savingAvail}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-body-sm font-semibold transition-all duration-150 ease-out hover:shadow-sm disabled:opacity-50 ${availStyle}`}
              aria-label={`Ubah status menjadi ${profile.availability === 'Available' ? 'Sibuk' : 'Tersedia'}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  profile.availability === 'Available'
                    ? 'bg-success-500'
                    : profile.availability === 'Busy'
                      ? 'bg-warning-500'
                      : 'bg-neutral-400'
                }`}
                aria-hidden="true"
              />
              {savingAvail ? '...' : availLabel}
            </button>
          </div>
        </div>

        {/* Verification banner */}
        {profile.verificationStatus !== 'Approved' && (
          <div className="mt-4 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3">
            <p className="text-body-sm text-warning-700">
              Akun Anda masih{' '}
              <strong>
                {profile.verificationStatus === 'Pending'
                  ? 'menunggu verifikasi'
                  : profile.verificationStatus === 'Rejected'
                    ? 'ditolak'
                    : profile.verificationStatus}
              </strong>
              . Beberapa fitur mungkin terbatas hingga akun diverifikasi oleh admin.
            </p>
          </div>
        )}
      </Card>

      {/* ── Pending Assignments ────────────────────────────────── */}
      {pendingJobs.length > 0 && (
        <div>
          <h3 className="mb-4 text-body font-semibold text-text-primary">
            Assignment Baru
            <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger-500 px-1.5 text-caption font-bold text-white">
              {pendingJobs.length}
            </span>
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {pendingJobs.slice(0, 4).map((job) => (
              <Card key={job.id} padding="md">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-body-sm font-semibold text-text-primary">
                      {job.bookingNumber}
                    </p>
                    <p className="mt-0.5 text-caption text-text-muted">
                      Ditugaskan: {formatDate(job.assignedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(job.orderId)}>
                      Terima
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(job.orderId)}>
                      Tolak
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {pendingJobs.length > 4 && (
            <div className="mt-3 text-center">
              <a
                href="/dashboard/partner/jobs"
                className="text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-150"
              >
                Lihat semua ({pendingJobs.length} assignment baru)
              </a>
            </div>
          )}
        </div>
      )}

      {/* ── Today's Activity ───────────────────────────────────── */}
      {todaysJobs.length > 0 && (
        <div>
          <h3 className="mb-4 text-body font-semibold text-text-primary">Aktivitas Hari Ini</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {todaysJobs.slice(0, 4).map((job) => (
              <a
                key={job.id}
                href="/dashboard/partner/jobs"
                className="flex items-center gap-4 rounded-xl border border-primary-200 bg-bg-surface p-4 transition-all duration-150 ease-out hover:border-primary-400 hover:shadow-sm"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600"
                  aria-hidden="true"
                >
                  <span
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: ASSIGNMENT_ICON_SM }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-semibold text-text-primary">
                    {job.bookingNumber}
                  </p>
                  <p className="mt-0.5 text-caption text-text-muted">
                    {getStatusLabel(job.orderStatus as OrderStatus)}
                  </p>
                </div>
                <Badge variant="info">{getStatusLabel(job.orderStatus as OrderStatus)}</Badge>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Stat Cards ─────────────────────────────────────────── */}
      <Grid cols={4} gap={4}>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Rating</p>
          <p className="text-h3 font-bold text-warning-600">
            {profile.ratingAverage ? `${Number(profile.ratingAverage).toFixed(1)}` : '-'}
            {profile.ratingAverage && <span className="text-body text-text-muted"> / 5.0</span>}
          </p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Selesai</p>
          <p className="text-h3 font-bold text-success-600">{profile.completedJobs}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Total Pekerjaan</p>
          <p className="text-h3 font-bold text-text-primary">{jobs.length}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Pendapatan</p>
          <p className="text-h3 font-bold text-success-600">
            {earnings ? formatCurrency(earnings.totalEarnings) : '-'}
          </p>
          {earnings && (
            <p className="text-caption text-text-muted">{earnings.paidCount} pekerjaan dibayar</p>
          )}
        </Card>
      </Grid>

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <Card padding="lg">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <a
            href="/dashboard/partner/jobs"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.assignment }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Lihat Pekerjaan</span>
          </a>
          <a
            href="/dashboard/partner/availability"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.clock }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Atur Jadwal</span>
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
            href="/dashboard/partner/earnings"
            className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-4 py-3 transition-all duration-150 ease-out hover:border-primary-200 hover:shadow-sm"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success-50 text-success-600">
              <span
                className="[&_svg]:h-[18px] [&_svg]:w-[18px]"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: ICONS.wallet }}
              />
            </div>
            <span className="text-body-sm font-semibold text-text-primary">Lihat Pendapatan</span>
          </a>
        </div>
      </Card>

      {/* ── Recent Completed Jobs ──────────────────────────────── */}
      {completedJobs.length > 0 && (
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-body font-semibold text-text-primary">Riwayat Pekerjaan</h3>
            <a
              href="/dashboard/partner/earnings"
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
                  <th className="px-3 py-2.5 text-left font-medium text-text-muted">Ditugaskan</th>
                </tr>
              </thead>
              <tbody>
                {completedJobs.slice(0, 5).map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border-default last:border-b-0 hover:bg-neutral-50/80 transition-colors duration-100"
                  >
                    <td className="px-3 py-3 font-medium text-text-primary">{job.bookingNumber}</td>
                    <td className="px-3 py-3">
                      <Badge variant="success">
                        {getStatusLabel(job.orderStatus as OrderStatus)}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-text-secondary">{formatDate(job.assignedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {completedJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="rounded-lg border border-border-default bg-bg-page p-4">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-semibold text-text-primary">
                    {job.bookingNumber}
                  </span>
                  <Badge variant="success">{getStatusLabel(job.orderStatus as OrderStatus)}</Badge>
                </div>
                <p className="mt-1 text-caption text-text-muted">{formatDate(job.assignedAt)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Empty state for new partners with no jobs ──────────── */}
      {jobs.length === 0 && profile.verificationStatus === 'Approved' && (
        <EmptyState
          title="Belum ada pekerjaan"
          description="Saat ini belum ada assignment. Pastikan status Anda 'Tersedia' agar admin dapat menugaskan pekerjaan."
          action={
            profile.availability !== 'Available' ? (
              <Button onClick={toggleAvailability} disabled={savingAvail}>
                {savingAvail ? '...' : 'Setel Tersedia'}
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
