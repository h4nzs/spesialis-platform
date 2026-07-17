import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createBrowserClient, getCategorySpecificFields } from '@ahlipanggilan/shared';

/* ── Types ──────────────────────────────────────────────────────────── */

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  displayOrder: number;
}

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: string;
  estimatedDuration: number | null;
  thumbnail: string | null;
}

interface ServiceDetail extends ServiceItem {
  description: string | null;
  categoryId: string;
  warrantyDays: number | null;
  isFeatured: boolean | null;
}

interface ReviewData {
  items: Array<{ id: string; rating: string; review: string | null; createdAt: string }>;
  aggregate: { averageRating: number; totalReviews: number };
}

/* ── Helper: auto-assign icon based on service name ──────────────── */
function guessServiceIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('darurat') || n.includes('emergency')) return 'alert-triangle';
  if (
    n.includes('montir') ||
    n.includes('mobil') ||
    n.includes('kendaraan') ||
    n.includes('otomotif')
  )
    return 'truck';
  if (n.includes('elektronik') || n.includes('tv') || n.includes('monitor') || n.includes('ac'))
    return 'monitor';
  if (
    n.includes('plumbing') ||
    n.includes('pipa') ||
    n.includes('saluran') ||
    n.includes('kran') ||
    n.includes('water')
  )
    return 'droplet';
  if (n.includes('listrik') || n.includes('kelistrikan') || n.includes('instalasi')) return 'zap';
  if (n.includes('clean') || n.includes('cleaning') || n.includes('bersih') || n.includes('sapu'))
    return 'sparkles';
  if (
    n.includes('tukang') ||
    n.includes('bangunan') ||
    n.includes('renovasi') ||
    n.includes('konstruksi')
  )
    return 'hammer';
  if (n.includes('las') || n.includes('welding') || n.includes('besi')) return 'wrench';
  if (n.includes('aspal') || n.includes('jalan') || n.includes('paving')) return 'road';
  if (
    n.includes('wc') ||
    n.includes('toilet') ||
    n.includes('septic') ||
    n.includes('sedot') ||
    n.includes('tinja')
  )
    return 'trash-2';
  if (
    n.includes('pest') ||
    n.includes('hama') ||
    n.includes('serangga') ||
    n.includes('rayap') ||
    n.includes('nyamuk')
  )
    return 'bug';
  if (
    n.includes('taman') ||
    n.includes('outdoor') ||
    n.includes('kebun') ||
    n.includes('rumput') ||
    n.includes('tanaman')
  )
    return 'tree';
  if (
    n.includes('bodyguard') ||
    n.includes('security') ||
    n.includes('satpam') ||
    n.includes('pengaman')
  )
    return 'shield';
  if (n.includes('supir') || n.includes('driver') || n.includes('sopir') || n.includes('antar'))
    return 'car';
  if (
    n.includes('rumah tangga') ||
    n.includes('household') ||
    n.includes('asisten') ||
    n.includes('pembantu') ||
    n.includes('baby') ||
    n.includes('babysitter')
  )
    return 'users';
  return 'search';
}

/* ── Icons ──────────────────────────────────────────────────────────── */

