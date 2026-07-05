import { useState, useEffect } from 'react';

function getTokenPayload(): { role: string } | null {
  try {
    const token = localStorage.getItem('spesialis_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ? { role: payload.role } : null;
  } catch {
    return null;
  }
}

export function AuthNav() {
  const [user, setUser] = useState<{ role: string } | null | false>(false);

  useEffect(() => {
    setUser(getTokenPayload());
  }, []);

  if (user === false) {
    return (
      <>
        <a href="/login" className="hover:text-text transition-colors">
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
