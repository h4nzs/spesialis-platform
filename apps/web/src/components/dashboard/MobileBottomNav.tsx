import { useState } from 'react';
import type { UserRole } from '@ahlipanggilan/types';
import { NAV_MAP, NAV_ICONS, isNavItem, type NavEntry, type NavSection } from './Sidebar.tsx';
import { forceLogout } from '../../lib/auth.ts';
import { trackNavigation } from '@spesialis/analytics';

function Icon({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  const svg = NAV_ICONS[name];
  if (!svg) return null;
  const sized = svg
    .replace(/width="\d+"/, `width="${size}"`)
    .replace(/height="\d+"/, `height="${size}"`)
    .replace(/stroke-width="\d+(\.\d+)?"/g, 'stroke-width="2"');
  return (
    <span aria-hidden="true" className={className} dangerouslySetInnerHTML={{ __html: sized }} />
  );
}

function isActive(href: string, path: string): boolean {
  return path === href || (path.startsWith(href + '/') && href !== '/dashboard/notifications');
}

export function MobileBottomNav({ role, currentPath }: { role: UserRole; currentPath?: string }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>({ seo: true });

  const allItems: NavEntry[] = (NAV_MAP[role] ?? NAV_MAP.customer) as NavEntry[];
  const path = currentPath ?? (typeof window !== 'undefined' ? window.location.pathname : '');

  // First 5 simple nav items (skip sections) for the bottom bar
  const visibleItems = allItems.filter(isNavItem).slice(0, 5);
  const hasMore = allItems.length > 5;

  function isSectionActive(section: NavSection): boolean {
    return section.children.some((child) => isActive(child.href, path));
  }

  function toggleSection(label: string) {
    setSectionsOpen((prev) => ({ ...prev, [label.toLowerCase()]: !prev[label.toLowerCase()] }));
  }

  return (
    <>
      {/* ── Bottom Nav Bar (mobile only) ────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border-default bg-bg-surface pb-1 sm:hidden"
        aria-label="Navigasi mobile"
      >
        {visibleItems.map((item) => {
          const active = isActive(item.href, path);
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={() => trackNavigation(item.href, item.label, 'mobile-bottom-nav')}
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

        {/* ── "Lainnya" button ──────────────────────────────── */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-2 py-2 text-caption font-medium transition-colors duration-150 ${
              sheetOpen ? 'text-primary-600' : 'text-text-muted hover:text-text-secondary'
            }`}
            aria-label="Buka menu lainnya"
          >
            <span className="text-text-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </span>
            <span>Lainnya</span>
          </button>
        )}
      </nav>

      {/* ── Overlay ─────────────────────────────────────────────── */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/30 sm:hidden"
          onClick={() => setSheetOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Bottom Sheet ────────────────────────────────────────── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[60] flex max-h-[85vh] flex-col rounded-t-2xl bg-bg-surface shadow-xl transition-transform duration-300 ease-out sm:hidden ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi lengkap"
      >
        {/* Drag handle */}
        <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-border-default" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
          <span className="text-body font-semibold text-text-primary">Menu</span>
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-neutral-100 hover:text-text-primary transition-colors"
            aria-label="Tutup menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable menu items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 pb-20">
          {allItems.map((entry) => {
            if (isNavItem(entry)) {
              const active = isActive(entry.href, path);
              return (
                <a
                  key={entry.href}
                  href={entry.href}
                  onClick={() => {
                    setSheetOpen(false);
                    trackNavigation(entry.href, entry.label, 'mobile-sheet');
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors duration-150 ease-out ${
                    active
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                  }`}
                >
                  <Icon
                    name={entry.icon}
                    size={18}
                    className={`shrink-0 ${active ? 'text-primary-600' : 'text-text-muted'}`}
                  />
                  {entry.label}
                </a>
              );
            }

            // ── Collapsible section ──────────────────────────────
            const section: NavSection = entry;
            const sectionKey = section.label.toLowerCase();
            const isOpen = sectionsOpen[sectionKey] ?? true;
            const anyChildActive = isSectionActive(section);

            return (
              <div key={`section:${section.label}`} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => toggleSection(section.label)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors duration-150 ease-out ${
                    anyChildActive
                      ? 'text-primary-700'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon name={section.icon} size={18} />
                  <span className="flex-1 text-left">{section.label}</span>
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
                    {section.children.map((child) => {
                      const childActive = isActive(child.href, path);
                      return (
                        <a
                          key={child.href}
                          href={child.href}
                          onClick={() => {
                            setSheetOpen(false);
                            trackNavigation(child.href, child.label, 'mobile-sheet');
                          }}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm font-medium transition-colors duration-150 ease-out ${
                            childActive
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-text-secondary hover:bg-neutral-100 hover:text-text-primary'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              childActive ? 'bg-primary-500' : 'bg-text-muted'
                            }`}
                          />
                          {child.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Logout ──────────────────────────────────────────── */}
          <div className="mt-3 border-t border-border-default pt-3">
            <button
              type="button"
              onClick={() => {
                setSheetOpen(false);
                forceLogout();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-danger-50 hover:text-danger-600"
            >
              <Icon name="logout" size={18} />
              Keluar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
