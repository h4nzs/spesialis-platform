import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, formatDate, formatCurrency } from '@ahlipanggilan/shared';
import {
  Badge,
  Card,
  EmptyState,
  Spinner,
  Pagination,
  Button,
  Modal,
  Input,
} from '@ahlipanggilan/ui';
import { track } from '@spesialis/analytics';

// ── Types ─────────────────────────────────────────────────────

interface QueueItem {
  id: string;
  bookingNumber: string;
  status: string;
  bookingDate: string;
  bookingTime: string;
  basePrice: string;
  finalPrice: string | null;
  notes: string | null;
  createdAt: string;
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
  waitingHours: number;
}

interface AvailablePartner {
  id: string;
  fullName: string;
  avatar: string | null;
  ratingAverage: string;
  completedJobs: number;
  experienceYear: number | null;
  domicile: string | null;
  bio: string | null;
  availability: string;
  skills: { id: string; categoryId: string; categoryName: string; proficiency: string }[];
}

interface AvailablePartnersResponse {
  partners: AvailablePartner[];
  totalAvailable: number;
  currentlyAssigned: number;
}

interface SlaStats {
  slaBreached: number;
  waitingToday: number;
}

// ── Helpers ────────────────────────────────────────────────────

function getWaitingBadge(hours: number): { variant: 'warning' | 'danger' | 'info'; label: string } {
  if (hours >= 24) return { variant: 'danger', label: `${hours.toFixed(0)}j (SLA breach)` };
  if (hours >= 12) return { variant: 'warning', label: `${hours.toFixed(0)}j` };
  return { variant: 'info', label: `${hours.toFixed(1)}j` };
}

function getProficiencyColor(proficiency: string): string {
  switch (proficiency) {
    case 'Expert':
      return 'bg-success-100 text-success-700 border-success-200';
    case 'Advanced':
      return 'bg-primary-100 text-primary-700 border-primary-200';
    case 'Intermediate':
      return 'bg-warning-100 text-warning-700 border-warning-200';
    default:
      return 'bg-neutral-100 text-neutral-600 border-neutral-200';
  }
}

// ── Main Component ──────────────────────────────────────────────

