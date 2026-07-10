import type { UserRole } from '@specialist/types';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

// A curated subset of nav items — most-used pages only, to fit on mobile
const MOBILE_NAV_MAP: Record<string, NavItem[]> = {
  customer: [
    { href: '/dashboard/customer', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/customer/orders', label: 'Pesanan', icon: 'orders' },
    { href: '/dashboard/customer/settings', label: 'Pengaturan', icon: 'settings' },
  ],
  partner: [
    { href: '/dashboard/partner', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/partner/jobs', label: 'Pekerjaan', icon: 'jobs' },
    { href: '/dashboard/partner/earnings', label: 'Pendapatan', icon: 'wallet' },
    { href: '/dashboard/partner/settings', label: 'Pengaturan', icon: 'settings' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/admin/bookings', label: 'Booking', icon: 'orders' },
    { href: '/dashboard/admin/media', label: 'Media', icon: 'file' },
    { href: '/dashboard/admin/invoices', label: 'Invoice', icon: 'receipt' },
    { href: '/dashboard/admin/contracts', label: 'Kontrak', icon: 'scrollText' },
    { href: '/dashboard/admin/settings', label: 'Pengaturan', icon: 'settings' },
  ],
  super_admin: [
    { href: '/dashboard/admin', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/admin/bookings', label: 'Booking', icon: 'orders' },
    { href: '/dashboard/admin/media', label: 'Media', icon: 'file' },
    { href: '/dashboard/admin/invoices', label: 'Invoice', icon: 'receipt' },
    { href: '/dashboard/admin/contracts', label: 'Kontrak', icon: 'scrollText' },
    { href: '/dashboard/admin/settings', label: 'Pengaturan', icon: 'settings' },
  ],
  finance: [
    { href: '/dashboard/finance', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/admin/bookings', label: 'Booking', icon: 'orders' },
    { href: '/dashboard/admin/invoices', label: 'Invoice', icon: 'receipt' },
    { href: '/dashboard/admin/contracts', label: 'Kontrak', icon: 'scrollText' },
    { href: '/dashboard/admin/reports', label: 'Laporan', icon: 'barChart' },
  ],
  corporate: [
    { href: '/dashboard/corporate', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/corporate/orders', label: 'Pesanan', icon: 'orders' },
    { href: '/dashboard/corporate/invoices', label: 'Invoice', icon: 'receipt' },
    { href: '/dashboard/corporate/settings', label: 'Pengaturan', icon: 'settings' },
  ],
};

// Lucide icon SVGs as raw HTML strings (reused subset from Sidebar.tsx)
const ICON_SVGS: Record<string, string> = {
  dashboard:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3"/><rect width="7" height="5" x="14" y="3"/><rect width="7" height="9" x="14" y="12"/><rect width="7" height="5" x="3" y="16"/></svg>',
  orders:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2"/></svg>',
  jobs: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',
  wallet:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
  settings:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  receipt:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2 1Z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>',
  scrollText:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2"/></svg>',
  barChart:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>',
  file: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
};

function Icon({ name }: { name: string }) {
  const svg = ICON_SVGS[name];
  if (!svg) return null;
  return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function MobileBottomNav({ role, currentPath }: { role: UserRole; currentPath?: string }) {
  const items = MOBILE_NAV_MAP[role] ?? MOBILE_NAV_MAP.customer!;
  const path = currentPath ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  function isActive(href: string) {
    return path === href || path.startsWith(href + '/');
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border-default bg-bg-surface pb-1 sm:hidden"
      aria-label="Navigasi mobile"
    >
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-2 text-caption font-medium transition-colors duration-150 ${
              active ? 'text-primary-600' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            <span
              className={`transition-colors duration-150 ${active ? 'text-primary-500' : 'text-text-muted'}`}
            >
              <Icon name={item.icon} />
            </span>
            <span>{item.label}</span>
            {active && (
              <span className="mt-0.5 h-1 w-5 rounded-full bg-primary-500" aria-hidden="true" />
            )}
          </a>
        );
      })}
    </nav>
  );
}
