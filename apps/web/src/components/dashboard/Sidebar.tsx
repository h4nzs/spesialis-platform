import { useState } from 'react';
import type { UserRole } from '@ahlipanggilan/types';
import { forceLogout } from '../../lib/auth.ts';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavSection {
  label: string;
  icon: string;
  children: NavItem[];
}

type NavEntry = NavItem | NavSection;

const NAV_MAP: Record<string, NavEntry[]> = {
  content_manager: [
    { href: '/dashboard/admin', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/admin/articles', label: 'Artikel', icon: 'fileText' },
    { href: '/dashboard/admin/media', label: 'Media', icon: 'file' },
    { href: '/dashboard/admin/faq', label: 'FAQ', icon: 'helpCircle' },
    { href: '/dashboard/admin/testimonials', label: 'Testimoni', icon: 'review' },
    { href: '/dashboard/admin/cms-pages', label: 'Halaman', icon: 'fileText' },
    { href: '/dashboard/admin/services', label: 'Layanan', icon: 'wrench' },
    { href: '/dashboard/admin/service-categories', label: 'Kategori', icon: 'address' },
    { href: '/dashboard/admin/settings', label: 'Pengaturan', icon: 'settings' },
  ],
  customer: [
    { href: '/dashboard/customer', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/customer/orders', label: 'Pesanan', icon: 'orders' },
    { href: '/dashboard/customer/addresses', label: 'Alamat', icon: 'address' },
    { href: '/dashboard/customer/reviews', label: 'Ulasan', icon: 'review' },
    { href: '/dashboard/customer/complaints', label: 'Komplain', icon: 'complaint' },
    { href: '/dashboard/customer/settings', label: 'Pengaturan', icon: 'settings' },
  ],
  partner: [
    { href: '/dashboard/partner', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/partner/jobs', label: 'Pekerjaan', icon: 'jobs' },
    { href: '/dashboard/partner/availability', label: 'Ketersediaan', icon: 'clock' },
    { href: '/dashboard/partner/earnings', label: 'Pendapatan', icon: 'wallet' },
    { href: '/dashboard/partner/penalties', label: 'Penalty', icon: 'ban' },
    { href: '/dashboard/partner/reviews', label: 'Ulasan', icon: 'review' },
    { href: '/dashboard/partner/settings', label: 'Pengaturan', icon: 'settings' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/admin/bookings', label: 'Booking', icon: 'orders' },
    { href: '/dashboard/admin/partners', label: 'Partner', icon: 'partner' },
    { href: '/dashboard/admin/customers', label: 'Customer', icon: 'users' },
    { href: '/dashboard/admin/users', label: 'User', icon: 'user' },
    { href: '/dashboard/admin/services', label: 'Layanan', icon: 'wrench' },
    { href: '/dashboard/admin/service-categories', label: 'Kategori', icon: 'address' },
    { href: '/dashboard/admin/contracts', label: 'Kontrak', icon: 'scrollText' },
    { href: '/dashboard/admin/invoices', label: 'Invoice', icon: 'receipt' },
    { href: '/dashboard/admin/articles', label: 'Artikel', icon: 'fileText' },
    {
      label: 'SEO',
      icon: 'search',
      children: [
        { href: '/dashboard/admin/seo/bulk-edit', label: 'Bulk SEO', icon: 'barChart' },
        { href: '/dashboard/admin/seo/audit', label: 'SEO Audit', icon: 'search' },
        { href: '/dashboard/admin/seo/redirects', label: 'Redirect', icon: 'redirect' },
        { href: '/dashboard/admin/seo/404-monitor', label: '404 Monitor', icon: 'alertTriangle' },
      ],
    },
    { href: '/dashboard/admin/faq', label: 'FAQ', icon: 'helpCircle' },
    { href: '/dashboard/admin/testimonials', label: 'Testimoni', icon: 'review' },
    { href: '/dashboard/admin/coverage-areas', label: 'Area Layanan', icon: 'address' },
    { href: '/dashboard/admin/service-suggestions', label: 'Usulan Layanan', icon: 'helpCircle' },
    { href: '/dashboard/admin/media', label: 'Media', icon: 'file' },
    { href: '/dashboard/admin/cms-pages', label: 'Halaman', icon: 'fileText' },
    { href: '/dashboard/admin/audit-logs', label: 'Audit Log', icon: 'scrollText' },
    { href: '/dashboard/admin/penalties', label: 'Penalty', icon: 'ban' },
    { href: '/dashboard/admin/reports', label: 'Laporan', icon: 'barChart' },
    { href: '/dashboard/admin/settings', label: 'Pengaturan', icon: 'settings' },
  ],
  super_admin: [
    { href: '/dashboard/admin', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/admin/bookings', label: 'Booking', icon: 'orders' },
    { href: '/dashboard/admin/partners', label: 'Partner', icon: 'partner' },
    { href: '/dashboard/admin/customers', label: 'Customer', icon: 'users' },
    { href: '/dashboard/admin/users', label: 'User', icon: 'user' },
    { href: '/dashboard/admin/services', label: 'Layanan', icon: 'wrench' },
    { href: '/dashboard/admin/service-categories', label: 'Kategori', icon: 'address' },
    { href: '/dashboard/admin/contracts', label: 'Kontrak', icon: 'scrollText' },
    { href: '/dashboard/admin/invoices', label: 'Invoice', icon: 'receipt' },
    { href: '/dashboard/admin/articles', label: 'Artikel', icon: 'fileText' },
    {
      label: 'SEO',
      icon: 'search',
      children: [
        { href: '/dashboard/admin/seo/bulk-edit', label: 'Bulk SEO', icon: 'barChart' },
        { href: '/dashboard/admin/seo/audit', label: 'SEO Audit', icon: 'search' },
        { href: '/dashboard/admin/seo/redirects', label: 'Redirect', icon: 'redirect' },
        { href: '/dashboard/admin/seo/404-monitor', label: '404 Monitor', icon: 'alertTriangle' },
      ],
    },
    { href: '/dashboard/admin/faq', label: 'FAQ', icon: 'helpCircle' },
    { href: '/dashboard/admin/testimonials', label: 'Testimoni', icon: 'review' },
    { href: '/dashboard/admin/coverage-areas', label: 'Area Layanan', icon: 'address' },
    { href: '/dashboard/admin/service-suggestions', label: 'Usulan Layanan', icon: 'helpCircle' },
    { href: '/dashboard/admin/media', label: 'Media', icon: 'file' },
    { href: '/dashboard/admin/cms-pages', label: 'Halaman', icon: 'fileText' },
    { href: '/dashboard/admin/audit-logs', label: 'Audit Log', icon: 'scrollText' },
    { href: '/dashboard/admin/penalties', label: 'Penalty', icon: 'ban' },
    { href: '/dashboard/admin/reports', label: 'Laporan', icon: 'barChart' },
    { href: '/dashboard/admin/settings', label: 'Pengaturan', icon: 'settings' },
  ],
  dispatcher: [
    { href: '/dashboard/dispatcher', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/admin/bookings', label: 'Booking', icon: 'orders' },
    { href: '/dashboard/admin/partners', label: 'Partner', icon: 'partner' },
    { href: '/dashboard/admin/media', label: 'Media', icon: 'file' },
  ],
  finance: [
    { href: '/dashboard/finance', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/admin/bookings', label: 'Booking', icon: 'orders' },
    { href: '/dashboard/admin/reports', label: 'Laporan', icon: 'barChart' },
  ],
  corporate: [
    { href: '/dashboard/corporate', label: 'Ringkasan', icon: 'dashboard' },
    { href: '/dashboard/corporate/orders', label: 'Pesanan', icon: 'orders' },
    { href: '/dashboard/corporate/branches', label: 'Cabang', icon: 'building' },
    { href: '/dashboard/corporate/contracts', label: 'Kontrak', icon: 'scrollText' },
    { href: '/dashboard/corporate/invoices', label: 'Invoice', icon: 'receipt' },
    { href: '/dashboard/corporate/settings', label: 'Pengaturan', icon: 'settings' },
  ],
};

// Lucide icon SVGs as raw HTML strings
const ICON_SVGS: Record<string, string> = {
  dashboard:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3"/><rect width="7" height="5" x="14" y="3"/><rect width="7" height="9" x="14" y="12"/><rect width="7" height="5" x="3" y="16"/></svg>',
  orders:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2"/></svg>',
  partner:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  address:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  review:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2 2 0 0 0 1.54 1.08l5.16.756a.53.53 0 0 1 .294.904l-3.736 3.638a2 2 0 0 0-.575 1.77l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2 2 0 0 0-1.862 0L6.395 18.8a.53.53 0 0 1-.771-.56l.882-5.14a2 2 0 0 0-.575-1.77L2.195 7.714a.53.53 0 0 1 .294-.904l5.16-.756a2 2 0 0 0 1.54-1.08l2.31-4.68Z"/></svg>',
  complaint:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  settings:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  jobs: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>',
  clock:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  wallet:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>',
  ban: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>',
  users:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  wrench:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  fileText:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>',
  scrollText:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 12h-5"/><path d="M15 8h-5"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 0 0 2 2"/></svg>',
  barChart:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>',
  building:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  receipt:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2 1Z"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>',
  helpCircle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
  file: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
  redirect:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>',
  alertTriangle:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  home: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  search:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',

  /* ── Mobile menu + logout ──────────────────────────────────── */
  menu: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
  x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  logout:
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
};

async function handleLogout() {
  await forceLogout();
}

function Icon({ name, className }: { name: string; className?: string }) {
  const svg = ICON_SVGS[name];
  if (!svg) return null;
  return (
    <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

function isNavItem(entry: NavEntry): entry is NavItem {
  return 'href' in entry;
}

export function Sidebar({
  role,
  currentPath,
  userName,
  userEmail,
}: {
  role: UserRole;
  currentPath?: string;
  userName?: string;
  userEmail?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({
    seo: true,
  });
  const entries = (NAV_MAP[role] ?? NAV_MAP.customer)!;
  const path = currentPath ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  function isActive(href: string) {
    return path === href;
  }

  function isSectionActive(section: NavSection): boolean {
    return section.children.some((child) => isActive(child.href));
  }

  function toggleSection(label: string) {
    setSectionsOpen((prev) => ({ ...prev, [label.toLowerCase()]: !prev[label.toLowerCase()] }));
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-lg border border-border-default bg-bg-sidebar text-text-primary shadow-xs sm:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Buka menu navigasi"
      >
        <Icon name={open ? 'x' : 'menu'} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/30 sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar navigation */}
      <nav
        className={`fixed left-0 top-0 z-[55] flex h-full w-60 flex-col border-r border-border-default bg-bg-sidebar shadow-lg transition-transform duration-200 ease-out sm:sticky sm:top-20 sm:h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-5rem)] sm:shrink-0 sm:rounded-xl sm:border sm:shadow-sm sm:z-0 ${
          open ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        {/* User info / branding */}
        <div className="flex items-center gap-3 border-b border-border-default px-4 py-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-body font-bold text-white">
            S
          </div>
          <div className="min-w-0">
            <p className="truncate text-body-sm font-semibold text-text-primary">
              {userName ?? userEmail ?? 'Ahli Panggilan'}
            </p>
            <p className="text-caption capitalize text-text-muted">{role}</p>
          </div>
        </div>

        {/* Nav items & sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {entries.map((entry) => {
            if (isNavItem(entry)) {
              return (
                <a
                  key={entry.href}
                  href={entry.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors duration-150 ease-out ${
                    isActive(entry.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                  }`}
                >
                  <Icon
                    name={entry.icon}
                    className={`flex shrink-0 items-center justify-center ${
                      isActive(entry.href) ? 'text-primary-600' : 'text-text-muted'
                    }`}
                  />
                  {entry.label}
                </a>
              );
            }

            // ── Collapsible section ──────────────────────────────
            const sectionKey = entry.label.toLowerCase();
            const isOpen = sectionsOpen[sectionKey] ?? true;
            const anyChildActive = isSectionActive(entry);

            return (
              <div key={`section:${entry.label}`} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleSection(entry.label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors duration-150 ease-out ${
                    anyChildActive
                      ? 'text-primary-700'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon name={entry.icon} className="shrink-0 text-text-muted" />
                  <span className="flex-1 text-left">{entry.label}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-text-muted transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="ml-3 space-y-0.5 border-l-2 border-border-default pl-3">
                    {entry.children.map((child) => (
                      <a
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors duration-150 ease-out ${
                          isActive(child.href)
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            isActive(child.href) ? 'bg-primary-500' : 'bg-text-muted'
                          }`}
                        />
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <div className="border-t border-border-default p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-danger-50 hover:text-danger-600"
          >
            <Icon name="logout" className="shrink-0 text-text-muted" />
            Keluar
          </button>
        </div>
      </nav>
    </>
  );
}
