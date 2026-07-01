import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';
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
  const api = createBrowserClient();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchCustomers() {
    setLoading(true);
    api
      .get<CustomerItem[]>('/api/v1/customers')
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <Table
      columns={columns}
      data={customers}
      keyExtractor={(c) => c.id}
      emptyMessage="Belum ada customer"
    />
  );
}
