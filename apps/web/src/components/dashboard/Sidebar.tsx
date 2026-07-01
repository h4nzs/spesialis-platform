import { useState } from 'react';
import type { UserRole } from '@specialist/types';

interface NavItem {
  href: string;
  label: string;
}

const NAV_MAP: Record<string, NavItem[]> = {
  customer: [
    { href: '/dashboard/customer', label: 'Ringkasan' },
    { href: '/dashboard/customer/orders', label: 'Pesanan' },
    { href: '/dashboard/customer/addresses', label: 'Alamat' },
    { href: '/dashboard/customer/reviews', label: 'Ulasan' },
    { href: '/dashboard/customer/complaints', label: 'Komplain' },
    { href: '/dashboard/customer/settings', label: 'Pengaturan' },
  ],
  partner: [
    { href: '/dashboard/partner', label: 'Ringkasan' },
    { href: '/dashboard/partner/jobs', label: 'Pekerjaan' },
    { href: '/dashboard/partner/availability', label: 'Ketersediaan' },
    { href: '/dashboard/partner/earnings', label: 'Pendapatan' },
    { href: '/dashboard/partner/reviews', label: 'Ulasan' },
    { href: '/dashboard/partner/settings', label: 'Pengaturan' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Ringkasan' },
    { href: '/dashboard/admin/bookings', label: 'Booking' },
    { href: '/dashboard/admin/partners', label: 'Partner' },
    { href: '/dashboard/admin/customers', label: 'Customer' },
    { href: '/dashboard/admin/services', label: 'Layanan' },
    { href: '/dashboard/admin/settings', label: 'Pengaturan' },
  ],
  corporate: [
    { href: '/dashboard/corporate', label: 'Ringkasan' },
    { href: '/dashboard/corporate/orders', label: 'Pesanan' },
    { href: '/dashboard/corporate/branches', label: 'Cabang' },
    { href: '/dashboard/corporate/invoices', label: 'Invoice' },
    { href: '/dashboard/corporate/settings', label: 'Pengaturan' },
  ],
};

export function Sidebar({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);
  const items = NAV_MAP[role] ?? NAV_MAP.customer;
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  function isActive(href: string) {
    return currentPath === href;
  }

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-md border border-border bg-surface p-2 text-text shadow-sm sm:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" onClick={() => setOpen(false)} />
      )}

      <nav
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } fixed left-0 top-0 z-40 flex h-full w-56 flex-col gap-1 border-r border-border bg-surface p-4 pt-16 shadow-lg transition-transform sm:static sm:translate-x-0 sm:shadow-none sm:pt-0`}
      >
        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-primary/10 text-primary'
                : 'text-text-muted hover:bg-background hover:text-text'
            }`}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}
