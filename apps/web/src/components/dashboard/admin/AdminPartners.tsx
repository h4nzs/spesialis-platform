import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, downloadCSV } from '@specialist/shared';
import { Table, Button, EmptyState } from '@specialist/ui';
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

  async function handleVerify(partnerId: string, status: string) {
    try {
      await api.post(`/api/v1/partners/${partnerId}/verify`, {
        body: { verificationStatus: status },
      });
      await loadPartners();
    } catch {
      // silent
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
          {item.verificationStatus === 'Pending' && (
            <>
              <Button size="sm" onClick={() => handleVerify(item.id, 'Approved')}>
                Setujui
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleVerify(item.id, 'Rejected')}>
                Tolak
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  function handleExportCSV() {
    const headers = ['Nama', 'Verifikasi', 'Ketersediaan', 'Pekerjaan', 'Rating'];
    const rows = partners.map((p) => [
      p.fullName,
      p.verificationStatus,
      p.availability,
      String(p.completedJobs),
      p.ratingAverage ? Number(p.ratingAverage).toFixed(1) : '-',
    ]);
    downloadCSV(headers, rows, 'partner-export.csv');
  }

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {partners.length > 0 && (
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface"
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
      </div>
      <Table
        columns={columns}
        data={partners}
        keyExtractor={(p) => p.id}
        emptyState={<EmptyState title="Belum ada partner" />}
      />
    </div>
  );
}
