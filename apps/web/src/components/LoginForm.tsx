import { useState } from 'react';
import { loginSchema } from '@specialist/validation';
import { Button } from '@specialist/ui';
import { getApiClient, redirectToDashboard } from '../lib/auth.ts';

interface FieldError {
  field: string;
  message: string;
}

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setGeneralError('');

    const parsed = loginSchema.safeParse({ email, password });
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
        refreshToken: string;
      }>('/api/v1/auth/login', { body: parsed.data });

      api.getTokenStore().setTokens(result.token, result.refreshToken);
      redirectToDashboard(result.user.role);
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
        <div className="rounded-md border border-danger-500/30 bg-danger-500/5 px-4 py-3 text-body text-danger-500">
          {generalError}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-body-sm font-medium text-text-primary">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-body text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
          placeholder="nama@email.com"
          autoComplete="email"
        />
        {getFieldError('email') && (
          <p className="mt-1 text-caption text-danger-500">{getFieldError('email')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-body-sm font-medium text-text-primary"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-body text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
          placeholder="Min. 8 karakter"
          autoComplete="current-password"
        />
        {getFieldError('password') && (
          <p className="mt-1 text-caption text-danger-500">{getFieldError('password')}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <a
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Lupa password?
        </a>
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? 'Memproses...' : 'Masuk'}
      </Button>

      <p className="text-center text-sm text-text-muted">
        Belum punya akun?{' '}
        <a
          href="/register"
          className="font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Daftar
        </a>
      </p>
    </form>
  );
}
