import { useState } from 'react';
import { forgotPasswordSchema } from '@ahlipanggilan/validation';
import { Button } from '@ahlipanggilan/ui';
import { getApiClient } from '../lib/auth.ts';

interface FieldError {
  field: string;
  message: string;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [generalError, setGeneralError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setGeneralError('');

    const parsed = forgotPasswordSchema.safeParse({ email });
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
      await api.post('/api/v1/auth/forgot-password', { body: parsed.data });
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
        <div className="text-3xl mb-4">&#9993;</div>
        <h2 className="text-h5 font-semibold text-text-primary">Cek Email Anda</h2>
        <p className="mt-2 text-sm text-text-muted">
          Jika email terdaftar, kami telah mengirimkan link reset password ke{' '}
          <strong>{email}</strong>.
        </p>
        <div className="mt-6">
          <a
            href="/login"
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Kembali ke Login
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

      <Button type="submit" variant="primary" className="w-full" disabled={loading}>
        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
      </Button>

      <p className="text-center text-sm text-text-muted">
        Ingat password?{' '}
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
