import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import {
  Button,
  Input,
  Select,
  Table,
  Badge,
  Modal,
  EmptyState,
  CSVExportButton,
  TableSkeleton,
} from '@specialist/ui';
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

const ROLE_SELECT_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'partner', label: 'Partner' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'dispatcher', label: 'Dispatcher' },
  { value: 'finance', label: 'Finance' },
  { value: 'content_manager', label: 'Content Manager' },
];

/** Decode JWT payload from cookie without crypto (client-side only). */
function decodeJwtFromCookie(): { sub: string; email: string; role: string } | null {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  if (!match?.[1]) return null;
  try {
    const b64 = match[1].split('.')[1];
    if (!b64) return null;
    const json = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    if (payload.sub && payload.email && payload.role) {
      return { sub: payload.sub, email: payload.email, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}

export function AdminUsers() {
  const api = useMemo(() => createBrowserClient(), []);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newRole, setNewRole] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    const decoded = decodeJwtFromCookie();
    if (decoded?.role) {
      setCurrentUserRole(decoded.role);
    }
  }, []);

  const loadData = useCallback(
    async (searchTerm?: string) => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { limit: 100 };
        if (searchTerm) params.search = searchTerm;
        if (roleFilter) params.role = roleFilter;
        if (statusFilter) params.status = statusFilter;

        const result = await api.get<UserItem[]>('/api/v1/admin/users', { params });
        setUsers(Array.isArray(result) ? result : []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [roleFilter, statusFilter, api],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    loadData(search);
  }

  function openStatusModal(user: UserItem) {
    setSelectedUser(user);
    setNewStatus(user.status);
    setShowStatusModal(true);
  }

  function openRoleModal(user: UserItem) {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
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

  async function handleUpdateRole() {
    if (!selectedUser || !newRole || newRole === selectedUser.role) {
      setShowRoleModal(false);
      return;
    }
    setSubmitting(true);
    try {
      await api.patch(`/api/v1/admin/users/${selectedUser.id}/role`, {
        body: { role: newRole },
      });
      setShowRoleModal(false);
      await loadData();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  const isSuperAdmin = currentUserRole === 'super_admin';

  const columns: Column<UserItem>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (item) => (
        <div>
          <span className="font-medium text-text-primary">{item.email}</span>
          <span className="ml-2 text-xs text-text-secondary">{item.phone}</span>
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
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => openRoleModal(item)}>
            Ubah Role
          </Button>
          <Button size="sm" onClick={() => openStatusModal(item)}>
            Ubah Status
          </Button>
        </div>
      ),
    },
  ];

  /** Filter out super_admin option for non-super_admin users. */
  const roleModalOptions = ROLE_SELECT_OPTIONS.filter(
    (opt) => isSuperAdmin || opt.value !== 'super_admin',
  );

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
        <TableSkeleton toolbarWidth="w-64" />
      ) : (
        <>
          {users.length > 0 && (
            <div className="flex items-center justify-end">
              <CSVExportButton
                data={users as unknown as Record<string, unknown>[]}
                columns={[
                  { key: 'email', label: 'Email' },
                  { key: 'phone', label: 'No. HP' },
                  {
                    key: 'role',
                    label: 'Role',
                    format: (v) => ROLE_LABELS[v as string] ?? String(v),
                  },
                  { key: 'status', label: 'Status' },
                  {
                    key: 'emailVerifiedAt',
                    label: 'Email Terverifikasi',
                    format: (v) => (v ? 'Ya' : 'Tidak'),
                  },
                  {
                    key: 'lastLoginAt',
                    label: 'Terakhir Login',
                    format: (v) =>
                      v ? new Date(v as string).toLocaleDateString('id-ID') : 'Tidak pernah',
                  },
                  {
                    key: 'createdAt',
                    label: 'Dibuat',
                    format: (v) => new Date(v as string).toLocaleDateString('id-ID'),
                  },
                ]}
                filename="user-export.csv"
              />
            </div>
          )}
          <Table
            data={users}
            columns={columns}
            keyExtractor={(item) => item.id}
            emptyState={<EmptyState title="Tidak ada user ditemukan" />}
          />
        </>
      )}

      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Ubah Status - ${selectedUser?.email ?? ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
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

      <Modal
        open={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={`Ubah Role - ${selectedUser?.email ?? ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Role saat ini:{' '}
            <strong>{ROLE_LABELS[selectedUser?.role ?? ''] ?? selectedUser?.role}</strong>
          </p>
          {!isSuperAdmin && (
            <p className="text-xs text-warning-500 bg-warning-100 rounded-md px-3 py-2">
              Anda tidak dapat memberikan role <strong>Super Admin</strong>.
            </p>
          )}
          <Select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            options={roleModalOptions}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowRoleModal(false)}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleUpdateRole}
              disabled={submitting || !newRole || newRole === selectedUser?.role}
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
