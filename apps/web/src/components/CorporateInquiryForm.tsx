import { useState } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { createCompanySchema } from '@specialist/validation';
import { Button, Input, Card } from '@specialist/ui';

export function CorporateInquiryForm() {
  const api = createBrowserClient();
  const [form, setForm] = useState({
    companyName: '',
    legalName: '',
    email: '',
    phone: '',
    industry: '',
    employeeCount: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    const parsed = createCompanySchema.safeParse({
      ...form,
      employeeCount: form.employeeCount ? Number(form.employeeCount) : undefined,
    });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return;
    }

    if (!form.password || form.password.length < 8) {
      setErrors(['Password minimal 8 karakter']);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/v1/companies', { body: { ...parsed.data, password: form.password } });
      setSuccess(true);
    } catch {
      setErrors(['Gagal mengirim. Silakan coba lagi.']);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-lg font-semibold text-success">Pendaftaran Terkirim!</p>
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
      {errors.length > 0 && (
        <div className="rounded-md bg-danger/10 p-3">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-danger">
              {err}
            </p>
          ))}
        </div>
      )}

      <Input
        label="Nama Perusahaan"
        value={form.companyName}
        onChange={(e) => setField('companyName', e.target.value)}
        required
      />
      <Input
        label="Nama Legal (sesuai akta)"
        value={form.legalName}
        onChange={(e) => setField('legalName', e.target.value)}
        required
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setField('email', e.target.value)}
        required
      />
      <Input
        label="Nomor HP"
        type="tel"
        value={form.phone}
        onChange={(e) => setField('phone', e.target.value)}
        required
      />
      <Input
        label="Industri"
        value={form.industry}
        onChange={(e) => setField('industry', e.target.value)}
        placeholder="Contoh: Hospitality, Pendidikan"
      />
      <Input
        label="Jumlah Karyawan"
        type="number"
        value={form.employeeCount}
        onChange={(e) => setField('employeeCount', e.target.value)}
      />
      <Input
        label="Buat Password"
        type="password"
        value={form.password}
        onChange={(e) => setField('password', e.target.value)}
        required
        placeholder="Minimal 8 karakter"
      />
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Mengirim...' : 'Daftar'}
      </Button>
    </form>
  );
}
