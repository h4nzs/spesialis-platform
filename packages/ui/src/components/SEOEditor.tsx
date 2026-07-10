import { useCallback } from 'react';
import { Input } from './Input.tsx';
import { Textarea } from './Textarea.tsx';
import { Select } from './Select.tsx';
import { cn } from '../utils/cn.ts';

// ── Types ────────────────────────────────────────────────────────

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
}

export const DEFAULT_SEO: SeoData = {
  metaTitle: '',
  metaDescription: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  canonicalUrl: '',
  robots: 'index, follow',
};

const ROBOTS_OPTIONS = [
  { value: 'index, follow', label: 'Index & Follow (default)' },
  { value: 'noindex, follow', label: 'No Index, Follow' },
  { value: 'index, nofollow', label: 'Index, No Follow' },
  { value: 'noindex, nofollow', label: 'No Index & No Follow' },
  { value: 'noindex', label: 'No Index' },
  { value: 'nofollow', label: 'No Follow' },
  { value: 'none', label: 'None' },
];

export interface SEOEditorProps {
  /** Current SEO data */
  value?: Partial<SeoData>;
  /** Called when any SEO field changes */
  onChange?: (seo: SeoData) => void;
  /** Show as collapsed accordion by default */
  collapsed?: boolean;
  /** Disable all fields */
  disabled?: boolean;
}

// ── Character counter component ──────────────────────────────────

function CharCount({ current, max }: { current: number; max: number }) {
  const ratio = current / max;
  const color =
    ratio > 0.9 ? 'text-danger-500' : ratio > 0.75 ? 'text-warning-500' : 'text-text-muted';

  return (
    <span className={cn('text-[10px] tabular-nums', color)}>
      {current}/{max}
    </span>
  );
}

// ── Field wrapper ────────────────────────────────────────────────

interface SeoFieldProps {
  label: string;
  current: number;
  max: number;
  children: React.ReactNode;
}

function SeoField({ label, current, max, children }: SeoFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <CharCount current={current} max={max} />
      </div>
      {children}
      <div className="relative">
        <div
          className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-200"
          style={{
            width: `${Math.min((current / max) * 100, 100)}%`,
            backgroundColor:
              current > max
                ? 'var(--color-danger-500, #ef4444)'
                : current > max * 0.9
                  ? 'var(--color-warning-500, #f59e0b)'
                  : 'var(--color-primary, #2563eb)',
            opacity: current > 0 ? 0.5 : 0,
          }}
        />
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────

export function SEOEditor({
  value = {},
  onChange,
  collapsed = true,
  disabled = false,
}: SEOEditorProps) {
  const seo: SeoData = { ...DEFAULT_SEO, ...value };

  const update = useCallback(
    (key: keyof SeoData, val: string) => {
      if (!onChange) return;
      onChange({ ...seo, [key]: val });
    },
    [seo, onChange],
  );

  return (
    <details open={!collapsed} className="group rounded-lg border border-border-default">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-text-primary hover:bg-neutral-50 transition-colors select-none marker:hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-text-muted"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
        SEO Settings
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="ml-auto text-text-muted transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="space-y-4 border-t border-border-default px-4 py-4">
        {/* Meta Title */}
        <SeoField label="Meta Title" current={seo.metaTitle.length} max={60}>
          <Input
            value={seo.metaTitle}
            onChange={(e) => update('metaTitle', e.target.value)}
            placeholder="Masukkan meta title (max 60 karakter)"
            maxLength={70}
            disabled={disabled}
          />
        </SeoField>

        {/* Meta Description */}
        <SeoField label="Meta Description" current={seo.metaDescription.length} max={160}>
          <Textarea
            value={seo.metaDescription}
            onChange={(e) => update('metaDescription', e.target.value)}
            placeholder="Masukkan meta description (max 160 karakter)"
            rows={2}
            maxLength={170}
            disabled={disabled}
          />
        </SeoField>

        {/* Divider */}
        <hr className="border-border-default" />

        {/* OpenGraph Title */}
        <SeoField label="OG Title" current={seo.ogTitle.length} max={100}>
          <Input
            value={seo.ogTitle}
            onChange={(e) => update('ogTitle', e.target.value)}
            placeholder="OG Title (gunakan default dari Meta Title jika kosong)"
            maxLength={110}
            disabled={disabled}
          />
        </SeoField>

        {/* OpenGraph Description */}
        <SeoField label="OG Description" current={seo.ogDescription.length} max={300}>
          <Textarea
            value={seo.ogDescription}
            onChange={(e) => update('ogDescription', e.target.value)}
            placeholder="OG Description (gunakan default dari Meta Description jika kosong)"
            rows={2}
            maxLength={310}
            disabled={disabled}
          />
        </SeoField>

        {/* OpenGraph Image */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-text-primary">OG Image URL</span>
          <Input
            value={seo.ogImage}
            onChange={(e) => update('ogImage', e.target.value)}
            placeholder="https://example.com/image.jpg"
            disabled={disabled}
          />
        </div>

        {/* Divider */}
        <hr className="border-border-default" />

        {/* Canonical URL */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-text-primary">Canonical URL</span>
          <Input
            value={seo.canonicalUrl}
            onChange={(e) => update('canonicalUrl', e.target.value)}
            placeholder="https://spesialis.id/halaman-ini"
            disabled={disabled}
          />
        </div>

        {/* Robots */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-text-primary">Robots</span>
          <Select
            value={seo.robots}
            onChange={(e) => update('robots', e.target.value)}
            options={ROBOTS_OPTIONS}
            disabled={disabled}
          />
        </div>

        {/* Live preview */}
        <div className="rounded-md border border-border-default bg-bg-page p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Google Preview
          </p>
          <div className="mt-2 space-y-0.5">
            <p className="text-sm font-medium text-primary line-clamp-1">
              {seo.metaTitle || 'Meta Title akan tampil di sini'}
            </p>
            <p className="text-xs text-success-600 line-clamp-1">
              {seo.canonicalUrl || 'https://spesialis.id/...'}
            </p>
            <p className="text-xs text-text-muted line-clamp-2">
              {seo.metaDescription || 'Meta description akan tampil di sini...'}
            </p>
          </div>
        </div>
      </div>
    </details>
  );
}
