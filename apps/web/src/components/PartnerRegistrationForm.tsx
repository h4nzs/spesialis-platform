import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient, parseApiError } from '@ahlipanggilan/shared';
import { Button, Input, Card } from '@ahlipanggilan/ui';
import { partnerRegistrationSchema } from '@ahlipanggilan/validation';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  displayOrder: number;
}

interface ServiceItem {
  id: string;
  name: string;
  categoryId: string;
}

const ICON_MAP: Record<string, string> = {
  'alert-triangle': '🚨',
  truck: '🚗',
  monitor: '📺',
  droplet: '🚿',
  zap: '⚡',
  sparkles: '🧹',
  hammer: '🏠',
  wrench: '🔩',
  road: '🛣️',
  'trash-2': '🚽',
  bug: '🐜',
  tree: '🌳',
  shield: '🛡️',
  car: '🚘',
  users: '🏡',
  search: '🔍',
  'more-horizontal': '📋',
};

export function PartnerRegistrationForm() {
  const api = useMemo(() => createBrowserClient(), []);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    ktpNumber: '',
    domicile: '',
  });

  // selectedServiceIds: simpan ID layanan yang diceklis
  // Saat submit, di-resolve ke categoryId unik (backend tetap simpan categoryId)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [suggestedServiceName, setSuggestedServiceName] = useState('');
  const [suggestedServiceDescription, setSuggestedServiceDescription] = useState('');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [loadingCats, setLoadingCats] = useState(true);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<CategoryItem[]>('/api/v1/public/service-categories'),
      api.get<ServiceItem[]>('/api/v1/services', { params: { limit: 200 } }),
    ])
      .then(([cats, svcData]) => {
        const catList = Array.isArray(cats) ? cats : [];
        const svcList = Array.isArray(svcData) ? svcData : [];
        setCategories(catList);
        setServices(svcList);
        // Auto-expand kategori pertama
        if (catList.length > 0) {
          setExpandedCats(new Set([catList[0]!.id]));
        }
      })
      .catch(() => {
        // silent
      })
      .finally(() => setLoadingCats(false));
  }, [api]);

  /** Group services by categoryId */
  const servicesByCategory = useMemo(() => {
    const map: Record<string, ServiceItem[]> = {};
    for (const svc of services) {
      if (!map[svc.categoryId]) map[svc.categoryId] = [];
      map[svc.categoryId]!.push(svc);
    }
    return map;
  }, [services]);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    );
  }

  function selectAllInCategory(categoryId: string) {
    const svcIds = servicesByCategory[categoryId]?.map((s) => s.id) ?? [];
    setSelectedServiceIds((prev) => {
      const allSelected = svcIds.every((id) => prev.includes(id));
      if (allSelected) {
        // Uncheck all in this category
        return prev.filter((id) => !svcIds.includes(id));
      }
      // Check all in this category
      const toAdd = svcIds.filter((id) => !prev.includes(id));
      return [...prev, ...toAdd];
    });
  }

  function toggleCategory(categoryId: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    // Resolve selected service IDs to unique category IDs
    const resolvedCategoryIds = [
      ...new Set(
        selectedServiceIds
          .map((svcId) => {
            const svc = services.find((s) => s.id === svcId);
            return svc?.categoryId;
          })
          .filter(Boolean),
      ),
    ] as string[];

    const parsed = partnerRegistrationSchema.safeParse({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      ktpNumber: form.ktpNumber,
      domicile: form.domicile || undefined,
      skillIds: resolvedCategoryIds.length > 0 ? resolvedCategoryIds : undefined,
      suggestedServiceName: suggestedServiceName.trim() || undefined,
      suggestedServiceDescription: suggestedServiceDescription.trim() || undefined,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/api/v1/partners/register', { body: parsed.data });
      setSuccess(true);
    } catch (err: unknown) {
      const { fieldErrors, generalError } = parseApiError(err, 'Registrasi gagal');
      const newErrors: { field: string; message: string }[] = Object.entries(fieldErrors).map(
        ([field, message]) => ({ field, message }),
      );
      if (generalError) newErrors.push({ field: '', message: generalError });
      setErrors(newErrors);
    } finally {
      setSubmitting(false);
    }
  }

  function getError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function isCategoryAllSelected(categoryId: string): boolean {
    const svcIds = servicesByCategory[categoryId] ?? [];
    return svcIds.length > 0 && svcIds.every((s) => selectedServiceIds.includes(s.id));
  }

  function isCategorySomeSelected(categoryId: string): boolean {
    const svcIds = servicesByCategory[categoryId] ?? [];
    return svcIds.some((s) => selectedServiceIds.includes(s.id));
  }

  if (success) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-lg font-semibold text-success">Registrasi Berhasil!</p>
        <p className="mt-2 text-sm text-text-secondary">
          Akun Anda sedang menunggu verifikasi Admin. Kami akan menghubungi Anda setelah akun
          disetujui.
        </p>
        <a href="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
          Masuk ke Akun
        </a>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.some((e) => !e.field) && (
        <div className="rounded-md bg-danger-500/10 p-3 text-sm text-danger-500">
          {errors.find((e) => !e.field)?.message}
        </div>
      )}

      {/* ── Data Diri ──────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Data Diri</h2>

        <Input
          label="Nama Lengkap"
          value={form.fullName}
          onChange={(e) => setField('fullName', e.target.value)}
          placeholder="Masukkan nama lengkap"
          error={getError('fullName')}
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          placeholder="contoh@email.com"
          error={getError('email')}
          required
        />
        <Input
          label="Nomor HP"
          type="tel"
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value)}
          placeholder="6281234567890"
          error={getError('phone')}
          required
        />
        <Input
          label="Nomor KTP"
          value={form.ktpNumber}
          onChange={(e) => setField('ktpNumber', e.target.value)}
          placeholder="16 digit nomor KTP"
          error={getError('ktpNumber')}
          required
        />
        <Input
          label="Domisili"
          value={form.domicile}
          onChange={(e) => setField('domicile', e.target.value)}
          placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
          error={getError('domicile')}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          placeholder="Minimal 8 karakter, huruf besar, huruf kecil, angka"
          error={getError('password')}
          required
        />
      </div>

      {/* ── Keahlian ────────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-text-primary">
          Keahlian
          <span className="ml-1 font-normal text-xs text-text-muted">(pilih minimal 1)</span>
        </h2>

        {loadingCats ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-neutral-100" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-text-muted">Gagal memuat daftar keahlian</p>
        ) : (
          <div className="space-y-1.5">
            {categories.map((cat) => {
              const isExpanded = expandedCats.has(cat.id);
              const catServices = servicesByCategory[cat.id] ?? [];
              const allSelected = isCategoryAllSelected(cat.id);
              const someSelected = isCategorySomeSelected(cat.id);

              return (
                <div
                  key={cat.id}
                  className="overflow-hidden rounded-lg border border-border-default"
                >
                  {/* ── Category header (click to expand) ── */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="flex w-full items-center gap-3 bg-bg-surface px-4 py-3 text-left transition-colors hover:bg-neutral-50"
                  >
                    <span className="shrink-0 text-lg">{ICON_MAP[cat.icon ?? ''] ?? '📋'}</span>
                    <span className="flex-1 text-sm font-semibold text-text-primary">
                      {cat.name}
                    </span>
                    <span className="text-xs text-text-muted tabular-nums">
                      {catServices.length} layanan
                    </span>
                    {/* Select all toggle */}
                    {catServices.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectAllInCategory(cat.id);
                        }}
                        className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                          allSelected
                            ? 'bg-primary-100 text-primary-700'
                            : someSelected
                              ? 'bg-primary-50 text-primary-600'
                              : 'bg-neutral-100 text-text-muted hover:bg-neutral-200'
                        }`}
                      >
                        {allSelected ? 'Semua' : someSelected ? 'Sebagian' : 'Pilih'}
                      </button>
                    )}
                    {/* Expand/collapse arrow */}
                    <svg
                      className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {/* ── Service checkboxes (collapsible) ── */}
                  {isExpanded && catServices.length > 0 && (
                    <div className="border-t border-border-default bg-white">
                      {catServices.map((svc) => {
                        const isChecked = selectedServiceIds.includes(svc.id);
                        return (
                          <label
                            key={svc.id}
                            className={`flex cursor-pointer items-center gap-3 border-b border-border-default/50 px-4 py-2.5 text-sm transition-colors last:border-b-0 hover:bg-primary-50/30 ${
                              isChecked ? 'bg-primary-50/50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleService(svc.id)}
                              className="h-4 w-4 rounded border-border-default text-primary-600 focus:ring-primary-500"
                            />
                            <span
                              className={`flex-1 ${
                                isChecked ? 'font-medium text-text-primary' : 'text-text-secondary'
                              }`}
                            >
                              {svc.name}
                            </span>
                            {isChecked && (
                              <svg
                                className="h-4 w-4 shrink-0 text-primary-600"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty category */}
                  {isExpanded && catServices.length === 0 && (
                    <div className="border-t border-border-default px-4 py-3 text-xs text-text-muted">
                      Belum ada layanan di kategori ini
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Selected count summary */}
        {!loadingCats && selectedServiceIds.length > 0 && (
          <p className="text-xs text-text-muted">
            {selectedServiceIds.length} layanan dipilih (
            {
              new Set(
                selectedServiceIds
                  .map((id) => services.find((s) => s.id === id)?.categoryId)
                  .filter(Boolean),
              ).size
            }{' '}
            kategori)
          </p>
        )}

        {errors.some((e) => e.field === 'skillIds') && (
          <p className="text-xs text-danger-500">
            {errors.find((e) => e.field === 'skillIds')?.message}
          </p>
        )}
      </div>

      {/* ── Usulkan Layanan Baru ──────────────────────────── */}
      <div className="rounded-lg border border-dashed border-primary-300 bg-primary-50/30 p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <h3 className="text-sm font-semibold text-text-primary">
            Usulkan Layanan Baru yang Belum Ada
          </h3>
        </div>
        <p className="mt-1 text-xs text-text-muted">
          Tidak menemukan layanan yang sesuai dengan keahlian Anda? Usulkan di sini agar tim kami
          pertimbangkan untuk ditambahkan.
        </p>
        <div className="mt-3 space-y-3">
          <Input
            label="Nama Layanan"
            value={suggestedServiceName}
            onChange={(e) => setSuggestedServiceName(e.target.value)}
            placeholder="Contoh: Servis Power Supply"
          />
          <Input
            label="Deskripsi Singkat (opsional)"
            value={suggestedServiceDescription}
            onChange={(e) => setSuggestedServiceDescription(e.target.value)}
            placeholder="Jelaskan layanan yang Anda kuasai..."
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Mendaftarkan...' : 'Daftar sebagai Mitra'}
      </Button>
      <p className="text-center text-xs text-text-secondary">
        Sudah punya akun?{' '}
        <a href="/login" className="text-primary hover:underline">
          Masuk
        </a>
      </p>
    </form>
  );
}
