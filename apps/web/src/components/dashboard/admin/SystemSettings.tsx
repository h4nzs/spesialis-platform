import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Input, Button } from '@ahlipanggilan/ui';

export function SystemSettings() {
  const api = useMemo(() => createBrowserClient(), []);
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get<Record<string, Array<{ key: string; value: string; description: string | null }>>>(
        '/api/v1/admin/settings',
      )
      .then((data) => {
        const general = data.general ?? [];
        const name = general.find((s) => s.key === 'site_name');
        const desc = general.find((s) => s.key === 'site_description');
        if (name) setSiteName(name.value);
        if (desc) setSiteDescription(desc.value);

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
              key: 'site_name',
              value: siteName.trim(),
              category: 'general',
              description: 'Nama perusahaan',
            },
            {
              key: 'site_description',
              value: siteDescription.trim(),
              category: 'general',
              description: 'Deskripsi perusahaan',
            },
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
    <>
      <hr className="border-border-default" />
      <h2 className="mb-4 mt-8 text-lg font-semibold text-text-primary">Pengaturan Umum</h2>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div className="space-y-4">
          <Input
            label="Nama Perusahaan"
            placeholder="Ahli Panggilan"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-text-primary">
              Deskripsi Perusahaan
            </label>
            <textarea
              className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              rows={3}
              placeholder="Deskripsi singkat tentang perusahaan"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
            />
          </div>
        </div>

        <hr className="border-border-default" />
        <h2 className="mb-4 mt-8 text-lg font-semibold text-text-primary">Pengaturan WhatsApp</h2>
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
        {success && <p className="text-sm text-success-500">Pengaturan berhasil disimpan</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Semua'}
        </Button>
      </form>
    </>
  );
}
