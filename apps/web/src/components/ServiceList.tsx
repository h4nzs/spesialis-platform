import { useState, useEffect } from 'react';
import { createBrowserClient, formatCurrency } from '@specialist/shared';

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  basePrice: number;
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
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat layanan');
        setLoading(false);
      });
  }, [searchQuery]);

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
      <div className="rounded-md border border-border-default bg-bg-surface px-6 py-8 text-center">
        <p className="text-text-muted">Belum ada layanan tersedia</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <a
          key={service.id}
          href={`/services/${service.slug}`}
          className="block rounded-lg border border-border-default bg-bg-surface p-6 transition-shadow hover:shadow-md"
        >
          <h2 className="text-h5 font-semibold text-text-primary">{service.name}</h2>
          <p className="mt-2 text-sm text-text-muted">
            {service.shortDescription ?? 'Tidak ada deskripsi'}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-body-sm font-medium text-primary-500">
              {formatCurrency(service.basePrice)}
            </span>
            {service.estimatedDuration && (
              <span className="text-caption text-text-muted">
                &plusmn;{service.estimatedDuration} menit
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
