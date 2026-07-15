import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import {
  Table,
  Button,
  Modal,
  Input,
  EmptyState,
  CSVExportButton,
  TableSkeleton,
} from '@ahlipanggilan/ui';
import type { Column } from '@ahlipanggilan/ui';

interface PartnerItem {
  id: string;
  fullName: string;
  availability: string;
  verificationStatus: string;
  completedJobs: number;
  ratingAverage: string | null;
  domicile: string | null;
}

export function AdminPartners() {
  const api = useMemo(() => createBrowserClient(), []);
  const [partners, setPartners] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPartnerId, setRejectPartnerId] = useState<string | null>(null);
  const [rejectPartnerName, setRejectPartnerName] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  interface SkillInfo {
    id: string;
    categoryId: string;
    categoryName: string;
    proficiency: string;
  }

  interface CategoryOption {
    id: string;
    name: string;
  }

  const [showEditModal, setShowEditModal] = useState(false);
  const [editPartner, setEditPartner] = useState<PartnerItem | null>(null);
  const [editDomicile, setEditDomicile] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSelectedSkills, setEditSelectedSkills] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);
  const [editLoadingSkills, setEditLoadingSkills] = useState(false);

  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<PartnerItem[]>('/api/v1/partners');
      setPartners(Array.isArray(data) ? data : []);
    } catch {
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  async function handleApprove(partnerId: string) {
    try {
      await api.post(`/api/v1/partners/${partnerId}/verify`, {
        body: { verificationStatus: 'Approved' },
      });
      await loadPartners();
    } catch {
      // silent
    }
  }

  function openRejectModal(item: PartnerItem) {
    setRejectPartnerId(item.id);
    setRejectPartnerName(item.fullName);
    setRejectNote('');
    setShowRejectModal(true);
  }

  function openEditModal(item: PartnerItem) {
    setEditPartner(item);
    setEditDomicile(item.domicile ?? '');
    setEditSelectedSkills([]);
    setEditError('');
    setShowEditModal(true);

    // Fetch partner detail (including skills) + all categories
    setEditLoadingSkills(true);
    Promise.all([
      api.get<{ data: { skills: SkillInfo[] } }>(`/api/v1/partners/${item.id}`),
      api.get<CategoryOption[]>('/api/v1/admin/service-categories'),
    ])
      .then(([partnerDetail, categories]) => {
        const pd = partnerDetail as unknown as {
          skills?: SkillInfo[];
          data?: { skills?: SkillInfo[] };
        };
        const skills = pd?.data?.skills ?? pd?.skills ?? [];
        setEditSelectedSkills(
          (Array.isArray(skills) ? skills : []).map((s: SkillInfo) => s.categoryId),
        );
        setAllCategories(Array.isArray(categories) ? categories : []);
      })
      .catch(() => {})
      .finally(() => setEditLoadingSkills(false));
  }

  async function handleEditSave() {
    if (!editPartner) return;
    setEditSaving(true);
    setEditError('');
    try {
      await Promise.all([
        api.patch(`/api/v1/partners/${editPartner.id}`, {
          body: { domicile: editDomicile || undefined },
        }),
        api.patch(`/api/v1/partners/${editPartner.id}/skills`, {
          body: { skillIds: editSelectedSkills },
        }),
      ]);
      setShowEditModal(false);
      await loadPartners();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan';
      setEditError(msg);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleReject() {
    if (!rejectPartnerId) return;
    setSubmitting(true);
    try {
      await api.post(`/api/v1/partners/${rejectPartnerId}/verify`, {
        body: {
          verificationStatus: 'Rejected',
          note: rejectNote.trim() || undefined,
        },
      });
      setShowRejectModal(false);
      await loadPartners();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  const columns: Column<PartnerItem>[] = [
    {
      key: 'fullName',
      header: 'Nama',
      render: (item) => (
        <div>
          <span className="font-medium text-text-primary">{item.fullName}</span>
          {item.domicile && <span className="ml-2 text-xs text-text-muted">{item.domicile}</span>}
        </div>
      ),
    },
    { key: 'verificationStatus', header: 'Verifikasi' },
    { key: 'availability', header: 'Ketersediaan' },
    {
      key: 'completedJobs',
      header: 'Pekerjaan',
      render: (item) => item.completedJobs.toString(),
    },
    {
      key: 'ratingAverage',
      header: 'Rating',
      render: (item) => (item.ratingAverage ? Number(item.ratingAverage).toFixed(1) : '-'),
    },
    {
      key: 'id',
      header: 'Aksi',
      render: (item) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => openEditModal(item)}>
            Edit
          </Button>
          {item.verificationStatus !== 'Approved' && (
            <Button size="sm" onClick={() => handleApprove(item.id)}>
              Setujui
            </Button>
          )}
          {item.verificationStatus !== 'Rejected' && (
            <Button size="sm" variant="danger" onClick={() => openRejectModal(item)}>
              Tolak
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        {partners.length > 0 && (
          <CSVExportButton
            data={partners as unknown as Record<string, unknown>[]}
            columns={[
              { key: 'fullName', label: 'Nama' },
              { key: 'verificationStatus', label: 'Verifikasi' },
              { key: 'availability', label: 'Ketersediaan' },
              {
                key: 'completedJobs',
                label: 'Pekerjaan',
                format: (v) => String(v ?? ''),
              },
              {
                key: 'ratingAverage',
                label: 'Rating',
                format: (v) => (v ? Number(v).toFixed(1) : '-'),
              },
            ]}
            filename="partner-export.csv"
          />
        )}
      </div>
      <Table
        columns={columns}
        data={partners}
        keyExtractor={(p) => p.id}
        emptyState={<EmptyState title="Belum ada partner" />}
      />

      {/* ── Edit Partner Modal ──────────────────────────────── */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={`Edit Partner — ${editPartner?.fullName ?? ''}`}
      >
        <div className="space-y-4">
          {editError && <p className="text-sm text-danger">{editError}</p>}
          <Input
            label="Domisili"
            value={editDomicile}
            onChange={(e) => setEditDomicile(e.target.value)}
            placeholder="Contoh: Jakarta Selatan, DKI Jakarta"
          />

          <hr className="border-border-default" />

          <div>
            <h3 className="mb-2 text-body-sm font-semibold text-text-primary">
              Keahlian
              <span className="ml-1 font-normal text-text-muted text-xs">
                ({editSelectedSkills.length} dipilih)
              </span>
            </h3>
            {editLoadingSkills ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100" />
                ))}
              </div>
            ) : allCategories.length === 0 ? (
              <p className="text-sm text-text-muted">Tidak ada kategori</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {allCategories.map((cat) => {
                  const isSelected = editSelectedSkills.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setEditSelectedSkills((prev) =>
                          prev.includes(cat.id)
                            ? prev.filter((id) => id !== cat.id)
                            : [...prev, cat.id],
                        )
                      }
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-body-sm font-medium transition-all duration-150 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500'
                          : 'border-border-default bg-white text-text-secondary hover:border-primary-200 hover:bg-primary-50/50'
                      }`}
                    >
                      <span className="line-clamp-1 flex-1">{cat.name}</span>
                      {isSelected && (
                        <svg
                          className="h-3.5 w-3.5 shrink-0 text-primary-600"
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
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-default">
            <Button variant="ghost" type="button" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
            <Button type="button" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Reject Reason Modal ─────────────────────────────── */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title={`Tolak Partner — ${rejectPartnerName}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Berikan alasan penolakan. Partner akan menerima notifikasi dan email berisi alasan ini.
          </p>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={4}
            maxLength={500}
            className="w-full rounded-md border border-border-default bg-bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            placeholder="Contoh: Dokumen KTP tidak jelas, data tidak lengkap..."
          />
          <p className="text-xs text-text-muted">{rejectNote.length}/500 karakter</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowRejectModal(false)}>
              Batal
            </Button>
            <Button variant="danger" type="button" onClick={handleReject} disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Tolak Partner'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
