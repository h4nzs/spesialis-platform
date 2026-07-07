import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, formatDate } from '@specialist/shared';
import { Badge, Card } from '@specialist/ui';

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
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <a
          href={`/dashboard/customer/complaints/new`}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Buat Komplain
        </a>
      </div>

      {complaints.length === 0 && <p className="text-sm text-text-muted">Belum ada komplain</p>}

      {complaints.map((c) => (
        <Card key={c.id}>
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-text">{c.title}</p>
              <p className="mt-1 text-sm text-text-muted">{c.description}</p>
              {c.resolution && (
                <p className="mt-2 text-sm text-success">Resolusi: {c.resolution}</p>
              )}
              <p className="mt-1 text-xs text-text-muted">{formatDate(c.createdAt)}</p>
            </div>
            <Badge variant={statusColors[c.status] ?? 'default'}>{c.status}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
