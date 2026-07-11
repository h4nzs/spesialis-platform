import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import {
  Button,
  Input,
  Modal,
  Table,
  EmptyState,
  CSVExportButton,
  TableSkeleton,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string | null;
}

interface CompanyProfile {
  id: string;
}

export function CorporateBranches() {
  const api = useMemo(() => createBrowserClient(), []);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadCompany = useCallback(async () => {
    try {
      const data = (await api.get('/api/v1/companies/me')) as CompanyProfile | null;
      if (data) setProfile(data);
      return data;
    } catch {
      return null;
    }
  }, [api]);

  const loadBranches = useCallback(
    async (companyId: string) => {
      try {
        const data = await api.get<Branch[]>(`/api/v1/companies/${companyId}/branches`);
        setBranches(Array.isArray(data) ? data : []);
      } catch {
        setBranches([]);
      } finally {
        setLoading(false);
      }
    },
    [api],
  );

  useEffect(() => {
    loadCompany().then((data) => {
      if (data) loadBranches(data.id);
      else setLoading(false);
    });
  }, [loadCompany, loadBranches]);

  async function handleAdd(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) return;
    if (!form.name || !form.address || !form.city) {
      setError('Nama, alamat, dan kota wajib diisi');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/v1/companies/${profile.id}/branches`, { body: form });
      setShowModal(false);
      setForm({ name: '', address: '', city: '', phone: '' });
      await loadBranches(profile.id);
    } catch {
      setError('Gagal menambahkan cabang');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(branchId: string) {
    if (!profile) return;
    try {
      await api.delete(`/api/v1/companies/${profile.id}/branches/${branchId}`);
      await loadBranches(profile.id);
    } catch {
      // silent
    }
  }

  const columns: Column<Branch>[] = [
    { key: 'name', header: 'Nama' },
    { key: 'address', header: 'Alamat' },
    { key: 'city', header: 'Kota' },
    {
      key: 'phone',
      header: 'Telepon',
      render: (item) => item.phone ?? '-',
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
          Hapus
        </Button>
      ),
    },
  ];

  if (loading) return <TableSkeleton toolbarWidth="w-28" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {branches.length > 0 && (
          <CSVExportButton
            data={branches as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'name', label: 'Nama' },
              { key: 'address', label: 'Alamat' },
              { key: 'city', label: 'Kota' },
              {
                key: 'phone',
                label: 'Telepon',
                format: (v) => (v as string) ?? '-',
              },
            ]}
            filename="cabang-export.csv"
          />
        )}
        <Button onClick={() => setShowModal(true)}>Tambah Cabang</Button>
      </div>

      <Table
        data={branches}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyState={<EmptyState title="Belum ada cabang" />}
      />

      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setError('');
        }}
        title="Tambah Cabang"
      >
        <form onSubmit={handleAdd} className="space-y-3">
          {error && <p className="text-sm text-danger">{error}</p>}
          <Input
            label="Nama Cabang"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Alamat"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            required
          />
          <Input
            label="Kota"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
          />
          <Input
            label="Telepon"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
