import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Input, Button } from '@ahlipanggilan/ui';

export function SystemSettings() {
  const api = useMemo(() => createBrowserClient(), []);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get<Record<string, Array<{ key: string; value: string }>>>('/api/v1/admin/settings')
      .then((data) => {
        const whatsapp = data.whatsapp ?? [];
        const phone = whatsapp.find((s) => s.key === 'whatsapp_phone_number');
        if (phone) setWhatsappPhone(phone.value);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!whatsappPhone.trim()) {
      setError('Nomor WhatsApp tidak boleh kosong');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/api/v1/admin/settings', {
        body: {
          settings: [
            {
              key: 'whatsapp_phone_number',
              value: whatsappPhone.trim(),
              category: 'whatsapp',
              description: 'Nomor WhatsApp untuk tombol WA di halaman publik',
            },
          ],
        },
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-secondary">Memuat pengaturan...</p>;
  }

  return (
    <section>
      <hr className="border-border-default" />
      <h2 className="mb-4 mt-8 text-lg font-semibold text-text-primary">Pengaturan WhatsApp</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <Input
          label="Nomor WhatsApp"
          placeholder="6281234567890"
          value={whatsappPhone}
          onChange={(e) => setWhatsappPhone(e.target.value)}
        />
        <p className="text-xs text-text-muted">
          Nomor ini akan digunakan untuk tombol WhatsApp di halaman publik. Gunakan format
          internasional tanpa tanda + (contoh: 6281234567890).
        </p>
        {error && <p className="text-sm text-danger-500">{error}</p>}
        {success && <p className="text-sm text-success-500">Nomor WhatsApp berhasil disimpan</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </section>
  );
}
