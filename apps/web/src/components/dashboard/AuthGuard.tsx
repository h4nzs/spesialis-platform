import { type ReactNode } from 'react';

interface StoredUser {
  id: string;
  email: string;
  role: string;
}

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string;
  initialUser?: StoredUser;
}

export function AuthGuard({ children, requiredRole, initialUser }: AuthGuardProps) {
  /* AuthGuard relies on Astro middleware for server-side auth check.
     initialUser is passed from DashboardLayout via Astro.locals.auth.
     The middleware redirects unauthenticated users to /login for /dashboard/* routes. */

  if (
    requiredRole &&
    initialUser &&
    initialUser.role !== requiredRole &&
    initialUser.role !== 'super_admin'
  ) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-text">Akses Ditolak</h2>
        <p className="text-sm text-text-muted">Anda tidak memiliki akses ke halaman ini</p>
        <a href="/" className="text-sm text-primary hover:underline">
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
