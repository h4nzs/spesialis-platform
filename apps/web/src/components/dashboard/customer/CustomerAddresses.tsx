import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';
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

export function CustomerAddresses() {
  const api = createBrowserClient();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get<Address[]>('/api/v1/addresses')
      .then((data) => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, []);

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
                    <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Utama</span>
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
        <p className="text-sm text-text-muted">Fitur tambah alamat akan segera tersedia</p>
      </Modal>
    </div>
  );
}
