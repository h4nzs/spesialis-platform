import { useState, useEffect } from 'react';
import {
  createBrowserClient,
  getCategorySpecificFields,
  inferCategorySlug,
} from '@ahlipanggilan/shared';
import type { ServiceData, ReviewData, FaqItem, RelatedServiceItem } from './utils';

interface ServiceDetailProps {
  slug: string;
  initialFaqs?: FaqItem[];
  initialRelated?: RelatedServiceItem[];
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

export function ServiceDetail({ slug, initialFaqs, initialRelated }: ServiceDetailProps) {
  const [service, setService] = useState<ServiceData | null>(null);
  const [reviews, setReviews] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

          {/* ─── FAQ section (AEO) ───────────────────────────── */}
          {initialFaqs && initialFaqs.length > 0 && (
            <div className="mt-12 border-t border-border-default pt-8">
              <h2 className="text-h4 font-semibold text-text-primary">
                Pertanyaan Umum seputar {service.name}
              </h2>
              <div className="mt-6 space-y-3">
                {initialFaqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-border-default bg-bg-surface transition-shadow duration-150 ease-out hover:shadow-xs"
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-body font-medium text-text-primary select-none rounded-t-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500">
                      {faq.question}
                      <span
                        className="ml-4 shrink-0 text-text-muted transition-transform duration-150 ease-out group-open:rotate-180"
                        aria-hidden="true"
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
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </summary>
                    <div className="border-t border-border-default px-5 py-4 text-body text-text-secondary leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* ── Reviews section ──────────────────────────────── */}
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
              <span className="text-h2 font-bold text-primary-500">{service.basePrice}</span>
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

            {waPhone && (
              <a
                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                  `Halo Ahli Panggilan, saya ingin memesan layanan *${service.name}*

Nama: 
Alamat: 
Tanggal Pekerjaan: 
Jam Pekerjaan: 
${getCategorySpecificFields(inferCategorySlug(service.name))}`,
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

            <a
              href={`/book?serviceId=${service.id}`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-border-default bg-white px-6 py-3 text-base font-medium text-text-primary transition-colors hover:bg-neutral-50"
            >
              Pesan Lewat Form
            </a>
          </div>
        </div>
      </div>

      {/* ─── Related Services section (internal linking) ──── */}
      {initialRelated && initialRelated.length > 0 && (
        <div className="mt-16 border-t border-border-default pt-12">
          <h2 className="text-h3 font-bold text-text-primary">Layanan Terkait</h2>
          <p className="mt-2 text-body text-text-muted">
            Lihat juga layanan lain yang mungkin Anda butuhkan
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {initialRelated.slice(0, 6).map((item) => (
              <a
                key={item.id}
                href={`/services/${item.slug}`}
                className="group flex flex-col rounded-xl border border-border-default bg-bg-surface p-5 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 focus-visible:rounded-xl"
              >
                {item.thumbnail ? (
                  <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg bg-neutral-100">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex aspect-video w-full items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-accent-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary-300"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                )}
                <h3 className="text-body font-semibold text-text-primary transition-colors group-hover:text-primary-500">
                  {item.name}
                </h3>
                {item.shortDescription && (
                  <p className="mt-1.5 line-clamp-2 text-body-sm text-text-muted">
                    {item.shortDescription}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-body font-semibold text-primary-500">{item.basePrice}</span>
                  <span className="text-caption text-text-muted transition-colors group-hover:text-primary-500">
                    Lihat detail &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
