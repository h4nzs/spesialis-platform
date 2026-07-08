import { useState, useEffect } from 'react';

function getToken(): string | null {
  try {
    return localStorage.getItem('spesialis_access_token');
  } catch {
    return null;
  }
}

export function AuthNav() {
  const [user, setUser] = useState<{ role: string } | null | false>(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    const apiUrl =
      (typeof import.meta !== 'undefined' &&
        (import.meta as { env?: Record<string, string | undefined> }).env?.PUBLIC_API_URL) ||
      'http://localhost:3000';
    fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setUser(json?.data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  if (!user) {
    return (
      <>
        <a href="/login" className="hover:text-text-primary transition-colors">
          Masuk
        </a>
        <a
          href="/register"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Daftar
        </a>
      </>
    );
  }

  const dashboardMap: Record<string, string> = {
    customer: '/dashboard/customer',
    partner: '/dashboard/partner',
    corporate: '/dashboard/corporate',
    admin: '/dashboard/admin',
    super_admin: '/dashboard/admin',
    dispatcher: '/dashboard/admin',
    finance: '/dashboard/admin',
    content_manager: '/dashboard/admin',
  };

  const dashboardUrl = user ? (dashboardMap[user.role] ?? '/dashboard') : '/login';

  return (
    <a
      href={dashboardUrl}
      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
    >
      Dashboard
    </a>
  );
}
