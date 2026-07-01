import { useEffect, type ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
  fallback?: ReactNode;
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const token = typeof localStorage !== 'undefined'
    ? localStorage.getItem('spesialis_access_token')
    : null;
  const userRaw = typeof localStorage !== 'undefined'
    ? localStorage.getItem('spesialis_user')
    : null;
  const user = userRaw ? (JSON.parse(userRaw) as { role?: string } | null) : null;

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    }
  }, [token]);

  if (!token) {
    return fallback ? <>{fallback}</> : null;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'super_admin') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-text">Akses Ditolak</h2>
        <p className="text-sm text-text-muted">Anda tidak memiliki akses ke halaman ini</p>
        <a href="/" className="text-sm text-primary hover:underline">Kembali ke Beranda</a>
      </div>
    );
  }

  return <>{children}</>;
}
