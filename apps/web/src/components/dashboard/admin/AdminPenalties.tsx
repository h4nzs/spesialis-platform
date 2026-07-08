import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createBrowserClient, formatCurrency, downloadCSV } from '@specialist/shared';
import { Button, Input, Select, Textarea, Modal, Table, Badge, EmptyState } from '@specialist/ui';
import type { Column } from '@specialist/ui';

interface PenaltyItem {
  id: string;
  partnerId: string;
  partnerName: string | null;
  orderId: string | null;
  bookingNumber: string | null;
  type: string;
  amount: string;
  reason: string;
  status: string;
  imposedAt: string;
  paidAt: string | null;
  resolvedAt: string | null;
  notes: string | null;
}

const PENALTY_TYPES = [
  { value: 'Late', label: 'Terlambat' },
  { value: 'NoShow', label: 'Tidak Hadir' },
  { value: 'Cancellation', label: 'Pembatalan' },
  { value: 'Complaint', label: 'Komplain' },
  { value: 'Other', label: 'Lainnya' },
];

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  Pending: 'warning',
  Applied: 'success',
  Waived: 'default',
  Disputed: 'danger',
};

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Menunggu',
  Applied: 'Diterapkan',
  Waived: 'Dihapuskan',
  Disputed: 'Disengketakan',
};

