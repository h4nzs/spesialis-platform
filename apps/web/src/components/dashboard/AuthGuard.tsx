import { type ReactNode } from 'react';

interface StoredUser {
  id: string;
  email: string;
  role: string;
}

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: string | string[];
  initialUser?: StoredUser;
}

export function AuthGuard({ children, requiredRole, initialUser }: AuthGuardProps) {
  /* AuthGuard relies on Astro middleware for server-side auth check.
     initialUser is passed from DashboardLayout via Astro.locals.auth.
     The middleware redirects unauthenticated users to /login for /dashboard/* routes. */

  if (requiredRole && initialUser) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // super_admin can access any dashboard
    allowedRoles.push('super_admin');

    if (!allowedRoles.includes(initialUser.role)) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold text-text-primary">Akses Ditolak</h2>
          <p className="text-sm text-text-primary-secondary">
            Anda tidak memiliki akses ke halaman ini
          </p>
          <a href="/" className="text-sm text-primary hover:underline">
            Kembali ke Beranda
          </a>
        </div>
      );
    }
  }

  return <>{children}</>;
}
