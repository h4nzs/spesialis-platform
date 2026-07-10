import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Table, Button, Modal, EmptyState, CSVExportButton, TableSkeleton } from '@specialist/ui';
import type { Column } from '@specialist/ui';

interface PartnerItem {
  id: string;
  fullName: string;
  availability: string;
  verificationStatus: string;
  completedJobs: number;
  ratingAverage: string | null;
}

export function AdminPartners() {
  const api = useMemo(() => createBrowserClient(), []);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPartnerId, setRejectPartnerId] = useState<string | null>(null);
  const [rejectPartnerName, setRejectPartnerName] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PartnerItem[]>('/api/v1/partners');
      setPartners(Array.isArray(data) ? data : []);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  async function handleApprove(partnerId: string) {
    try {
      await api.post(`/api/v1/partners/${partnerId}/verify`, {
        body: { verificationStatus: 'Approved' },
      });
      await loadPartners();
    } catch {
      // silent
    }
  }

  function openRejectModal(item: PartnerItem) {
    setRejectPartnerId(item.id);
    setRejectPartnerName(item.fullName);
    setRejectNote('');
    setShowRejectModal(true);
  }

  async function handleReject() {
    if (!rejectPartnerId) return;
    setSubmitting(true);
    try {
      await api.post(`/api/v1/partners/${rejectPartnerId}/verify`, {
        body: {
          verificationStatus: 'Rejected',
          note: rejectNote.trim() || undefined,
        },
      });
      setShowRejectModal(false);
      await loadPartners();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<PartnerItem>[] = [
    { key: 'fullName', header: 'Nama' },
    { key: 'verificationStatus', header: 'Verifikasi' },
    { key: 'availability', header: 'Ketersediaan' },
    {
      key: 'completedJobs',
      header: 'Pekerjaan',
      render: (item) => item.completedJobs.toString(),
    },
    {
      key: 'ratingAverage',
      header: 'Rating',
      render: (item) => (item.ratingAverage ? Number(item.ratingAverage).toFixed(1) : '-'),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          {item.verificationStatus !== 'Approved' && (
            <Button size="sm" onClick={() => handleApprove(item.id)}>
              Setujui
            </Button>
          )}
          {item.verificationStatus !== 'Rejected' && (
            <Button size="sm" variant="danger" onClick={() => openRejectModal(item)}>
              Tolak
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {partners.length > 0 && (
          <CSVExportButton
            data={partners as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'fullName', label: 'Nama' },
              { key: 'verificationStatus', label: 'Verifikasi' },
              { key: 'availability', label: 'Ketersediaan' },
              {
                key: 'completedJobs',
                label: 'Pekerjaan',
                format: (v) => String(v ?? ''),
              },
              {
                key: 'ratingAverage',
                label: 'Rating',
                format: (v) => (v ? Number(v).toFixed(1) : '-'),
              },
            ]}
            filename="partner-export.csv"
          />
        )}
      </div>
      <Table
        columns={columns}
        data={partners}
        keyExtractor={(p) => p.id}
        emptyState={<EmptyState title="Belum ada partner" />}
      />

      {/* ── Reject Reason Modal ─────────────────────────────── */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title={`Tolak Partner — ${rejectPartnerName}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Berikan alasan penolakan. Partner akan menerima notifikasi dan email berisi alasan ini.
          </p>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            placeholder="Contoh: Dokumen KTP tidak jelas, data tidak lengkap..."
          />
          <p className="text-xs text-text-muted">{rejectNote.length}/500 karakter</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowRejectModal(false)}>
              Batal
            </Button>
            <Button variant="danger" type="button" onClick={handleReject} disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Tolak Partner'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
