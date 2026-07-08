import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, downloadCSV } from '@specialist/shared';
import { Table, Badge, Button } from '@specialist/ui';
import type { Column } from '@specialist/ui';

interface CustomerItem {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  status: string;
  createdAt: string;
}

export function AdminCustomers() {
  const api = useMemo(() => createBrowserClient(), []);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    api
      .get<CustomerItem[]>('/api/v1/customers')
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, [api]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  async function handleStatusChange(id: string, status: string) {
    try {
      await api.patch(`/api/v1/customers/${id}/status`, { body: { status } });
      fetchCustomers();
    } catch {
      // silent
    }
  }

  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      active: 'success',
      suspended: 'warning',
      blocked: 'danger',
      pending: 'warning',
      deleted: 'danger',
    };
    return (
      <Badge
        variant={(colors[status] ?? 'default') as 'success' | 'warning' | 'danger' | 'default'}
      >
        {status}
      </Badge>
    );
  }

  const columns: Column<CustomerItem>[] = [
    { key: 'fullName', header: 'Nama' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'No. HP' },
    {
      key: 'status',
      header: 'Status',
      render: (c) => getStatusBadge(c.status),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (c) => (
        <div className="flex gap-2">
          {c.status === 'active' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleStatusChange(c.id, 'suspended')}
            >
              Suspends
            </Button>
          )}
          {c.status === 'suspended' && (
            <Button variant="primary" size="sm" onClick={() => handleStatusChange(c.id, 'active')}>
              Aktifkan
            </Button>
          )}
          {c.status !== 'blocked' && (
            <Button variant="danger" size="sm" onClick={() => handleStatusChange(c.id, 'blocked')}>
              Blokir
            </Button>
          )}
        </div>
      ),
    },
  ];

  function handleExportCSV() {
    const headers = ['Nama', 'Email', 'No. HP', 'Status', 'Dibuat'];
    const rows = customers.map((c) => [c.fullName, c.email, c.phone, c.status, c.createdAt]);
    downloadCSV(headers, rows, 'customer-export.csv');
  }

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {customers.length > 0 && (
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
        data={customers}
        keyExtractor={(c) => c.id}
        emptyMessage="Belum ada customer"
      />
    </div>
  );
}
