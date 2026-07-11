import { useState } from 'react';
import { resetPasswordSchema } from '@ahlipanggilan/validation';
import { Button } from '@ahlipanggilan/ui';
import { getApiClient } from '../lib/auth.ts';

interface FieldError {
  field: string;
  message: string;
}

interface Props {
  token: string;
}

export function ResetPasswordForm({ token }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [generalError, setGeneralError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setGeneralError('');

    const fieldErrors: FieldError[] = [];
    if (password !== confirmPassword) {
      fieldErrors.push({ field: 'confirmPassword', message: 'Password tidak cocok' });
    }

    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      const schemaErrors = parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      fieldErrors.push(...schemaErrors);
    }

    if (fieldErrors.length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const api = getApiClient();
      await api.post('/api/v1/auth/reset-password', { body: parsed!.data });
      setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="rounded-md border border-success/30 bg-success/5 px-6 py-8 text-center">
        <div className="text-3xl mb-4">&#10003;</div>
        <h2 className="text-h5 font-semibold text-text-primary">Password Berhasil Diubah</h2>
        <p className="mt-2 text-sm text-text-muted">Silakan masuk dengan password baru Anda.</p>
        <div className="mt-6">
          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Masuk
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {generalError && (
        <div className="rounded-md border border-danger-500/30 bg-danger-500/5 px-4 py-3 text-body text-danger-500">
          {generalError}
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-body-sm font-medium text-text-primary"
        >
          Password Baru
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-body text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
          placeholder="Min. 8 karakter"
          autoComplete="new-password"
        />
        {getFieldError('password') && (
          <p className="mt-1 text-caption text-danger-500">{getFieldError('password')}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-1.5 block text-body-sm font-medium text-text-primary"
        >
          Konfirmasi Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md border border-border-default bg-bg-surface px-4 py-2.5 text-body text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted"
          placeholder="Ulangi password"
          autoComplete="new-password"
        />
        {getFieldError('confirmPassword') && (
          <p className="mt-1 text-caption text-danger-500">{getFieldError('confirmPassword')}</p>
        )}
      </div>

      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Reset Password'}
      </Button>
    </form>
  );
}
