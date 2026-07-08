import { useState, useEffect } from 'react';
import { createBrowserClient, formatCurrency } from '@specialist/shared';
import type { ServiceData, ReviewData } from './utils';

interface ServiceDetailProps {
  slug: string;
}

function StarRating({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'md' ? 'text-lg' : 'text-sm';
  return (
    <span className={`tracking-wide ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(value) ? 'text-accent-500' : 'text-neutral-200'}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ServiceDetail({ slug }: ServiceDetailProps) {
  const [service, setService] = useState<ServiceData | null>(null);
  const [reviews, setReviews] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const api = createBrowserClient();

    Promise.all([
      api.get<ServiceData>(`/api/v1/services/${slug}`),
      api.get<ReviewData>(`/api/v1/services/${slug}/reviews`).catch(() => null),
    ])
      .then(([svc, rev]) => {
        setService(svc);
        setReviews(rev);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Gagal memuat layanan');
        setLoading(false);
      });
  }, [slug]);

  // ─── Loading skeleton ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse mb-8 h-4 w-64 rounded bg-neutral-200" />

        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="h-8 w-3/4 rounded bg-neutral-200" />
            <div className="mt-3 h-5 w-full rounded bg-neutral-200" />
            <div className="mt-2 h-5 w-5/6 rounded bg-neutral-200" />
            <div className="mt-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full rounded bg-neutral-200" />
              ))}
            </div>
            <div className="mt-8 flex gap-6">
              <div className="h-16 w-36 rounded-lg bg-neutral-200" />
              <div className="h-16 w-36 rounded-lg bg-neutral-200" />
            </div>

            <div className="mt-12 border-t border-border-default pt-8">
              <div className="h-6 w-40 rounded bg-neutral-200" />
              <div className="mt-6 space-y-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border-default bg-bg-surface p-4"
                  >
                    <div className="h-4 w-24 rounded bg-neutral-200" />
                    <div className="mt-3 h-4 w-full rounded bg-neutral-200" />
                    <div className="mt-2 h-4 w-4/5 rounded bg-neutral-200" />
                    <div className="mt-3 h-3 w-32 rounded bg-neutral-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-xl border border-border-default bg-bg-surface p-6 shadow-xs">
              <div className="h-10 w-1/2 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-3/4 rounded bg-neutral-200" />
              <div className="mt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-2/3 rounded bg-neutral-200" />
                ))}
              </div>
              <div className="mt-6 h-12 w-full rounded-md bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error state ───────────────────────────────────────────────

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-h3 font-bold text-text-primary">Layanan Tidak Ditemukan</h1>
          <p className="mt-2 text-text-muted">{error}</p>
          <a
            href="/services"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Lihat Semua Layanan
          </a>
        </div>
      </div>
    );
  }

  if (!service) return null;

  const hasReviews = reviews && reviews.items.length > 0;

  // ─── Service detail ────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 motion-safe:animate-fade-in">
      <nav className="mb-8 text-body-sm text-text-muted">
        <a href="/" className="hover:text-text-primary transition-colors">
          Beranda
        </a>
        <span className="mx-2">/</span>
        <a href="/services" className="hover:text-text-primary transition-colors">
          Layanan
        </a>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{service.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h1 className="text-h2 font-bold text-text-primary">{service.name}</h1>
          {service.shortDescription && (
            <p className="mt-3 text-body-lg text-text-muted">{service.shortDescription}</p>
          )}
          {service.description && (
            <div className="mt-6 space-y-4 text-text-secondary">
              {service.description.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            {service.estimatedDuration && (
              <div className="rounded-lg border border-border-default bg-bg-surface px-4 py-3">
                <span className="block text-caption text-text-muted">Estimasi</span>
                <span className="font-semibold text-text-primary">
                  &plusmn;{service.estimatedDuration} menit
                </span>
              </div>
            )}
            {service.warrantyDays && (
              <div className="rounded-lg border border-border-default bg-bg-surface px-4 py-3">
                <span className="block text-caption text-text-muted">Garansi</span>
                <span className="font-semibold text-text-primary">{service.warrantyDays} hari</span>
              </div>
            )}
          </div>

          {/* ─── Reviews section ──────────────────────────────── */}
          {hasReviews && (
            <div className="mt-12 border-t border-border-default pt-8">
              <div className="flex items-center gap-3">
                <h2 className="text-h4 font-semibold text-text-primary">Ulasan Pelanggan</h2>
                <span className="rounded-full bg-accent-500/10 px-3 py-0.5 text-sm font-medium text-accent-500">
                  {reviews.aggregate.averageRating.toFixed(1)}
                </span>
                <StarRating value={reviews.aggregate.averageRating} size="md" />
                <span className="text-body-sm text-text-muted">
                  ({reviews.aggregate.totalReviews})
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {reviews.items.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-border-default bg-bg-surface p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <StarRating value={Number(r.rating)} />
                      <span className="text-caption text-text-muted">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                    {r.review && <p className="mt-2 text-body-sm text-text-primary">{r.review}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-xl border border-border-default bg-bg-surface p-6 shadow-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-h2 font-bold text-primary-500">
                {formatCurrency(service.basePrice)}
              </span>
              <span className="text-body-sm text-text-muted">/ sekali</span>
            </div>
            {service.estimatedDuration && (
              <p className="mt-2 text-body-sm text-text-muted">
                Estimasi pengerjaan &plusmn;{service.estimatedDuration} menit
              </p>
            )}
            <ul className="mt-4 space-y-2 text-body-sm text-text-muted">
              <li className="flex items-center gap-2">
                <span className="text-success-500">{'\u2713'}</span> Teknisi berpengalaman
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">{'\u2713'}</span> Harga transparan
              </li>
              <li className="flex items-center gap-2">
                <span className="text-success-500">{'\u2713'}</span> Garansi layanan
              </li>
            </ul>
            <a
              href={`/book?serviceId=${service.id}`}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary-hover"
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
