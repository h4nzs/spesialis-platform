import { useState, useEffect } from 'react';
import { track } from '@spesialis/analytics';
import { createBrowserClient } from '@ahlipanggilan/shared';

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: string;
  estimatedDuration: number | null;
  thumbnail: string | null;
}

export function ServiceList({ searchQuery }: { searchQuery?: string }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const api = createBrowserClient();

    api
      .get<ServiceItem[]>('/api/v1/services', {
        params: { limit: 50, ...(searchQuery ? { q: searchQuery } : {}) },
      })
      .then((items) => {
        setServices(items);
        setLoading(false);
        if (searchQuery) {
          track('search_result', {
            query: searchQuery,
            result_count: items.length,
            has_results: items.length > 0,
          });
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat layanan');
        setLoading(false);
        if (searchQuery) {
          track('search_result', { query: searchQuery, result_count: 0, has_results: false });
        }
      });
  }, [searchQuery]);

  const header = searchQuery ? (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-border-default bg-bg-surface p-3">
      <span className="text-body-sm text-text-muted">Pencarian:</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-body-sm font-medium text-primary-700">
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        {searchQuery}
      </span>
      <a
        href="/services"
        className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-bg-page px-3 py-1.5 text-body-sm font-medium text-text-primary transition-colors hover:bg-bg-section"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Tampilkan Semua
      </a>
    </div>
  ) : null;

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border-default bg-bg-surface p-6"
          >
            <div className="h-5 w-2/3 rounded bg-neutral-200" />
            <div className="mt-3 h-4 w-full rounded bg-neutral-200" />
            <div className="mt-4 h-4 w-1/3 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-danger-500/30 bg-danger-500/5 px-6 py-8 text-center">
        <p className="text-danger-500">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <>
        {header}
        <div className="rounded-md border border-border-default bg-bg-surface px-6 py-8 text-center">
          <p className="text-text-muted">
            {searchQuery
              ? `Tidak ada layanan untuk pencarian "${searchQuery}"`
              : 'Belum ada layanan tersedia'}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <a
            key={service.id}
            href={`/services/${service.slug}`}
            className="block rounded-lg border border-border-default bg-bg-surface p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-h5 font-semibold text-text-primary">{service.name}</h3>
            <p className="mt-2 text-sm text-text-muted">
              {service.shortDescription ?? 'Tidak ada deskripsi'}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-body-sm font-medium text-primary-500">{service.basePrice}</span>
              {service.estimatedDuration && (
                <span className="text-caption text-text-muted">
                  &plusmn;{service.estimatedDuration} menit
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