export function DispatcherOverview() {
  const api = useMemo(() => createBrowserClient(), []);

  // ── Dashboard stats ────────────────────────────────────────────
  const [stats, setStats] = useState<{
    active: number;
    waitingAssignment: number;
    availablePartners: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── SLA stats ──────────────────────────────────────────────────
  const [slaStats, setSlaStats] = useState<SlaStats | null>(null);

  // ── Queue state ────────────────────────────────────────────────
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queuePage, setQueuePage] = useState(1);
  const [queueTotal, setQueueTotal] = useState(0); // total item count for badge
  const [queueTotalPages, setQueueTotalPages] = useState(0); // pages for pagination
  const [queueSearchInput, setQueueSearchInput] = useState(''); // bound to input display
  const [queueSearch, setQueueSearch] = useState(''); // sent to API (debounced)

  // ── Partner state ──────────────────────────────────────────────
  const [availablePartners, setAvailablePartners] = useState<AvailablePartnersResponse | null>(
    null,
  );
  const [partnersLoading, setPartnersLoading] = useState(true);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // ── Assign action state ────────────────────────────────────────
  const [assignTarget, setAssignTarget] = useState<{
    bookingId: string;
    bookingNumber: string;
  } | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [assigning, setAssigning] = useState(false);

  // ── Categories for filter ──────────────────────────────────────
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  // ── Load stats ─────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const data = await api.get<{
        partners: { available: number };
        orders: { active: number; waitingAssignment: number };
      }>('/api/v1/admin/dashboard');
      setStats({
        active: data.orders?.active ?? 0,
        waitingAssignment: data.orders?.waitingAssignment ?? 0,
        availablePartners: data.partners?.available ?? 0,
      });
    } catch {
      setStats({ active: 0, waitingAssignment: 0, availablePartners: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, [api]);

  // ── Load SLA stats ────────────────────────────────────────────
  const loadSlaStats = useCallback(async () => {
    try {
      const data = await api.get<SlaStats>('/api/v1/admin/dashboard/dispatcher/sla-stats');
      setSlaStats(data);
    } catch {
      setSlaStats(null);
    }
  }, [api]);

  // ── Load queue ────────────────────────────────────────────────
  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const result = await api.getPaginated<QueueItem>('/api/v1/admin/dashboard/dispatcher/queue', {
        params: { page: queuePage, limit: 10, ...(queueSearch ? { search: queueSearch } : {}) },
      });
      setQueue(result.data);
      setQueueTotal(result.pagination.total);
      setQueueTotalPages(result.pagination.totalPages);
    } catch {
      setQueue([]);
      setQueueTotal(0);
      setQueueTotalPages(0);
    } finally {
      setQueueLoading(false);
    }
  }, [api, queuePage, queueSearch]);

  // ── Load available partners ───────────────────────────────────
  const loadPartners = useCallback(async () => {
    setPartnersLoading(true);
    try {
      const data = await api.get<AvailablePartnersResponse>(
        `/api/v1/admin/dashboard/dispatcher/available-partners${
          selectedCategoryFilter ? `?categoryId=${selectedCategoryFilter}` : ''
        }`,
      );
      setAvailablePartners(data);
    } catch {
      setAvailablePartners(null);
    } finally {
      setPartnersLoading(false);
    }
  }, [api, selectedCategoryFilter]);

  // ── Load categories for filter ─────────────────────────────────
  const loadCategories = useCallback(async () => {
    try {
      const data = await api.get<{ id: string; name: string }[]>(
        '/api/v1/admin/service-categories',
      );
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }, [api]); // ── Debounce search input → trigger API call ────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setQueueSearch(queueSearchInput);
      setQueuePage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [queueSearchInput]);

  // ── Initial load ──────────────────────────────────────────────
  useEffect(() => {
    loadStats();
    loadSlaStats();
    loadQueue();
    loadPartners();
    loadCategories();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats();
      loadSlaStats();
      loadQueue();
      loadPartners();
    }, 30_000);

    return () => clearInterval(interval);
  }, [loadStats, loadSlaStats, loadQueue, loadPartners, loadCategories]);

  // ── Handle assign ─────────────────────────────────────────────
  async function handleAssign() {
    if (!assignTarget || !selectedPartnerId) return;
    setAssigning(true);
    try {
      await api.post(`/api/v1/bookings/${assignTarget.bookingId}/assign`, {
        body: { partnerId: selectedPartnerId, note: assignNote || undefined },
      });
      track('booking_assign', {
        booking_id: assignTarget.bookingId,
        partner_id: selectedPartnerId,
      });
      setAssignTarget(null);
      setSelectedPartnerId('');
      setAssignNote('');
      loadQueue();
      loadStats();
      loadPartners();
    } catch {
      // silent
    } finally {
      setAssigning(false);
    }
  }

  // ── Open assign modal ─────────────────────────────────────────
  function openAssignModal(item: QueueItem) {
    setAssignTarget({ bookingId: item.id, bookingNumber: item.bookingNumber });
    setSelectedPartnerId('');
    setAssignNote('');
  }

  // ── Loading state ─────────────────────────────────────────────
  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border-default bg-bg-surface p-6">
              <div
                className="animate-skeleton h-4 w-1/2 rounded-sm bg-neutral-200"
                aria-hidden="true"
              />
              <div
                className="mt-2 animate-skeleton h-8 w-1/3 rounded-sm bg-neutral-200"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: KPI Cards — Real-time Metrics
          ═══════════════════════════════════════════════════════ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="lg">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-text-secondary">Sedang Berjalan</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
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
                <rect width="18" height="12" x="3" y="4" rx="2" />
                <path d="M3 16h18" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-h3 font-bold text-primary">{stats?.active ?? 0}</p>
          <p className="mt-0.5 text-caption text-text-muted">Pekerjaan berjalan</p>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-text-secondary">Menunggu Assignment</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-h3 font-bold text-warning">{stats?.waitingAssignment ?? 0}</p>
          <p className="mt-0.5 text-caption text-text-muted">
            {slaStats?.slaBreached ? (
              <span className="text-danger font-medium">{slaStats.slaBreached} SLA breach</span>
            ) : (
              'Menunggu ditugaskan'
            )}
          </p>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-text-secondary">Partner Tersedia</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50 text-success-600">
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-h3 font-bold text-success">
            {availablePartners?.totalAvailable ?? 0}
          </p>
          <p className="mt-0.5 text-caption text-text-muted">
            {availablePartners?.currentlyAssigned
              ? `${availablePartners.currentlyAssigned} sedang bertugas`
              : 'Siap ditugaskan'}
          </p>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between">
            <p className="text-body-sm text-text-secondary">Hari Ini</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-50 text-info-600">
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
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-h3 font-bold text-info">{slaStats?.waitingToday ?? 0}</p>
          <p className="mt-0.5 text-caption text-text-muted">Booking baru hari ini</p>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: Assignment Queue
          ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-body font-semibold text-text-primary">Antrian Assignment</h3>
            {queueTotal > 0 && (
              <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-medium text-warning-700">
                {queueTotal}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={queueSearchInput}
              onChange={(e) => setQueueSearchInput(e.target.value)}
              placeholder="Cari no. booking..."
              className="h-9 w-48 rounded-md border border-border-default bg-bg-surface px-3 text-xs text-text-primary outline-none placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-4">
          {queueLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : queue.length === 0 ? (
            <EmptyState
              title="Tidak ada antrian"
              description="Semua booking sudah ditugaskan. Pantau halaman ini untuk assignment baru."
            />
          ) : (
            <div className="space-y-3">
              {queue.map((item) => {
                const badge = getWaitingBadge(item.waitingHours);
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border-default bg-bg-page p-4 transition-colors hover:border-primary-200"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm font-semibold text-text-primary">
                          {item.bookingNumber}
                        </span>
                        <Badge variant={badge.variant as 'warning' | 'danger' | 'info'}>
                          {badge.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                        <span>
                          🕐 {item.bookingDate ? formatDate(item.bookingDate) : '-'}{' '}
                          {item.bookingTime ?? ''}
                        </span>
                        {item.customerName && <span>👤 {item.customerName}</span>}
                        {item.customerPhone && <span>📞 {item.customerPhone}</span>}
                        <span>💰 {formatCurrency(Number(item.finalPrice ?? item.basePrice))}</span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-text-muted italic line-clamp-1">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>
                    <Button size="sm" onClick={() => openAssignModal(item)} className="shrink-0">
                      Assign
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {queueTotalPages > 1 && (
          <div className="mt-4">
            <Pagination page={queuePage} totalPages={queueTotalPages} onPageChange={setQueuePage} />
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: Available Partners
          ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-body font-semibold text-text-primary">Partner Tersedia</h3>
            {availablePartners && (
              <span className="rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700">
                {availablePartners.totalAvailable}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="h-9 rounded-md border border-border-default bg-bg-surface px-3 text-xs text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Semua Keahlian</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          {partnersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : !availablePartners || availablePartners.partners.length === 0 ? (
            <EmptyState
              title="Tidak ada partner tersedia"
              description="Semua partner sedang sibuk atau tidak ada yang online saat ini."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availablePartners.partners.map((partner) => (
                <div
                  key={partner.id}
                  className="rounded-lg border border-border-default bg-bg-surface p-4 transition-all duration-150 hover:shadow-md hover:border-primary-200"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-body-sm font-bold text-primary-600">
                      {partner.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-body-sm font-semibold text-text-primary truncate">
                        {partner.fullName}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                        {partner.domicile && <span>{partner.domicile}</span>}
                        {partner.ratingAverage && (
                          <span className="flex items-center gap-0.5">
                            ⭐ {Number(partner.ratingAverage).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mt-3 flex gap-3 border-t border-border-default pt-3">
                    <div className="flex-1 text-center">
                      <p className="text-body font-bold text-text-primary">
                        {partner.completedJobs}
                      </p>
                      <p className="text-caption text-text-muted">Selesai</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-body font-bold text-text-primary">
                        {partner.experienceYear ?? '-'}
                      </p>
                      <p className="text-caption text-text-muted">Tahun</p>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
                        Online
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {partner.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {partner.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill.id}
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${getProficiencyColor(skill.proficiency)}`}
                        >
                          {skill.categoryName}
                        </span>
                      ))}
                      {partner.skills.length > 4 && (
                        <span className="text-xs text-text-muted">
                          +{partner.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: Quick Actions
          ═══════════════════════════════════════════════════════ */}
      <Card padding="lg">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
          Aksi Cepat
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/dashboard/admin/bookings"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-500 px-4 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect width="8" height="4" x="8" y="2" />
            </svg>
            Kelola Booking
          </a>
          <a
            href="/dashboard/admin/partners"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border-default bg-bg-surface px-4 text-body-sm font-semibold text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Kelola Partner
          </a>
          <a
            href="/dashboard/admin/payments"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border-default bg-bg-surface px-4 text-body-sm font-semibold text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
            Pembayaran
          </a>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════════════
          ASSIGN MODAL
          ═══════════════════════════════════════════════════════ */}
      <Modal
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        title={`Assign Partner — ${assignTarget?.bookingNumber ?? ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Pilih partner yang akan ditugaskan untuk booking ini.
          </p>

          {/* Partner list */}
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {(availablePartners?.partners ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-text-muted">
                Tidak ada partner tersedia saat ini.
              </p>
            ) : (
              (availablePartners?.partners ?? []).map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  onClick={() => setSelectedPartnerId(partner.id)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-150 ${
                    selectedPartnerId === partner.id
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                      : 'border-border-default bg-bg-page hover:border-primary-200 hover:bg-primary-50/50'
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-body-sm font-bold text-primary-600">
                    {partner.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-sm font-semibold text-text-primary">
                      {partner.fullName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      {partner.domicile && <span>{partner.domicile}</span>}
                      <span>⭐ {Number(partner.ratingAverage).toFixed(1)}</span>
                      <span>{partner.completedJobs} pekerjaan</span>
                    </div>
                    {partner.skills.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {partner.skills.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center rounded-full bg-primary-100 px-1.5 py-0.5 text-[10px] text-primary-700"
                          >
                            {s.categoryName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedPartnerId === partner.id && (
                    <svg
                      className="h-5 w-5 shrink-0 text-primary-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>

          <Input
            label="Catatan (opsional)"
            value={assignNote}
            onChange={(e) => setAssignNote(e.target.value)}
            placeholder="Catatan untuk partner"
          />

          <div className="flex justify-end gap-2 border-t border-border-default pt-3">
            <Button variant="ghost" type="button" onClick={() => setAssignTarget(null)}>
              Batal
            </Button>
            <Button type="button" onClick={handleAssign} disabled={!selectedPartnerId || assigning}>
              {assigning ? 'Assigning...' : 'Assign Partner'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
