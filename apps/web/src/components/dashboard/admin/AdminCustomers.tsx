import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Table } from '@specialist/ui';
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

  useEffect(() => {
    api.get<CustomerItem[]>('/api/v1/customers')
      .then((data) => setCustomers(Array.isArray(data) ? data : []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<CustomerItem>[] = [
    { key: 'fullName', header: 'Nama' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'No. HP' },
    { key: 'status', header: 'Status' },
  ];

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <Table columns={columns} data={customers} keyExtractor={(c) => c.id} emptyMessage="Belum ada customer" />
  );
}
