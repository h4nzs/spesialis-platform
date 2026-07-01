import { useState } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Button, Input, Textarea, Card } from '@specialist/ui';

export function CorporateInquiryForm() {
  const api = createBrowserClient();
  const [form, setForm] = useState({
    companyName: '', picName: '', email: '', phone: '', industry: '',
    employeeCount: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/api/v1/companies', {
        body: {
          companyName: form.companyName,
          picName: form.picName,
          email: form.email,
          phone: form.phone,
          industry: form.industry,
          employeeCount: Number(form.employeeCount) || undefined,
          message: form.message,
        },
      });
      setSuccess(true);
    } catch {
      setError('Gagal mengirim inquiry. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-lg font-semibold text-success">Inquiry Terkirim!</p>
        <p className="mt-2 text-sm text-text-muted">
          Tim kami akan menghubungi Anda dalam 1x24 jam.
        </p>
        <a href="/" className="mt-4 inline-block text-sm text-primary hover:underline">
          Kembali ke Beranda
        </a>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">{error}</div>}

      <Input label="Nama Perusahaan" value={form.companyName} onChange={(e) => setField('companyName', e.target.value)} required />
      <Input label="Nama PIC" value={form.picName} onChange={(e) => setField('picName', e.target.value)} required />
      <Input label="Email" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
      <Input label="Nomor HP" type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)} required />
      <Input label="Industri" value={form.industry} onChange={(e) => setField('industry', e.target.value)} placeholder="Contoh: Hospitality, Pendidikan" />
      <Input label="Jumlah Karyawan" type="number" value={form.employeeCount} onChange={(e) => setField('employeeCount', e.target.value)} />
      <Textarea label="Pesan" value={form.message} onChange={(e) => setField('message', e.target.value)} placeholder="Jelaskan kebutuhan layanan Anda" rows={4} />
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Mengirim...' : 'Kirim Inquiry'}
      </Button>
    </form>
  );
}
