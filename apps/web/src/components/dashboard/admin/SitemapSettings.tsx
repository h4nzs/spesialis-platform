import { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Input, Select, Button } from '@specialist/ui';

// ── Types ──────────────────────────────────────────────────────

interface SitemapConfig {
  priority: string;
  changefreq: string;
}

interface PageTypeSetting {
  key: string;
  label: string;
  config: SitemapConfig;
}

interface IndexNowState {
  key: string;
  keyLocation: string;
  enabled: boolean;
}

const CHANGEFREQ_OPTIONS = [
  { value: 'always', label: 'Always' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'never', label: 'Never' },
];

// ── Component ──────────────────────────────────────────────────

export function SitemapSettings() {
  const api = useMemo(() => createBrowserClient(), []);

  const [pageTypes, setPageTypes] = useState<PageTypeSetting[]>([
    {
      key: 'staticPages',
      label: 'Halaman Statis',
      config: { priority: '1.0', changefreq: 'weekly' },
    },
    { key: 'services', label: 'Layanan', config: { priority: '0.8', changefreq: 'weekly' } },
    { key: 'articles', label: 'Artikel', config: { priority: '0.7', changefreq: 'weekly' } },
    { key: 'blogListing', label: 'Halaman Blog', config: { priority: '0.8', changefreq: 'daily' } },
    { key: 'cmsPages', label: 'Halaman CMS', config: { priority: '0.6', changefreq: 'monthly' } },
  ]);

  const [indexnow, setIndexnow] = useState<IndexNowState>({
    key: '',
    keyLocation: '',
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Load settings ──────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [settingsData, indexnowData] = await Promise.all([
          api.get<Record<string, Array<{ key: string; value: string }>>>('/api/v1/admin/settings'),
          api.get<IndexNowState>('/api/v1/indexnow/key').catch(() => null),
        ]);

        const sitemapSettings = settingsData?.sitemap ?? [];

        setPageTypes((prev) =>
          prev.map((pt) => {
            const priorityKey = `sitemap_${pt.key}_priority`;
            const changefreqKey = `sitemap_${pt.key}_changefreq`;

            const priorityVal = sitemapSettings.find((s) => s.key === priorityKey)?.value;
            const changefreqVal = sitemapSettings.find((s) => s.key === changefreqKey)?.value;

            return {
              ...pt,
              config: {
                priority: priorityVal ?? pt.config.priority,
                changefreq: changefreqVal ?? pt.config.changefreq,
              },
            };
          }),
        );

        if (indexnowData) {
          setIndexnow(indexnowData);
        }
      } catch {
        // Use defaults if API unavailable
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [api]);

  // ── Update handlers ────────────────────────────────────────
  const handlePriorityChange = useCallback((key: string, value: string) => {
    setPageTypes((prev) =>
      prev.map((pt) =>
        pt.key === key ? { ...pt, config: { ...pt.config, priority: value } } : pt,
      ),
    );
  }, []);

  const handleChangefreqChange = useCallback((key: string, value: string) => {
    setPageTypes((prev) =>
      prev.map((pt) =>
        pt.key === key ? { ...pt, config: { ...pt.config, changefreq: value } } : pt,
      ),
    );
  }, []);

  const handleEnabledToggle = useCallback(() => {
    setIndexnow((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  // ── Copy IndexNow key ──────────────────────────────────────
  const handleCopyKey = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(indexnow.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [indexnow.key]);

  // ── Save ───────────────────────────────────────────────────
  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const settings: Array<{
        key: string;
        value: string;
        category: string;
        description: string;
      }> = [];

      for (const pt of pageTypes) {
        settings.push({
          key: `sitemap_${pt.key}_priority`,
          value: pt.config.priority,
          category: 'sitemap',
          description: `Prioritas sitemap untuk ${pt.label}`,
        });
        settings.push({
          key: `sitemap_${pt.key}_changefreq`,
          value: pt.config.changefreq,
          category: 'sitemap',
          description: `Frekuensi perubahan sitemap untuk ${pt.label}`,
        });
      }

      settings.push({
        key: 'indexnow_enabled',
        value: indexnow.enabled ? 'true' : 'false',
        category: 'sitemap',
        description: 'Auto-ping IndexNow saat artikel dipublikasikan',
      });

      await api.patch('/api/v1/admin/settings', { body: { settings } });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan sitemap';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  // ── Validate priority ──────────────────────────────────────
  function isValidPriority(val: string): boolean {
    const n = parseFloat(val);
    return !isNaN(n) && n >= 0 && n <= 1;
  }

  if (loading) {
    return (
      <section>
        <hr className="border-border-default" />
        <h2 className="mb-4 mt-8 text-lg font-semibold text-text-primary">
          Pengaturan Sitemap & IndexNow
        </h2>
        <p className="text-sm text-text-secondary">Memuat pengaturan...</p>
      </section>
    );
  }

  return (
    <section data-testid="sitemap-settings">
      <hr className="border-border-default" />
      <h2 className="mb-4 mt-8 text-lg font-semibold text-text-primary">
        Pengaturan Sitemap & IndexNow
      </h2>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* ── Priority & Changefreq per page type ──────────────── */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-text-primary">
            Prioritas & Frekuensi per Tipe Halaman
          </p>
          <div className="space-y-3">
            {pageTypes.map((pt) => (
              <div
                key={pt.key}
                className="grid grid-cols-[1fr_100px_140px] items-center gap-3 rounded-md border border-border-default bg-bg-surface p-3"
              >
                <span className="text-sm font-medium text-text-primary">{pt.label}</span>
                <div className="space-y-0.5">
                  <Input
                    data-testid={`priority-${pt.key}`}
                    value={pt.config.priority}
                    onChange={(e) => handlePriorityChange(pt.key, e.target.value)}
                    placeholder="0.8"
                    type="text"
                    inputMode="decimal"
                    className={`text-center ${!isValidPriority(pt.config.priority) ? 'border-danger-500' : ''}`}
                  />
                  <p className="text-[10px] text-text-muted text-center">Priority (0.0–1.0)</p>
                </div>
                <Select
                  data-testid={`changefreq-${pt.key}`}
                  value={pt.config.changefreq}
                  onChange={(e) => handleChangefreqChange(pt.key, e.target.value)}
                  options={CHANGEFREQ_OPTIONS}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── IndexNow Settings ────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-text-primary">IndexNow</p>

          <div className="rounded-md border border-border-default bg-bg-surface p-3 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-muted">API Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-neutral-100 px-2 py-1.5 text-xs font-mono text-text-primary">
                  {indexnow.key ||
                    '(belum dibuat — akan auto-generate saat pertama kali digunakan)'}
                </code>
                {indexnow.key && (
                  <Button size="sm" variant="ghost" type="button" onClick={handleCopyKey}>
                    {copied ? 'Tersalin!' : 'Salin'}
                  </Button>
                )}
              </div>
            </div>

            {indexnow.keyLocation && (
              <div>
                <label className="mb-1 block text-xs font-medium text-text-muted">
                  File Lokasi Key
                </label>
                <code className="block truncate rounded bg-neutral-100 px-2 py-1.5 text-xs font-mono text-text-primary">
                  {indexnow.keyLocation}
                </code>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input
                type="checkbox"
                data-testid="indexnow-enabled"
                checked={indexnow.enabled}
                onChange={handleEnabledToggle}
                className="rounded border-border-default"
              />
              Auto-ping IndexNow saat artikel dipublikasikan
            </label>
          </div>
        </div>

        {/* ── Messages ─────────────────────────────────────────── */}
        {error && <p className="text-sm text-danger-500">{error}</p>}
        {success && (
          <p className="text-sm text-success-500">Pengaturan sitemap berhasil disimpan</p>
        )}

        {/* ── Submit ───────────────────────────────────────────── */}
        <Button type="submit" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan Sitemap'}
        </Button>
      </form>
    </section>
  );
}
