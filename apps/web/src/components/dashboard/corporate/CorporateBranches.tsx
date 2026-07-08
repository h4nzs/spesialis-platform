import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient, downloadCSV } from '@specialist/shared';
import { Button, Input, Modal, Table } from '@specialist/ui';
import type { Column } from '@specialist/ui';

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

  function handleExportCSV() {
    const headers = ['Nama', 'Alamat', 'Kota', 'Telepon'];
    const rows = branches.map((b) => [b.name, b.address, b.city, b.phone ?? '-']);
    downloadCSV(headers, rows, 'cabang-export.csv');
  }

  if (loading) return <div className="text-sm text-text-muted py-8 text-center">Memuat...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {branches.length > 0 && (
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
        <Button onClick={() => setShowModal(true)}>Tambah Cabang</Button>
      </div>

      <Table
        data={branches}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyMessage="Belum ada cabang"
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
