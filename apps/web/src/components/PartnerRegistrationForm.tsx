import { useState, useEffect } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
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
  const api = createBrowserClient();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    ktpNumber: '',
    domicile: '',
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get<CategoryItem[]>('/api/v1/public/service-categories')
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // silent
      })
      .finally(() => setLoadingCats(false));
  }, [api]);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => prev.filter((e) => e.field !== field));
  }

  function toggleSkill(categoryId: string) {
    setSelectedSkills((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    );
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);

    const parsed = partnerRegistrationSchema.safeParse({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      ktpNumber: form.ktpNumber,
      domicile: form.domicile || undefined,
      skillIds: selectedSkills.length > 0 ? selectedSkills : undefined,
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
      const msg = err instanceof Error ? err.message : 'Registrasi gagal';
      setErrors([{ field: '', message: msg }]);
    } finally {
      setSubmitting(false);
    }
  }

  function getError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
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
        <h2 className="text-body-sm font-semibold text-text-primary">Data Diri</h2>

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
      <div className="space-y-3">
        <h2 className="text-body-sm font-semibold text-text-primary">
          Keahlian
          <span className="ml-1 text-text-muted font-normal text-xs">(pilih minimal 1)</span>
        </h2>

        {loadingCats ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-100" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-text-muted">Gagal memuat daftar keahlian</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categories.map((cat) => {
              const isSelected = selectedSkills.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleSkill(cat.id)}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-body-sm font-medium transition-all duration-150 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                      : 'border-border-default bg-white text-text-secondary hover:border-primary-200 hover:bg-primary-50/50'
                  }`}
                >
                  <span className="text-base shrink-0">{ICON_MAP[cat.icon ?? ''] ?? '📋'}</span>
                  <span className="line-clamp-1">{cat.name}</span>
                  {isSelected && (
                    <svg
                      className="ml-auto h-4 w-4 shrink-0 text-primary-600"
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
                </button>
              );
            })}
          </div>
        )}
        {errors.some((e) => e.field === 'skillIds') && (
          <p className="text-xs text-danger-500">
            {errors.find((e) => e.field === 'skillIds')?.message}
          </p>
        )}
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
