import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, formatDate, getStatusLabel } from '@specialist/shared';
import { Badge, Card, Button, Modal, Input, EmptyState } from '@specialist/ui';
import type { OrderStatus } from '@specialist/types';

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

export function PartnerJobs() {
  const api = useMemo(() => createBrowserClient(), []);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
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
      await loadJobs();
    } catch {
      // silent
    }
  }

  async function handleStart(orderId: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/start`);
      await loadJobs();
    } catch {
      // silent
    }
  }

  async function handleOnTheWay(orderId: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/on-the-way`);
      await loadJobs();
    } catch {
      // silent
    }
  }

  async function handleComplete(orderId: string) {
    try {
      await api.post(`/api/v1/bookings/${orderId}/complete`);
      await loadJobs();
    } catch {
      // silent
    }
  }

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  if (jobs.length === 0) {
    return <EmptyState title="Belum ada pekerjaan" />;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-text">{job.bookingNumber}</p>
              <p className="mt-1 text-sm text-text-muted">
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
