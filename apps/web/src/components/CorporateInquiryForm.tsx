import { useState } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { createCompanySchema } from '@ahlipanggilan/validation';
import { Button, Input, Card } from '@ahlipanggilan/ui';

const EMPLOYEE_OPTIONS = [
  { value: '1-9', label: 'Dibawah 10 orang' },
  { value: '10-50', label: '10 — 50 orang' },
  { value: '51+', label: 'Diatas 50 orang' },
] as const;

const EMPLOYEE_MAP: Record<string, number> = {
  '1-9': 5,
  '10-50': 30,
  '51+': 100,
};

export function CorporateInquiryForm() {
  const api = createBrowserClient();
  const [form, setForm] = useState({
    companyName: '',
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

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);

    const employeeCount = form.employeeCount ? EMPLOYEE_MAP[form.employeeCount] : undefined;

    const parsed = createCompanySchema.safeParse({
      companyName: form.companyName,
      email: form.email,
      phone: form.phone,
      industry: form.industry || undefined,
      employeeCount,
      password: form.password,
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
        <p className="mt-2 text-sm text-text-secondary">
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
        <div className="rounded-md bg-danger-500/10 p-3">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-danger-500">
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

      {/* Jumlah Karyawan — dropdown */}
      <div className="space-y-1.5">
        <label htmlFor="employeeCount" className="text-body-sm font-medium text-text-primary">
          Jumlah Karyawan
        </label>
        <select
          id="employeeCount"
          value={form.employeeCount}
          onChange={(e) => setField('employeeCount', e.target.value)}
          className="w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">Pilih jumlah karyawan</option>
          {EMPLOYEE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

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