const ICONS: Record<string, string> = {
  // Emergency
  'alert-triangle':
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  // Montir / Kendaraan — mobil
  truck:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>',
  // Elektronik
  monitor:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  // Plumbing — kunci pipa
  droplet:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg>',
  zap: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  // Cleaning — sapu
  sparkles:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 8.8-8.8"/><path d="M14.5 3.5a2 2 0 0 1 2.8 2.8l-8.8 8.8L3 21l1.9-5.6 8.8-8.8Z"/><path d="M18 5l3-3"/><path d="M14 9l-3.5 3.5"/></svg>',
  // Tukang Bangunan — helm proyek
  hammer:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M14 6a6 6 0 0 1 6 6v3"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><rect x="2" y="15" width="20" height="3" rx="1"/></svg>',
  // Tukang Las — api/percikan
  wrench:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
  // Pengaspalan
  road: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22L8 2"/><path d="M16 22L22 2"/><path d="M10 22L14 2"/><path d="M5 11h12"/><path d="M7 17h10"/></svg>',
  // Sedot WC — toilet
  'trash-2':
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12h13a1 1 0 0 1 1 1 5 5 0 0 1-5 5h-.598a.5.5 0 0 0-.424.765l1.544 2.47a.5.5 0 0 1-.424.765H5.402a.5.5 0 0 1-.424-.765L7 18"/><path d="M8 18a5 5 0 0 1-5-5V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  // Pest Control
  bug: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M8 6h8v2a4 4 0 0 1-4 4H8V6z"/><path d="M4 10h4v2a4 4 0 0 0 4 4"/><path d="M16 10h4v2a4 4 0 0 1-4 4"/><path d="M8 16v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4"/><line x1="8" y1="10" x2="4" y2="8"/><line x1="16" y1="10" x2="20" y2="8"/></svg>',
  // Taman & Outdoor — daun
  tree: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
  // Bodyguard & Security — shield+orang
  shield:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M6.21 13.95A4.5 4.5 0 0 1 10.5 11h3a4.5 4.5 0 0 1 4.29 2.95"/><circle cx="12" cy="10" r="2"/></svg>',
  // Supir Panggilan — setir mobil
  car: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="9"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/></svg>',
  // Jasa Rumah Tangga — rumah
  users:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 22V12h6v10"/></svg>',
  // Investigasi
  search:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>',
  // Layanan Lainnya — grid
  'more-horizontal':
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  // Legacy (keep for backward compatibility with DB)
  snowflake:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 20-1.25-2.5L6 18"/><path d="M10 4 8.75 6.5 6 6"/><path d="m14 20 1.25-2.5L18 18"/><path d="m14 4 1.25 2.5L18 6"/><path d="m17 21-3-6h-4"/><path d="m17 3-3 6 1.5 3"/><path d="M2 12h6.5l1.5-3.5L12 12"/><path d="M22 12h-6.5L14 8.5 12 12"/><path d="M12 12v8"/><path d="M12 4v4"/></svg>',
  palette:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.6 1.5-1.5 0-.4-.2-.8-.5-1.1a1.5 1.5 0 0 1 1.1-2.5H16c3.3 0 6-2.7 6-6 0-5.5-4.5-10-10-10z"/></svg>',
  settings:
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
};

const FALLBACK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';

function getIcon(iconName: string | null): string {
  return iconName && ICONS[iconName] ? ICONS[iconName] : FALLBACK_ICON;
}

const BENEFITS = [
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    label: 'Teknisi Berpengalaman',
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.61 3H4a1 1 0 0 0-1 1v5.61a2 2 0 0 0 .83 1.39l9.58 9.58a2 2 0 0 0 2.83 0l4.35-4.35a2 2 0 0 0 0-2.82Z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>',
    label: 'Peralatan Lengkap',
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    label: 'Garansi Layanan',
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><text x="12" y="17" font-family="system-ui,-apple-system,sans-serif" font-weight="800" font-size="11" fill="currentColor" stroke="none" text-anchor="middle">Rp</text></svg>',
    label: 'Harga Transparan',
  },
];

const DESCRIPTION_PLACEHOLDER =
  'Layanan profesional yang siap membantu kebutuhan Anda. Tim teknisi berpengalaman kami akan memberikan hasil terbaik.';

/* ── Main Component ─────────────────────────────────────────────────── */

