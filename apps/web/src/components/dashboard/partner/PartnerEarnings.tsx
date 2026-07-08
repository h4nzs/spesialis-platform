import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatDate, getStatusLabel, downloadCSV } from '@specialist/shared';
import { Card, Table, Badge, EmptyState } from '@specialist/ui';
import type { OrderStatus } from '@specialist/types';

interface JobItem {
  id: string;
  orderId: string;
  status: string;
  assignedAt: string;
  completedAt: string | null;
  orderStatus: string;
  bookingNumber: string;
}

export function PartnerEarnings() {
  const api = useMemo(() => createBrowserClient(), []);
  const [profile, setProfile] = useState<{
    completedJobs: number;
    ratingAverage: string | null;
  } | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/partners/me'),
      api.get<JobItem[]>('/api/v1/partners/me/jobs').catch(() => []),
    ])
      .then(([profileData, jobsData]) => {
        setProfile(profileData as typeof profile);
        setJobs(Array.isArray(jobsData) ? jobsData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  const completedJobs = jobs.filter((j) => ['Completed', 'Paid', 'Closed'].includes(j.orderStatus));

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  function handleExportCSV() {
    const headers = ['No. Booking', 'Status', 'Tgl Selesai'];
    const rows = completedJobs.map((j) => [
      j.bookingNumber,
      getStatusLabel(j.orderStatus as OrderStatus),
      j.completedAt ? formatDate(j.completedAt) : '-',
    ]);
    downloadCSV(headers, rows, 'riwayat-pekerjaan.csv');
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="lg">
          <p className="text-sm text-text-muted">Pekerjaan Selesai</p>
          <p className="mt-1 text-3xl font-bold text-text">{profile?.completedJobs ?? 0}</p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-text-muted">Rating</p>
          <p className="mt-1 text-3xl font-bold text-text">
            {profile?.ratingAverage ? Number(profile.ratingAverage).toFixed(1) : '-'}
          </p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-text-muted">Total Pekerjaan</p>
          <p className="mt-1 text-3xl font-bold text-text">{jobs.length}</p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-text-muted">Menunggu Pembayaran</p>
          <p className="mt-1 text-3xl font-bold text-text">
            {jobs.filter((j) => j.orderStatus === 'Waiting Payment').length}
          </p>
        </Card>
      </div>

      {completedJobs.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text">Riwayat Pekerjaan</h3>
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
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={[
                { key: 'bookingNumber', header: 'No. Booking' },
                {
                  key: 'orderStatus',
                  header: 'Status',
                  render: (row: JobItem) => (
                    <Badge variant="success">
                      {getStatusLabel(row.orderStatus as OrderStatus)}
                    </Badge>
                  ),
                },
                {
                  key: 'completedAt',
                  header: 'Selesai',
                  render: (row: JobItem) => (row.completedAt ? formatDate(row.completedAt) : '-'),
                },
              ]}
              data={completedJobs}
              keyExtractor={(j) => j.id}
              emptyState={<EmptyState title="Belum ada riwayat pekerjaan" />}
            />
          </div>
        </div>
      )}
    </div>
  );
}
