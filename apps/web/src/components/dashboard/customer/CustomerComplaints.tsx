import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatDate } from '@specialist/shared';
import { Badge, Card, EmptyState } from '@specialist/ui';

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
}

export function CustomerComplaints() {
  const api = useMemo(() => createBrowserClient(), []);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Complaint[]>('/api/v1/complaints')
      .then((data) => setComplaints(Array.isArray(data) ? data : []))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, [api]);

  const statusColors: Record<string, 'default' | 'warning' | 'success' | 'danger' | 'info'> = {
    Open: 'danger',
    Investigating: 'warning',
    Resolved: 'success',
    Closed: 'default',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <div
            className="animate-skeleton h-10 w-36 rounded-lg bg-neutral-200"
            aria-hidden="true"
          />
        </div>
        <div className="rounded-xl border border-border-default bg-bg-surface p-4">
          <div
            className="animate-skeleton h-4 w-1/3 rounded-sm bg-neutral-200"
            aria-hidden="true"
          />
          <div
            className="mt-2 animate-skeleton h-3 w-2/3 rounded-sm bg-neutral-200"
            aria-hidden="true"
          />
          <div
            className="mt-2 animate-skeleton h-3 w-1/4 rounded-sm bg-neutral-200"
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <a
          href={`/dashboard/customer/complaints/new`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm"
        >
          Buat Komplain
        </a>
      </div>

      {complaints.length === 0 && <EmptyState title="Belum ada komplain" />}

      {complaints.map((c) => (
        <Card key={c.id}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-text-primary">{c.title}</p>
              <p className="mt-1 text-body-sm text-text-secondary">{c.description}</p>
              {c.resolution && (
                <p className="mt-2 text-body-sm text-success-700">Resolusi: {c.resolution}</p>
              )}
              <p className="mt-1 text-caption text-text-muted">{formatDate(c.createdAt)}</p>
            </div>
            <Badge variant={statusColors[c.status] ?? 'default'}>{c.status}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
