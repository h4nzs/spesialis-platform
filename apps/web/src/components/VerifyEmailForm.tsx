import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';

interface Props {
  token: string;
}

export function VerifyEmailForm({ token }: Props) {
  const api = createBrowserClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function verify() {
      try {
        await api.post('/api/v1/auth/verify-email', { body: { token } });
        setStatus('success');
        setMessage('Email berhasil diverifikasi!');
      } catch {
        setStatus('error');
        setMessage('Token verifikasi tidak valid atau sudah kadaluarsa.');
      }
    }
    verify();
  }, []);

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-text-muted">Memverifikasi email...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
          status === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}
      >
        {status === 'success' ? '✓' : '✕'}
      </div>
      <h1
        className={`mt-4 text-2xl font-bold ${status === 'success' ? 'text-success' : 'text-danger'}`}
      >
        {status === 'success' ? 'Email Terverifikasi' : 'Verifikasi Gagal'}
      </h1>
      <p className="mt-2 text-text-muted">{message}</p>
      <a
        href={status === 'success' ? '/dashboard/customer' : '/login'}
        className="mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-white"
      >
        {status === 'success' ? 'Lanjut ke Dashboard' : 'Kembali ke Login'}
      </a>
    </div>
  );
}
