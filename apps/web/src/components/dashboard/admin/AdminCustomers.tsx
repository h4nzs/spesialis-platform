import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import {
  Table,
  Badge,
  Button,
  EmptyState,
  CSVExportButton,
  TableSkeleton,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

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

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {customers.length > 0 && (
          <CSVExportButton
            data={customers as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'fullName', label: 'Nama' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'No. HP' },
              { key: 'status', label: 'Status' },
              { key: 'createdAt', label: 'Dibuat' },
            ]}
            filename="customer-export.csv"
          />
        )}
      </div>
      <Table
        columns={columns}
        data={customers}
        keyExtractor={(c) => c.id}
        emptyState={<EmptyState title="Belum ada customer" />}
      />
    </div>
  );
}
