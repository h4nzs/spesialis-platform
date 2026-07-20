import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatDate, getStatusLabel } from '@ahlipanggilan/shared';
import {
  Card,
  Table,
  Badge,
  Pagination,
  EmptyState,
  Skeleton,
  CSVExportButton,
} from '@ahlipanggilan/ui';
import type { OrderStatus } from '@ahlipanggilan/types';

interface JobItem {
  id: string;
  orderId: string;
  status: string;
  assignedAt: string;
  completedAt: string | null;
  orderStatus: string;
  bookingNumber: string;
}

const PAGE_SIZE = 10;

export function PartnerEarnings() {
  const api = useMemo(() => createBrowserClient(), []);
  const [profile, setProfile] = useState<{
    completedJobs: number;
    ratingAverage: string | null;
  } | null>(null);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="lg">
              <Skeleton variant="text" className="w-1/2" />
              <div className="mt-2">
                <Skeleton variant="heading" className="w-1/3 h-8" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Pekerjaan Selesai</p>
          <p className="mt-1 text-h3 font-bold text-text-primary">{profile?.completedJobs ?? 0}</p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Rating</p>
          <p className="mt-1 text-h3 font-bold text-text-primary">
            {profile?.ratingAverage ? Number(profile.ratingAverage).toFixed(1) : '-'}
          </p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Total Pekerjaan</p>
          <p className="mt-1 text-h3 font-bold text-text-primary">{jobs.length}</p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Menunggu Pembayaran</p>
          <p className="mt-1 text-h3 font-bold text-text-primary">
            {jobs.filter((j) => j.orderStatus === 'Waiting Payment').length}
          </p>
        </Card>
      </div>

      {completedJobs.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-h5 text-text-primary">Riwayat Pekerjaan</h3>
            <CSVExportButton
              data={completedJobs as unknown as Record<string, unknown>[]}
              columns={[
                { key: 'bookingNumber', label: 'No. Booking' },
                {
                  key: 'orderStatus',
                  label: 'Status',
                  format: (v) => getStatusLabel(v as OrderStatus),
                },
                {
                  key: 'completedAt',
                  label: 'Tgl Selesai',
                  format: (v) => (v ? formatDate(v as string) : '-'),
                },
              ]}
              filename="riwayat-pekerjaan.csv"
            />
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
              data={completedJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
              keyExtractor={(j) => j.id}
              emptyState={<EmptyState title="Belum ada riwayat pekerjaan" />}
            />
            {completedJobs.length > PAGE_SIZE && (
              <Pagination
                page={page}
                totalPages={Math.ceil(completedJobs.length / PAGE_SIZE)}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
