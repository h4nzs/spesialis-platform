import { useState, useEffect } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';

interface InitialAuth {
  userId: string;
  userEmail: string;
  userRole: string;
}

interface AuthNavProps {
  initialAuth?: InitialAuth | null;
}

const DASHBOARD_MAP: Record<string, string> = {
  customer: '/dashboard/customer',
  partner: '/dashboard/partner',
  corporate: '/dashboard/corporate',
  admin: '/dashboard/admin',
  super_admin: '/dashboard/admin',
  dispatcher: '/dashboard/admin',
  finance: '/dashboard/admin',
  content_manager: '/dashboard/admin',
};

// ── Shared client state (module-level) ─────────────────────────────
// AuthNav dirender 2x per halaman (desktop + mobile). Tanpa dedupe,
// keduanya fetch /auth/me terpisah → 2x request (2x 401 untuk tamu).
const CHECK_TTL_MS = 30_000;
let inFlightCheck: Promise<{ role: string } | 'guest'> | null = null;
let cachedCheck: { role: string } | 'guest' | null = null;
let cachedCheckAt = 0;

// Middleware menandai status login via cookie non-HttpOnly — tamu
// (mayoritas trafik) tidak perlu fetch /auth/me sama sekali.
function hasSessionCookie(): boolean {
  return /(?:^|;)\s*ap_signed_in=1(?:;|$)/.test(document.cookie);
}

function runCheck(): Promise<{ role: string } | 'guest'> {
  return (async () => {
    try {
      const api = createBrowserClient();
      const result = await api.get<{ user: { role: string } }>('/api/v1/auth/me');
      return { role: result.user.role };
    } catch {
      return 'guest';
    }
  })();
}

function getDashboardUrl(role: string): string {
  return DASHBOARD_MAP[role] ?? '/dashboard';
}

function getDashboardLabel(role: string): string {
  return role === 'admin' || role === 'super_admin' ? 'Admin Panel' : 'Dashboard';
}

function DashboardLink({ role }: { role: string }) {
  return (
    <a
      href={getDashboardUrl(role)}
      className="inline-flex items-center gap-2 rounded-md bg-warning-700 px-4 py-2 text-sm font-bold text-white shadow-xs transition-all duration-150 ease-out hover:bg-warning-800 hover:shadow-sm"
    >
      {getDashboardLabel(role)}
    </a>
  );
}

function GuestLinks() {
  return (
    <>
      <a href="/login" className="hover:text-text-primary transition-colors">
        Masuk
      </a>
      <a
        href="/register"
        className="inline-flex items-center gap-2 rounded-md bg-warning-700 px-4 py-2 text-sm font-bold text-white shadow-xs transition-all duration-150 ease-out hover:bg-warning-800 hover:shadow-sm"
      >
        Daftar
      </a>
    </>
  );
}

export function AuthNav({ initialAuth }: AuthNavProps) {
  // State: null = belum check, { role } = authenticated, 'guest' = not authenticated
  const [clientAuth, setClientAuth] = useState<{ role: string } | 'guest' | null>(null);

  useEffect(() => {
    // Tamu: cookie sinyal tidak ada → jangan fetch, langsung guest.
    if (!hasSessionCookie()) {
      setClientAuth('guest');
      return;
    }

    const now = Date.now();
    if (cachedCheck && now - cachedCheckAt < CHECK_TTL_MS) {
      setClientAuth(cachedCheck);
      return;
    }

    inFlightCheck ??= runCheck().finally(() => {
      inFlightCheck = null;
    });

    let cancelled = false;
    inFlightCheck.then((result) => {
      cachedCheck = result;
      cachedCheckAt = Date.now();
      if (!cancelled) {
        setClientAuth(result);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Client-side auth sudah selesai — override SSR initialAuth
  if (clientAuth !== null) {
    if (clientAuth === 'guest') {
      return <GuestLinks />;
    }
    return <DashboardLink role={clientAuth.role} />;
  }

  // Masih loading client check — fallback ke SSR initialAuth
  const user = initialAuth ? { role: initialAuth.userRole } : null;
  if (user) {
    return <DashboardLink role={user.role} />;
  }
  return <GuestLinks />;
}
