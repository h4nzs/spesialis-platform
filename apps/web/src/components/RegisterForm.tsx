import { useState } from 'react';
import { registerSchema } from '@specialist/validation';
import { Button } from '@specialist/ui';
import { getApiClient, saveAuth, redirectToDashboard } from '../lib/auth.ts';

interface FieldError {
  field: string;
  message: string;
}

export function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setGeneralError('');

    const parsed = registerSchema.safeParse({ fullName, email, phone, password });
    if (!parsed.success) {
      setErrors(
        parsed.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      );
      return;
    }

    setLoading(true);
    try {
      const api = getApiClient();
      const result = await api.post<{
        user: { id: string; email: string; role: string };
        token: string;
      }>('/api/v1/auth/register', { body: parsed.data });

      saveAuth(result.user as never, result.token);
      api.getTokenStore().setTokens(result.token, '');
      redirectToDashboard();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setGeneralError(err.message);
      } else {
        setGeneralError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  }

  function getFieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {generalError && (
        <div className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {generalError}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-text">
          Nama Lengkap
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
          placeholder="Nama lengkap"
          autoComplete="name"
        />
        {getFieldError('fullName') && (
          <p className="mt-1 text-xs text-danger">{getFieldError('fullName')}</p>
        )}
      </div>

      <div>
        <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-text">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
          placeholder="nama@email.com"
          autoComplete="email"
        />
        {getFieldError('email') && (
          <p className="mt-1 text-xs text-danger">{getFieldError('email')}</p>
        )}
      </div>

      <div>
        <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium text-text">
          Nomor HP
        </label>
        <input
          id="reg-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
          placeholder="08123456789"
          autoComplete="tel"
        />
        {getFieldError('phone') && (
          <p className="mt-1 text-xs text-danger">{getFieldError('phone')}</p>
        )}
      </div>

      <div>
        <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-text">
          Password
        </label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
          placeholder="Min. 8 karakter, huruf besar, kecil, angka"
          autoComplete="new-password"
        />
        {getFieldError('password') && (
          <p className="mt-1 text-xs text-danger">{getFieldError('password')}</p>
        )}
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? 'Memproses...' : 'Daftar'}
      </Button>

      <p className="text-center text-sm text-text-muted">
        Sudah punya akun?{' '}
        <a
          href="/login"
          className="font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Masuk
        </a>
      </p>
    </form>
  );
}
