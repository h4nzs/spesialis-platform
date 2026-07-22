import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Button, Card, EmptyState, Spinner, Badge } from '@ahlipanggilan/ui';

// ── Types ─────────────────────────────────────────────────────────

interface SkillItem {
  id: string;
  categoryId: string;
  categoryName: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  createdAt: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

const PROFICIENCY_OPTIONS = [
  { value: 'Beginner', label: 'Pemula' },
  { value: 'Intermediate', label: 'Menengah' },
  { value: 'Advanced', label: 'Mahir' },
  { value: 'Expert', label: 'Ahli' },
] as const;

const PROFICIENCY_VARIANT: Record<string, 'default' | 'warning' | 'success'> = {
  Beginner: 'default',
  Intermediate: 'warning',
  Advanced: 'success',
  Expert: 'success',
};

// ── Component ─────────────────────────────────────────────────────

export function PartnerSkills() {
  const api = useMemo(() => createBrowserClient(), []);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('Intermediate');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Load data ──────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [skillsResult, categoriesResult] = await Promise.all([
        api.get<SkillItem[]>('/api/v1/partners/me/skills'),
        api.get<CategoryOption[]>('/api/v1/service-categories'),
      ]);
      setSkills(Array.isArray(skillsResult) ? skillsResult : []);
      setCategories(Array.isArray(categoriesResult) ? categoriesResult : []);
    } catch {
      setError('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Available categories (not yet added) ───────────────────────

  const availableCategories = useMemo(() => {
    const existingIds = new Set(skills.map((s) => s.categoryId));
    return categories.filter((c) => !existingIds.has(c.id));
  }, [categories, skills]);

  // ── Add skill ──────────────────────────────────────────────────

  async function handleAdd() {
    if (!selectedCategory) return;
    setAdding(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/api/v1/partners/me/skills', {
        body: {
          categoryId: selectedCategory,
          proficiency: selectedProficiency,
        },
      });
      setSelectedCategory('');
      setSelectedProficiency('Intermediate');
      setSuccess('Keahlian berhasil ditambahkan');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan keahlian');
    } finally {
      setAdding(false);
    }
  }

  // ── Remove skill ───────────────────────────────────────────────

  async function handleRemove(skillId: string) {
    setRemovingId(skillId);
    setError('');
    try {
      await api.delete(`/api/v1/partners/me/skills/${skillId}`);
      setSuccess('Keahlian berhasil dihapus');
      await loadData();
    } catch {
      setError('Gagal menghapus keahlian');
    } finally {
      setRemovingId(null);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────

  function getProficiencyLabel(value: string): string {
    return PROFICIENCY_OPTIONS.find((o) => o.value === value)?.label ?? value;
  }

  // ── Render ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {error && (
        <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
          {error}
          <button
            type="button"
            onClick={() => setError('')}
            className="ml-2 underline hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
          {success}
          <button
            type="button"
            onClick={() => setSuccess('')}
            className="ml-2 underline hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Add Skill Section ────────────────────────────────────── */}
      <Card padding="lg">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Tambah Keahlian Baru</h3>

        {availableCategories.length === 0 ? (
          <div className="rounded-lg border border-border-default bg-bg-page px-4 py-6 text-center">
            <p className="text-sm text-text-secondary">
              Semua kategori sudah ditambahkan. Jika ada kategori baru, silakan hubungi admin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category Select */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                Kategori Keahlian
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 w-full rounded-lg border border-border-default bg-bg-surface px-3 text-sm text-text-primary outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Pilih kategori...</option>
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Proficiency Select */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                Tingkat Keahlian
              </label>
              <div className="flex flex-wrap gap-2">
                {PROFICIENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedProficiency(opt.value)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                      selectedProficiency === opt.value
                        ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                        : 'bg-neutral-100 text-text-muted hover:bg-neutral-200 hover:text-text-primary'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Button */}
            <div className="flex justify-end">
              <Button onClick={handleAdd} disabled={!selectedCategory || adding}>
                {adding ? 'Menambahkan...' : 'Tambah Keahlian'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── My Skills Section ────────────────────────────────────── */}
      <Card padding="lg">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">
          Keahlian Saya ({skills.length})
        </h3>

        {skills.length === 0 ? (
          <EmptyState
            title="Belum ada keahlian"
            description="Tambahkan keahlian Anda dari daftar kategori layanan yang tersedia"
          />
        ) : (
          <div className="space-y-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-4 rounded-lg border border-border-default bg-bg-page p-3 transition-colors hover:bg-neutral-50"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-sm text-primary-600">
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
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text-primary">{skill.categoryName}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    Ditambahkan{' '}
                    {new Date(skill.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Proficiency Badge */}
                <Badge variant={PROFICIENCY_VARIANT[skill.proficiency] ?? 'default'}>
                  {getProficiencyLabel(skill.proficiency)}
                </Badge>

                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="danger"
                  disabled={removingId === skill.id}
                  onClick={() => handleRemove(skill.id)}
                  className="shrink-0"
                >
                  {removingId === skill.id ? '...' : 'Hapus'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
