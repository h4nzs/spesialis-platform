import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, formatDate, getStatusLabel } from '@ahlipanggilan/shared';
import {
  Badge,
  Card,
  Button,
  Modal,
  Input,
  Pagination,
  EmptyState,
  Skeleton,
} from '@ahlipanggilan/ui';
import type { OrderStatus } from '@ahlipanggilan/types';

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

const PAGE_SIZE = 10;

export function PartnerJobs() {
  const api = useMemo(() => createBrowserClient(), []);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<JobItem[]>('/api/v1/partners/me/jobs');
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  async function handleAccept(orderId: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/accept`);
      setPage(1);
      await loadJobs();
    } catch {
      // silent
    }
  }

  async function handleReject(orderId: string, reason: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/reject`, { body: { reason } });
      setRejectTarget(null);
      setRejectReason('');
      setPage(1);
      await loadJobs();
    } catch {
      // silent
    }
  }

  async function handleStart(orderId: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/start`);
      setPage(1);
      await loadJobs();
    } catch {
      // silent
    }
  }

  async function handleOnTheWay(orderId: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/on-the-way`);
      setPage(1);
      await loadJobs();
    } catch {
      // silent
    }
  }

  async function handleComplete(orderId: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/complete`);
      setPage(1);
      await loadJobs();
    } catch {
      // silent
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card padding="md">
          <Skeleton variant="text" className="w-1/3" />
          <div className="mt-3">
            <Skeleton variant="text" className="w-1/4" />
          </div>
          <div className="mt-4">
            <Skeleton variant="text" className="w-20" />
          </div>
        </Card>
        <Card padding="md">
          <Skeleton variant="text" className="w-1/2" />
          <div className="mt-3">
            <Skeleton variant="text" className="w-1/4" />
          </div>
          <div className="mt-4">
            <Skeleton variant="text" className="w-20" />
          </div>
        </Card>
      </div>
    );
  }

  if (jobs.length === 0) {
    return <EmptyState title="Belum ada pekerjaan" />;
  }

  const paginatedJobs = jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {paginatedJobs.map((job) => (
        <Card key={job.id}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-text-primary">{job.bookingNumber}</p>
              <p className="mt-1 text-body-sm text-text-muted">
                Ditugaskan: {formatDate(job.assignedAt)}
              </p>
              <div className="mt-2">
                <Badge variant="default">{getStatusLabel(job.orderStatus as OrderStatus)}</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {job.orderStatus === 'Partner Assigned' && (
                <>
                  <Button size="sm" onClick={() => handleAccept(job.orderId)}>
                    Terima
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setRejectTarget(job.orderId)}>
                    Tolak
                  </Button>
                </>
              )}
              {job.orderStatus === 'Partner Accepted' && (
                <Button size="sm" onClick={() => handleOnTheWay(job.orderId)}>
                  Dalam Perjalanan
                </Button>
              )}
              {job.orderStatus === 'On The Way' && (
                <Button size="sm" onClick={() => handleStart(job.orderId)}>
                  Mulai
                </Button>
              )}
              {job.orderStatus === 'Working' && (
                <Button size="sm" variant="primary" onClick={() => handleComplete(job.orderId)}>
                  Selesaikan
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      {jobs.length > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(jobs.length / PAGE_SIZE)}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={rejectTarget !== null}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason('');
        }}
        title="Alasan Penolakan"
      >
        <div className="space-y-3">
          <Input
            label="Alasan"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Jelaskan mengapa menolak"
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason('');
              }}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              disabled={!rejectReason.trim()}
              onClick={() => rejectTarget && handleReject(rejectTarget, rejectReason)}
            >
              Kirim
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