export function ServiceExplorer() {
  const api = useMemo(() => createBrowserClient(), []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroServices, setHeroServices] = useState<ServiceItem[]>([]);
  const [activeCatSlug, setActiveCatSlug] = useState<string | null>(null);
  const [catServices, setCatServices] = useState<Record<string, ServiceItem[]>>({});
  const [loadingCat, setLoadingCat] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [serviceDetail, setServiceDetail] = useState<ServiceDetail | null>(null);
  const [reviews, setReviews] = useState<ReviewData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [catError, setCatError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<Category[]>('/api/v1/service-categories')
      .then(setCategories)
      .catch(() => {});
    api
      .get<{ data: ServiceItem[] }>('/api/v1/services', { params: { hero: 'true', limit: 20 } })
      .then((res) => {
        const items = Array.isArray(res)
          ? res
          : ((res as unknown as { data?: ServiceItem[] })?.data ?? []);
        setHeroServices(items);
      })
      .catch(() => {});
  }, [api]);

  const handleCategoryClick = useCallback(
    async (slug: string) => {
      if (slug === activeCatSlug) {
        setActiveCatSlug(null);
        setSelectedServiceId(null);
        setServiceDetail(null);
        setReviews(null);
        return;
      }
      setActiveCatSlug(slug);
      setSelectedServiceId(null);
      setServiceDetail(null);
      setReviews(null);
      setCatError('');

      if (catServices[slug]) return;

      setLoadingCat(true);
      try {
        const result = await api.get<{ services: ServiceItem[] }>(
          `/api/v1/service-categories/${slug}`,
        );
        const svcs = (result as unknown as { services: ServiceItem[] }).services ?? [];
        setCatServices((prev) => ({ ...prev, [slug]: svcs }));
      } catch {
        setCatError('Gagal memuat layanan');
      } finally {
        setLoadingCat(false);
      }

      setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    },
    [activeCatSlug, catServices, api],
  );

  const handleServiceClick = useCallback(
    async (svc: ServiceItem) => {
      setSelectedServiceId(svc.id);
      setLoadingDetail(true);
      try {
        const [detail, rev] = await Promise.all([
          api.get<ServiceDetail>(`/api/v1/services/${svc.slug}`),
          api.get<ReviewData>(`/api/v1/services/${svc.slug}/reviews`).catch(() => null),
        ]);
        setServiceDetail(detail);
        setReviews(rev);
      } catch {
        setServiceDetail({
          ...svc,
          description: null,
          categoryId: '',
          warrantyDays: null,
          isFeatured: null,
        });
      } finally {
        setLoadingDetail(false);
      }
    },
    [api],
  );

  const activeCat = categories.find((c) => c.slug === activeCatSlug);
  const services = (activeCatSlug ? catServices[activeCatSlug] : null) ?? [];

  return (
    <section className="bg-bg-section">
      <div className="container-page pt-2 pb-1 md:pt-3 md:pb-1.5">
        <div className="rounded-xl border border-border-default bg-white p-3 shadow-sm md:p-4">
          {/* ── Category Row — 2 baris (grid responsif) ──────────── */}
          <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-9 md:gap-x-5 md:gap-y-5 justify-items-center">
            {/* ── Kategori biasa (kecuali Layanan Lainnya) ───────── */}
            {categories
              .filter((cat) => cat.icon !== 'more-horizontal')
              .map((cat) => {
                const isActive = cat.slug === activeCatSlug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`group relative flex flex-col items-center gap-2 px-2 py-1 text-center transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                      isActive ? 'scale-105' : 'hover:scale-105'
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center transition-all duration-200 md:h-14 md:w-14 ${
                        isActive
                          ? 'text-primary-700'
                          : 'text-primary-800 group-hover:text-primary-600'
                      }`}
                      aria-hidden="true"
                    >
                      <span dangerouslySetInnerHTML={{ __html: getIcon(cat.icon) }} />
                    </div>
                    <span
                      className={`text-[11px] font-semibold leading-snug transition-colors duration-200 ${
                        isActive ? 'text-primary-700' : 'text-primary-900'
                      }`}
                    >
                      {cat.name}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-warning-500" />
                    )}
                  </button>
                );
              })}
            {/* ── Hero Services (standalone, tanpa kategori) ──────── */}
            {heroServices.map((svc) => {
              const isSelected = svc.id === selectedServiceId;
              const iconName = guessServiceIcon(svc.name);
              return (
                <button
                  key={`hero-${svc.id}`}
                  type="button"
                  onClick={() => {
                    setActiveCatSlug(null);
                    handleServiceClick(svc);
                  }}
                  className={`group relative flex flex-col items-center gap-2 px-2 py-1 text-center transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    isSelected ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center transition-all duration-200 md:h-14 md:w-14 ${
                      isSelected
                        ? 'text-warning-600'
                        : 'text-primary-800 group-hover:text-primary-600'
                    }`}
                    aria-hidden="true"
                  >
                    <span dangerouslySetInnerHTML={{ __html: getIcon(iconName) }} />
                  </div>
                  <span
                    className={`text-[11px] font-semibold leading-snug transition-colors duration-200 ${
                      isSelected ? 'text-warning-600' : 'text-primary-900'
                    }`}
                  >
                    {svc.name}
                  </span>
                  {isSelected && (
                    <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-warning-500" />
                  )}
                </button>
              );
            })}
            {/* ── Layanan Lainnya (selalu paling ujung) ──────────── */}
            {categories
              .filter((cat) => cat.icon === 'more-horizontal')
              .map((cat) => {
                const isActive = cat.slug === activeCatSlug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`group relative flex flex-col items-center gap-2 px-2 py-1 text-center transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                      isActive ? 'scale-105' : 'hover:scale-105'
                    }`}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-all duration-200 md:h-14 md:w-14"
                      aria-hidden="true"
                    >
                      <span dangerouslySetInnerHTML={{ __html: getIcon(cat.icon) }} />
                    </div>
                    <span
                      className={`text-[11px] font-semibold leading-snug transition-colors duration-200 ${
                        isActive ? 'text-blue-700' : 'text-blue-600'
                      }`}
                    >
                      {cat.name}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-warning-500" />
                    )}
                  </button>
                );
              })}
          </div>

          {/* ── Sub-Services Panel ──────────────────────────── */}
          {activeCatSlug && (
            <div
              ref={panelRef}
              className="mt-4 overflow-hidden transition-all duration-200 ease-out"
              style={{ opacity: loadingCat ? 0.5 : 1 }}
            >
              <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-4 shadow-sm md:p-5">
                {/* Category header */}
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-600">
                    {activeCat?.name ?? ''}
                  </span>
                  <span className="text-[10px] text-neutral-400">— {services.length} layanan</span>
                </div>

                {/* Loading */}
                {loadingCat && (
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-neutral-100" />
                    ))}
                  </div>
                )}

                {/* Error */}
                {catError && !loadingCat && (
                  <p className="py-4 text-center text-sm text-danger-500">{catError}</p>
                )}

                {/* Services row — slim pills */}
                {!loadingCat && !catError && services.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2">
                    {services.map((svc) => {
                      const isSelected = svc.id === selectedServiceId;
                      return (
                        <button
                          key={svc.id}
                          type="button"
                          onClick={() => handleServiceClick(svc)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ease-out ${
                            isSelected
                              ? 'border-primary-400 bg-primary-500 text-white shadow-xs'
                              : 'border-border-default bg-white text-neutral-700 hover:border-neutral-300 hover:text-neutral-900'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                              isSelected ? 'bg-white/20' : 'bg-neutral-100'
                            }`}
                          >
                            <span
                              className={`${isSelected ? 'text-white' : 'text-neutral-500'}`}
                              dangerouslySetInnerHTML={{ __html: getIcon(activeCat?.icon ?? null) }}
                            />
                          </span>
                          {svc.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Empty state */}
                {!loadingCat && !catError && services.length === 0 && (
                  <p className="py-3 text-center text-sm text-neutral-500">
                    Belum ada layanan tersedia untuk kategori ini.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Service Detail Panel ──────────────────────────── */}
          {selectedServiceId && serviceDetail && !loadingDetail && (
            <div className="mt-4 overflow-hidden transition-all duration-200 ease-out">
              <ServiceDetailCard
                service={serviceDetail}
                reviews={reviews}
                catName={activeCat?.name ?? ''}
                catSlug={activeCat?.slug ?? null}
                catImage={activeCat?.image ?? null}
              />
              {/* Benefit bar */}
              <BenefitBar />
            </div>
          )}

          {/* Loading detail skeleton */}
          {selectedServiceId && loadingDetail && (
            <div className="mt-4 overflow-hidden">
              <div className="animate-pulse rounded-xl border border-border-default bg-white p-6 shadow-sm">
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="h-56 rounded-lg bg-neutral-200 lg:col-span-5" />
                  <div className="space-y-3 lg:col-span-4">
                    <div className="h-4 w-1/3 rounded bg-neutral-200" />
                    <div className="h-6 w-3/4 rounded bg-neutral-200" />
                    <div className="h-4 w-full rounded bg-neutral-200" />
                    <div className="h-4 w-5/6 rounded bg-neutral-200" />
                  </div>
                  <div className="h-48 rounded-xl bg-neutral-200 lg:col-span-3" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Service Detail Card ────────────────────────────────────────────── */

function ServiceDetailCard({
  service,
  reviews,
  catName,
  catSlug,
  catImage,
}: {
  service: ServiceDetail;
  reviews: ReviewData | null;
  catName: string;
  catSlug: string | null;
  catImage: string | null;
}) {
  const avgRating = reviews?.aggregate.averageRating ?? 0;
  const totalReviews = reviews?.aggregate.totalReviews ?? 0;
  const hasReviews = totalReviews > 0;

  const [waPhone, setWaPhone] = useState('');

  useEffect(() => {
    fetch('/api/v1/public/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!body) return;
        const data = body.data ?? body;
        if (data.whatsapp_phone_number) setWaPhone(data.whatsapp_phone_number);
      })
      .catch(() => {});
  }, []);

  const benefits = [
    'Membersihkan unit indoor secara menyeluruh',
    'Membersihkan unit outdoor dari kotoran',
    'Menghilangkan debu dan bakteri',
    'Meningkatkan kualitas udara ruangan',
  ];

  return (
    <div className="rounded-xl border border-border-default bg-white p-5 shadow-sm transition-all duration-200 md:p-6">
      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        {/* ── Left: Image ──────────────────────────────────── */}
        <div className="relative lg:col-span-5">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary-100 via-primary-50 to-neutral-100 shadow-sm">
            {(() => {
              const imgSrc = service.thumbnail || catImage;
              return imgSrc ? (
                <img
                  src={imgSrc}
                  alt={service.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-primary-400 shadow-xs">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <p className="mt-2 text-xs font-medium text-neutral-400">{service.name}</p>
                  </div>
                </div>
              );
            })()}
          </div>
          {service.basePrice && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <span className="text-[10px] font-medium text-neutral-500">Mulai dari</span>
              <span className="text-sm font-extrabold text-primary-600">{service.basePrice}</span>
            </div>
          )}
        </div>

        {/* ── Middle: Info ──────────────────────────────────── */}
        <div className="lg:col-span-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span>{catName || 'Layanan'}</span>
            <span className="text-neutral-300">›</span>
            <span className="font-medium text-neutral-600">{service.name}</span>
          </nav>

          <h3 className="mt-2 text-xl font-extrabold text-neutral-900 leading-snug">
            {service.name}
          </h3>

          {service.shortDescription && (
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {service.shortDescription}
            </p>
          )}

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            {service.description?.split('\n')[0] ?? DESCRIPTION_PLACEHOLDER}
          </p>

          {/* Benefits checklist */}
          <div className="mt-4 space-y-1.5">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0 text-success-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-xs text-neutral-600">{b}</span>
              </div>
            ))}
          </div>

          {/* Extra info: duration, rating */}
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-neutral-100 pt-4">
            {service.estimatedDuration && (
              <div className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="text-neutral-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-xs font-medium text-neutral-600">
                  ±{service.estimatedDuration} menit
                </span>
              </div>
            )}
            {hasReviews && (
              <div className="flex items-center gap-1.5">
                <span className="flex gap-0.5 text-warning-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill={s <= Math.round(avgRating) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </span>
                <span className="text-xs font-medium text-neutral-600">
                  {avgRating.toFixed(1)} ({totalReviews})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Booking Card ───────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-border-default bg-neutral-50 p-5 shadow-xs">
            <p className="text-sm font-bold text-neutral-800">{service.name}</p>

            {service.basePrice && (
              <p className="mt-2 text-xl font-extrabold text-primary-600">{service.basePrice}</p>
            )}

            {service.estimatedDuration && (
              <p className="mt-1 text-xs text-neutral-500">
                Estimasi ±{service.estimatedDuration} menit
              </p>
            )}

            {waPhone && (
              <a
                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                  `Halo Ahli Panggilan, saya ingin memesan layanan *${service.name}*

Nama: 
Alamat: 
Tanggal Pekerjaan: 
Jam Pekerjaan: 
${getCategorySpecificFields(catSlug)}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:shadow-sm"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Booking via WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Benefit Bar ────────────────────────────────────────────────────── */

function BenefitBar() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
      {BENEFITS.map((b, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border-default bg-white px-4 py-3 shadow-xs transition-all duration-150 hover:shadow-sm"
          style={{ minHeight: '72px' }}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <span dangerouslySetInnerHTML={{ __html: b.icon }} />
          </div>
          <span className="text-xs font-semibold text-neutral-700 leading-snug">{b.label}</span>
        </div>
      ))}
    </div>
  );
}
