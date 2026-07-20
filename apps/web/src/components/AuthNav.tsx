interface InitialAuth {
  userId: string;
  userEmail: string;
  userRole: string;
}

interface AuthNavProps {
  initialAuth?: InitialAuth | null;
}

export function AuthNav({ initialAuth }: AuthNavProps) {
  const user: { role: string } | null = initialAuth ? { role: initialAuth.userRole } : null;

  if (!user) {
    return (
      <>
        <a href="/login" className="hover:text-text-primary transition-colors">
          Masuk
        </a>
        <a
          href="/register"
          className="inline-flex items-center gap-2 rounded-md bg-warning-600 px-4 py-2 text-sm font-bold text-white shadow-xs transition-all duration-150 ease-out hover:bg-warning-700 hover:shadow-sm"
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

  const dashboardUrl = dashboardMap[user.role] ?? '/dashboard';
  const label = user.role === 'admin' || user.role === 'super_admin' ? 'Admin Panel' : 'Dashboard';

  return (
    <a
      href={dashboardUrl}
      className="inline-flex items-center gap-2 rounded-md bg-warning-600 px-4 py-2 text-sm font-bold text-white shadow-xs transition-all duration-150 ease-out hover:bg-warning-700 hover:shadow-sm"
    >
      {label}
    </a>
  );
}
