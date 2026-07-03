import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Table, Button } from '@specialist/ui';
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
  const api = createBrowserClient();
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPartners() {
    setLoading(true);
    try {
      const data = await api.get<PartnerItem[]>('/api/v1/partners');
      setPartners(Array.isArray(data) ? data : []);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPartners();
  }, []);

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

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <Table
      columns={columns}
      data={partners}
      keyExtractor={(p) => p.id}
      emptyMessage="Belum ada partner"
    />
  );
}
