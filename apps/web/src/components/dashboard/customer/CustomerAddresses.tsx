import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { createAddressSchema } from '@specialist/validation';
import { Card, Button, Input, Modal } from '@specialist/ui';

interface Address {
  id: string;
  label: string | null;
  address: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  receiverName: string;
  receiverPhone: string;
  isDefault: boolean;
}

const emptyForm = {
  label: '',
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  postalCode: '',
  address: '',
  isDefault: false,
};

export function CustomerAddresses() {
  const api = createBrowserClient();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api
      .get<Address[]>('/api/v1/addresses')
      .then((data) => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, []);

  function setField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    const parsed = createAddressSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(parsed.error.issues.map((i) => i.message).join(', '));
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/v1/addresses', { body: parsed.data });
      setForm(emptyForm);
      setShowForm(false);
      const data = await api.get<Address[]>('/api/v1/addresses');
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setFormError('Gagal menyimpan alamat');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/v1/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silent
    }
  }

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>Tambah Alamat</Button>
      </div>

      {addresses.length === 0 && (
        <p className="text-sm text-text-muted">Belum ada alamat tersimpan</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <Card key={addr.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-text">
                  {addr.label ?? 'Alamat'}
                  {addr.isDefault && (
                    <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      Utama
                    </span>
                  )}
                </p>
                <p className="mt-1 text-sm text-text-muted">{addr.receiverName}</p>
                <p className="text-sm text-text-muted">{addr.receiverPhone}</p>
                <p className="mt-1 text-xs text-text-muted">
                  {addr.address}, {addr.city}, {addr.province} {addr.postalCode}
                </p>
              </div>
              <button
                onClick={() => handleDelete(addr.id)}
                className="text-xs text-danger hover:underline cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Tambah Alamat Baru">
        <form onSubmit={handleSubmit} className="space-y-3">
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <Input
            label="Label"
            value={form.label}
            onChange={(e) => setField('label', e.target.value)}
            placeholder="Contoh: Rumah, Kantor"
          />
          <Input
            label="Nama Penerima"
            value={form.receiverName}
            onChange={(e) => setField('receiverName', e.target.value)}
            required
          />
          <Input
            label="No. HP Penerima"
            value={form.receiverPhone}
            onChange={(e) => setField('receiverPhone', e.target.value)}
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Provinsi"
              value={form.province}
              onChange={(e) => setField('province', e.target.value)}
              required
            />
            <Input
              label="Kota"
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              required
            />
            <Input
              label="Kecamatan"
              value={form.district}
              onChange={(e) => setField('district', e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Kode Pos"
              value={form.postalCode}
              onChange={(e) => setField('postalCode', e.target.value)}
              required
            />
            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setField('isDefault', e.target.checked)}
                className="rounded border-border"
              />
              Jadikan alamat utama
            </label>
          </div>
          <Input
            label="Alamat Lengkap"
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
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