function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function AdminPenalties() {
  const api = useMemo(() => createBrowserClient(), []);
  const [penalties, setPenalties] = useState<PenaltyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Partner search
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerResults, setPartnerResults] = useState<{ id: string; fullName: string }[]>([]);
  const [partnerSearchOpen, setPartnerSearchOpen] = useState(false);
  const [partnerSearching, setPartnerSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const orderTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Order search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderResults, setOrderResults] = useState<
    { id: string; bookingNumber: string; status: string }[]
  >([]);
  const [orderSearchOpen, setOrderSearchOpen] = useState(false);
  const [orderSearching, setOrderSearching] = useState(false);

  // Impose modal
  const [showImpose, setShowImpose] = useState(false);
  const [imposeForm, setImposeForm] = useState({
    partnerId: '',
    partnerName: '',
    orderId: '',
    type: 'Late',
    amount: '',
    reason: '',
    notes: '',
  });
  const [imposeError, setImposeError] = useState('');

  // Status modal
  const [showStatus, setShowStatus] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<PenaltyItem | null>(null);
  const [statusAction, setStatusAction] = useState<'Applied' | 'Waived' | null>(null);
  const [statusNotes, setStatusNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const loadPenalties = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PenaltyItem[]>('/api/v1/admin/penalties');
      setPenalties(Array.isArray(data) ? data : []);
    } catch {
      setPenalties([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadPenalties();
  }, [loadPenalties]);

  // Partner search with debounce
  const searchPartners = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setPartnerResults([]);
        setPartnerSearchOpen(false);
        return;
      }
      setPartnerSearching(true);
      try {
        const data = await api.get<{ data: { id: string; fullName: string }[] }>(
          '/api/v1/partners',
          { params: { search: query, limit: 10 } },
        );
        const items = data?.data ?? [];
        setPartnerResults(Array.isArray(items) ? items : []);
        setPartnerSearchOpen(true);
      } catch {
        setPartnerResults([]);
      } finally {
        setPartnerSearching(false);
      }
    },
    [api],
  );

  function handlePartnerSearchChange(value: string) {
    setPartnerSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => searchPartners(value), 250);
  }

  function selectPartner(partner: { id: string; fullName: string }) {
    setImposeForm((f) => ({ ...f, partnerId: partner.id, partnerName: partner.fullName }));
    setPartnerSearch(partner.fullName);
    setPartnerSearchOpen(false);
  }

  function clearPartner() {
    setImposeForm((f) => ({ ...f, partnerId: '', partnerName: '' }));
    setPartnerSearch('');
    setPartnerResults([]);
  }

  // Cleanup debounce timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (orderTimeoutRef.current) clearTimeout(orderTimeoutRef.current);
    };
  }, []);

  // Close partner dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-partner-search]')) {
        setPartnerSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Order search with debounce
  const searchOrders = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setOrderResults([]);
        setOrderSearchOpen(false);
        return;
      }
      setOrderSearching(true);
      try {
        const data = await api.get<{
          data: { id: string; bookingNumber: string; status: string }[];
        }>('/api/v1/bookings', { params: { search: query, limit: 10 } });
        const items = data?.data ?? [];
        setOrderResults(Array.isArray(items) ? items : []);
        setOrderSearchOpen(true);
      } catch {
        setOrderResults([]);
      } finally {
        setOrderSearching(false);
      }
    },
    [api],
  );

  function handleOrderSearchChange(value: string) {
    setOrderSearch(value);
    if (orderTimeoutRef.current) clearTimeout(orderTimeoutRef.current);
    orderTimeoutRef.current = setTimeout(() => searchOrders(value), 250);
  }

  function selectOrder(order: { id: string; bookingNumber: string; status: string }) {
    setImposeForm((f) => ({ ...f, orderId: order.id }));
    setOrderSearch(`${order.bookingNumber} — ${order.status}`);
    setOrderSearchOpen(false);
  }

  function clearOrder() {
    setImposeForm((f) => ({ ...f, orderId: '' }));
    setOrderSearch('');
    setOrderResults([]);
  }

  // Close order dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-order-search]')) {
        setOrderSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function openImpose() {
    setImposeForm({
      partnerId: '',
      partnerName: '',
      orderId: '',
      type: 'Late',
      amount: '',
      reason: '',
      notes: '',
    });
    setPartnerSearch('');
    setPartnerResults([]);
    setOrderSearch('');
    setOrderResults([]);
    setImposeError('');
    setShowImpose(true);
  }

  async function handleImpose() {
    if (!imposeForm.partnerId || !imposeForm.amount || !imposeForm.reason) {
      setImposeError('Partner ID, jumlah, dan alasan wajib diisi');
      return;
    }
    setSubmitting(true);
    setImposeError('');
    try {
      const body: Record<string, unknown> = {
        partnerId: imposeForm.partnerId,
        type: imposeForm.type,
        amount: Number(imposeForm.amount),
        reason: imposeForm.reason,
      };
      if (imposeForm.orderId) body.orderId = imposeForm.orderId;
      if (imposeForm.notes) body.notes = imposeForm.notes;

      await api.post('/api/v1/admin/penalties', { body });
      setShowImpose(false);
      await loadPenalties();
    } catch {
      setImposeError('Gagal menyimpan penalty');
    } finally {
      setSubmitting(false);
    }
  }

  function openStatusModal(penalty: PenaltyItem, action: 'Applied' | 'Waived') {
    setSelectedPenalty(penalty);
    setStatusAction(action);
    setStatusNotes('');
    setShowStatus(true);
  }

  async function handleStatusUpdate() {
    if (!selectedPenalty || !statusAction) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { status: statusAction };
      if (statusNotes) body.notes = statusNotes;

      await api.patch(`/api/v1/admin/penalties/${selectedPenalty.id}/status`, { body });
      setShowStatus(false);
      setSelectedPenalty(null);
      setStatusAction(null);
      await loadPenalties();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<PenaltyItem>[] = [
    {
      key: 'partnerName',
      header: 'Partner',
      render: (item) => item.partnerName ?? item.partnerId.slice(0, 8) + '…',
    },
    {
      key: 'bookingNumber',
      header: 'Booking',
      render: (item) => item.bookingNumber ?? '-',
    },
    {
      key: 'type',
      header: 'Tipe',
      render: (item) => {
        const labels: Record<string, string> = {
          Late: 'Terlambat',
          NoShow: 'Tidak Hadir',
          Cancellation: 'Pembatalan',
          Complaint: 'Komplain',
          Other: 'Lainnya',
        };
        return labels[item.type] ?? item.type;
      },
    },
    {
      key: 'amount',
      header: 'Jumlah',
      render: (item) => formatCurrency(item.amount),
    },
    {
      key: 'reason',
      header: 'Alasan',
      render: (item) => (
        <span className="max-w-[200px] truncate block" title={item.reason}>
          {item.reason}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={STATUS_COLORS[item.status] ?? 'default'}>
          {STATUS_LABELS[item.status] ?? item.status}
        </Badge>
      ),
    },
    {
      key: 'imposedAt',
      header: 'Tanggal',
      render: (item) => formatDate(item.imposedAt),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          {item.status === 'Pending' && (
            <>
              <Button size="sm" onClick={() => openStatusModal(item, 'Applied')}>
                Terapkan
              </Button>
              <Button size="sm" variant="danger" onClick={() => openStatusModal(item, 'Waived')}>
                Hapuskan
              </Button>
            </>
          )}
          {item.status === 'Disputed' && (
            <>
              <Button size="sm" onClick={() => openStatusModal(item, 'Applied')}>
                Terapkan
              </Button>
              <Button size="sm" variant="danger" onClick={() => openStatusModal(item, 'Waived')}>
                Hapuskan
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  function handleExportCSV() {
    const typeLabels: Record<string, string> = {
      Late: 'Terlambat',
      NoShow: 'Tidak Hadir',
      Cancellation: 'Pembatalan',
      Complaint: 'Komplain',
      Other: 'Lainnya',
    };
    const headers = ['Partner', 'Booking', 'Tipe', 'Jumlah', 'Alasan', 'Status', 'Tanggal'];
    const rows = penalties.map((p) => [
      p.partnerName ?? p.partnerId.slice(0, 8) + '…',
      p.bookingNumber ?? '-',
      typeLabels[p.type] ?? p.type,
      formatCurrency(p.amount),
      p.reason,
      STATUS_LABELS[p.status] ?? p.status,
      formatDate(p.imposedAt),
    ]);
    downloadCSV(headers, rows, 'penalty-export.csv');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <div
            className="animate-skeleton h-10 w-32 rounded-lg bg-neutral-200"
            aria-hidden="true"
          />
        </div>
        <div
          className="animate-skeleton h-12 w-full rounded-lg bg-neutral-200"
          aria-hidden="true"
        />
        <div
          className="animate-skeleton h-12 w-full rounded-lg bg-neutral-200"
          aria-hidden="true"
        />
        <div
          className="animate-skeleton h-12 w-full rounded-lg bg-neutral-200"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {penalties.length > 0 && (
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default-default bg-bg-bg-surface px-3 py-1.5 text-body-sm font-medium text-text-primary-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
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
              className="shrink-0"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        )}
        <Button onClick={openImpose}>Tambah Penalty</Button>
      </div>

      <Table
        columns={columns}
        data={penalties}
        keyExtractor={(p) => p.id}
        emptyState={<EmptyState title="Belum ada penalty" />}
      />

      {/* Impose Penalty Modal */}
      <Modal open={showImpose} onClose={() => setShowImpose(false)} title="Tambah Penalty">
        <div className="space-y-3">
          {imposeError && <p className="text-sm text-danger-500">{imposeError}</p>}

          {/* Partner Search */}
          <div data-partner-search className="relative">
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Partner</label>
            {imposeForm.partnerId ? (
              <div className="flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 py-2">
                <span className="flex-1 text-sm text-text-primary">{imposeForm.partnerName}</span>
                <button
                  type="button"
                  onClick={clearPartner}
                  className="text-xs text-text-primary-secondary hover:text-danger-500 cursor-pointer"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={partnerSearch}
                  onChange={(e) => handlePartnerSearchChange(e.target.value)}
                  placeholder="Cari nama partner..."
                  className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-primary-secondary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {partnerSearching && (
                  <span className="absolute right-3 top-9 text-xs text-text-primary-secondary">
                    Mencari...
                  </span>
                )}
                {partnerSearchOpen && partnerResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-border-default bg-bg-surface shadow-lg">
                    {partnerResults.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPartner(p)}
                        className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        {p.fullName}
                        <span className="ml-2 text-xs text-text-primary-secondary">
                          {p.id.slice(0, 8)}…
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {partnerSearchOpen &&
                  partnerResults.length === 0 &&
                  partnerSearch.trim() &&
                  !partnerSearching && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border-default bg-bg-surface p-3 text-sm text-text-primary-secondary shadow-lg">
                      Partner tidak ditemukan
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Order Search */}
          <div data-order-search className="relative">
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              Order (opsional)
            </label>
            {imposeForm.orderId ? (
              <div className="flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-3 py-2">
                <span className="flex-1 text-sm text-text-primary">{orderSearch}</span>
                <button
                  type="button"
                  onClick={clearOrder}
                  className="text-xs text-text-primary-secondary hover:text-danger-500 cursor-pointer"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => handleOrderSearchChange(e.target.value)}
                  placeholder="Cari nomor booking..."
                  className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-primary-secondary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {orderSearching && (
                  <span className="absolute right-3 top-9 text-xs text-text-primary-secondary">
                    Mencari...
                  </span>
                )}
                {orderSearchOpen && orderResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-md border border-border-default bg-bg-surface shadow-lg">
                    {orderResults.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => selectOrder(o)}
                        className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <span className="font-medium">{o.bookingNumber}</span>
                        <span className="ml-2 text-xs text-text-primary-secondary">{o.status}</span>
                      </button>
                    ))}
                  </div>
                )}
                {orderSearchOpen &&
                  orderResults.length === 0 &&
                  orderSearch.trim() &&
                  !orderSearching && (
                    <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border-default bg-bg-surface p-3 text-sm text-text-primary-secondary shadow-lg">
                      Order tidak ditemukan
                    </div>
                  )}
              </>
            )}
          </div>

          <Select
            label="Tipe"
            value={imposeForm.type}
            onChange={(e) => setImposeForm((f) => ({ ...f, type: e.target.value }))}
            options={PENALTY_TYPES}
          />

          <Input
            label="Jumlah (Rp)"
            type="number"
            value={imposeForm.amount}
            onChange={(e) => setImposeForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder="50000"
            required
          />

          <Textarea
            label="Alasan"
            value={imposeForm.reason}
            onChange={(e) => setImposeForm((f) => ({ ...f, reason: e.target.value }))}
            placeholder="Alasan pengenaan penalty"
            required
          />

          <Textarea
            label="Catatan (opsional)"
            value={imposeForm.notes}
            onChange={(e) => setImposeForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Catatan tambahan"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowImpose(false)}>
              Batal
            </Button>
            <Button type="button" onClick={handleImpose} disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        open={showStatus}
        onClose={() => setShowStatus(false)}
        title={statusAction === 'Applied' ? 'Terapkan Penalty' : 'Hapuskan Penalty'}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-primary-secondary">
            {statusAction === 'Applied'
              ? `Penalty akan ditandai sebagai "${selectedPenalty?.type}" sebesar ${formatCurrency(selectedPenalty?.amount ?? '0')} untuk ${selectedPenalty?.partnerName ?? 'partner'}`
              : `Penalty sebesar ${formatCurrency(selectedPenalty?.amount ?? '0')} untuk ${selectedPenalty?.partnerName ?? 'partner'} akan dihapuskan`}
          </p>
          <Textarea
            label="Catatan (opsional)"
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            placeholder="Alasan perubahan status"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowStatus(false)}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleStatusUpdate}
              disabled={submitting}
              variant={statusAction === 'Applied' ? 'primary' : 'danger'}
            >
              {submitting ? 'Menyimpan...' : 'Konfirmasi'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
