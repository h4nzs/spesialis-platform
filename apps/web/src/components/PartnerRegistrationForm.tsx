import { useState } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Button, Input, Card } from '@specialist/ui';
import { partnerRegistrationSchema } from '@specialist/validation';

export function PartnerRegistrationForm() {
  const api = createBrowserClient();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    ktpNumber: '',
  });
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    const parsed = partnerRegistrationSchema.safeParse({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      ktpNumber: form.ktpNumber,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/api/v1/partners/register', { body: parsed.data });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registrasi gagal';
      setErrors([{ field: '', message: msg }]);
    } finally {
      setSubmitting(false);
    }
  }

  function getError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  if (success) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-lg font-semibold text-success">Registrasi Berhasil!</p>
        <p className="mt-2 text-sm text-text-muted">
          Akun Anda sedang menunggu verifikasi Admin. Kami akan menghubungi Anda setelah akun
          disetujui.
        </p>
        <a href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
          Masuk ke Akun
        </a>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.some((e) => !e.field) && (
        <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
          {errors.find((e) => !e.field)?.message}
        </div>
      )}

      <Input
        label="Nama Lengkap"
        value={form.fullName}
        onChange={(e) => setField('fullName', e.target.value)}
        placeholder="Masukkan nama lengkap"
        error={getError('fullName')}
        required
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setField('email', e.target.value)}
        placeholder="contoh@email.com"
        error={getError('email')}
        required
      />
      <Input
        label="Nomor HP"
        type="tel"
        value={form.phone}
        onChange={(e) => setField('phone', e.target.value)}
        placeholder="6281234567890"
        error={getError('phone')}
        required
      />
      <Input
        label="Nomor KTP"
        value={form.ktpNumber}
        onChange={(e) => setField('ktpNumber', e.target.value)}
        placeholder="16 digit nomor KTP"
        error={getError('ktpNumber')}
        required
      />
      <Input
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => setField('password', e.target.value)}
        placeholder="Minimal 8 karakter, huruf besar, huruf kecil, angka"
        error={getError('password')}
        required
      />
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Mendaftarkan...' : 'Daftar sebagai Mitra'}
      </Button>
      <p className="text-center text-xs text-text-muted">
        Sudah punya akun?{' '}
        <a href="/login" className="text-primary hover:underline">
          Masuk
        </a>
      </p>
    </form>
  );
}
