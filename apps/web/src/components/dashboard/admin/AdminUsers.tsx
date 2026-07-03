import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Button, Input, Select, Table, Badge, Modal } from '@specialist/ui';
import type { Column } from '@specialist/ui';

interface UserItem {
  id: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: '', label: 'Semua Role' },
  { value: 'customer', label: 'Customer' },
  { value: 'partner', label: 'Partner' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'finance', label: 'Finance' },
  { value: 'content_manager', label: 'Content Manager' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'deleted', label: 'Deleted' },
];

const ROLE_LABELS: Record<string, string> = {
  customer: 'Customer',
  partner: 'Partner',
  corporate: 'Corporate',
  admin: 'Admin',
  super_admin: 'Super Admin',
  dispatcher: 'Dispatcher',
  finance: 'Finance',
  content_manager: 'Content Manager',
};

export function AdminUsers() {
  const api = createBrowserClient();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const result = await api.get<{ data: UserItem[] }>('/api/v1/admin/users', { params });
      setUsers(result?.data ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [roleFilter, statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadData();
  }

  function openStatusModal(user: UserItem) {
    setSelectedUser(user);
    setNewStatus(user.status);
    setShowStatusModal(true);
  }

  async function handleUpdateStatus() {
    if (!selectedUser || !newStatus || newStatus === selectedUser.status) {
      setShowStatusModal(false);
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/api/v1/admin/users/${selectedUser.id}/status`, {
        body: { status: newStatus },
      });
      setShowStatusModal(false);
      await loadData();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<UserItem>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (item) => (
        <div>
          <span className="font-medium text-text">{item.email}</span>
          <span className="ml-2 text-xs text-text-muted">{item.phone}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (item) => <Badge variant="default">{ROLE_LABELS[item.role] ?? item.role}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const variant =
          item.status === 'active'
            ? 'success'
            : item.status === 'pending'
              ? 'warning'
              : item.status === 'blocked' || item.status === 'suspended'
                ? 'danger'
                : 'default';
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: 'emailVerifiedAt',
      header: 'Email Terverifikasi',
      render: (item) => (item.emailVerifiedAt ? '✅' : '❌'),
    },
    {
      key: 'lastLoginAt',
      header: 'Terakhir Login',
      render: (item) =>
        item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleDateString('id-ID') : 'Tidak pernah',
    },
    {
      key: 'createdAt',
      header: 'Dibuat',
      render: (item) => new Date(item.createdAt).toLocaleDateString('id-ID'),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <Button size="sm" onClick={() => openStatusModal(item)}>
          Ubah Status
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <div className="min-w-[200px] flex-1">
          <Input
            placeholder="Cari email atau nomor HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={ROLE_OPTIONS}
          />
        </div>
        <div className="w-40">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
        <Button type="submit">Cari</Button>
      </form>

      {loading ? (
        <div className="text-sm text-text-muted py-8 text-center">Memuat...</div>
      ) : (
        <Table
          data={users}
          columns={columns}
          keyExtractor={(item) => item.id}
          emptyMessage="Tidak ada user ditemukan"
        />
      )}

      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Ubah Status - ${selectedUser?.email ?? ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Status saat ini: <strong>{selectedUser?.status}</strong>
          </p>
          <Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'blocked', label: 'Blocked' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'deleted', label: 'Deleted' },
            ]}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowStatusModal(false)}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleUpdateStatus}
              disabled={submitting || !newStatus || newStatus === selectedUser?.status}
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
