import { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient, SEO_PERMISSION_KEYS, STAFF_ROLES } from '@specialist/shared';
import { Card, Button } from '@specialist/ui';
import type { UserRole } from '@specialist/types';

interface PermissionState {
  [permKey: string]: {
    enabled: boolean;
    allowedRoles: Set<UserRole>;
  };
}

const STAFF_ROLE_LABELS: Record<UserRole, string> = {
  content_manager: 'Content',
  dispatcher: 'Dispatcher',
  finance: 'Finance',
  admin: 'Admin',
  super_admin: 'Super Admin',
  customer: '-',
  partner: '-',
  corporate: '-',
};

const STAFF_ROLE_COLORS: Record<UserRole, string> = {
  content_manager: 'bg-violet-100 text-violet-700 border-violet-200',
  dispatcher: 'bg-amber-100 text-amber-700 border-amber-200',
  finance: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  super_admin: 'bg-red-100 text-red-700 border-red-200',
  customer: '',
  partner: '',
  corporate: '',
};

export function RoleManager() {
  const api = useMemo(() => createBrowserClient(), []);
  const [permissions, setPermissions] = useState<PermissionState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const settings =
        await api.get<Record<string, Array<{ key: string; value: string }>>>(
          '/api/v1/admin/settings',
        );
      const seoPerms = settings.seo_permissions ?? [];

      const state: PermissionState = {};
      for (const perm of SEO_PERMISSION_KEYS) {
        const stored = seoPerms.find(
          (s: { key: string }) => s.key === `perm_${perm.key.replace(/\./g, '_')}`,
        );
        const allowedRoles = stored ? (stored.value.split(',').filter(Boolean) as UserRole[]) : [];

        // Fall back to default: content_manager gets seo.meta, seo.audit, seo.404_monitor, seo.schema
        // admin/super_admin get everything
        const defaults: UserRole[] = [];
        if (['seo.meta', 'seo.audit', 'seo.404_monitor', 'seo.schema'].includes(perm.key)) {
          defaults.push('content_manager');
        }
        defaults.push('admin', 'super_admin');
        const finalRoles = allowedRoles.length > 0 ? allowedRoles : defaults;

        state[perm.key] = {
          enabled: finalRoles.length > 0,
          allowedRoles: new Set(finalRoles),
        };
      }
      setPermissions(state);
    } catch {
      setError('Gagal memuat pengaturan permission');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const handleToggleRole = useCallback((permKey: string, role: UserRole) => {
    setPermissions((prev) => {
      const perm = prev[permKey];
      if (!perm) return prev;
      const next = new Set(perm.allowedRoles);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      return { ...prev, [permKey]: { ...perm, allowedRoles: next } };
    });
  }, []);

  const handleToggleAll = useCallback((permKey: string, checked: boolean) => {
    setPermissions((prev) => {
      const perm = prev[permKey];
      if (!perm) return prev;
      const next = new Set(checked ? (['admin', 'super_admin'] as UserRole[]) : []);
      return { ...prev, [permKey]: { ...perm, enabled: checked, allowedRoles: next } };
    });
  }, []);

  const handleSave = useCallback(async () => {
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const settings = Object.entries(permissions)
        .filter(([_, perm]) => perm.enabled && perm.allowedRoles.size > 0)
        .map(([permKey, perm]) => ({
          key: `perm_${permKey.replace(/\./g, '_')}`,
          value: Array.from(perm.allowedRoles).join(','),
          category: 'seo_permissions',
          description: SEO_PERMISSION_KEYS.find((p) => p.key === permKey)?.description ?? '',
        }));

      // Also save disabled permissions as empty
      for (const perm of SEO_PERMISSION_KEYS) {
        const state = permissions[perm.key];
        if (state && (!state.enabled || state.allowedRoles.size === 0)) {
          settings.push({
            key: `perm_${perm.key.replace(/\./g, '_')}`,
            value: '',
            category: 'seo_permissions',
            description: perm.description,
          });
        }
      }

      await api.patch('/api/v1/admin/settings', {
        body: { settings },
      });

      // Clear middleware cache by updating (PATCH triggers fresh load)
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan permission';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }, [api, permissions]);

  const staffRoleEntries = STAFF_ROLES.filter((r) => r !== 'admin' && r !== 'super_admin').map(
    (r) => ({ role: r, label: STAFF_ROLE_LABELS[r] ?? r }),
  );

  if (loading) {
    return (
      <Card padding="lg" data-testid="role-manager">
        <div className="space-y-4">
          <div className="h-5 w-48 animate-pulse rounded bg-neutral-200" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-neutral-100" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="space-y-5" data-testid="role-manager">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Role Manager SEO</h2>
        <p className="mt-1 text-body-sm text-text-secondary">
          Atur role staf mana yang memiliki akses ke setiap fitur SEO. Admin dan Super Admin
          otomatis memiliki akses ke semua fitur.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-50 px-4 py-3 text-body-sm text-danger-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success-50 px-4 py-3 text-body-sm text-success-700">
          Permission berhasil disimpan. Perubahan akan berlaku dalam 30 detik.
        </div>
      )}

      {/* Permission Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-body-sm" data-testid="permission-table">
          <thead>
            <tr className="border-b border-border-default text-left text-caption font-semibold uppercase tracking-wider text-text-muted">
              <th className="px-3 py-3">Fitur SEO</th>
              <th className="px-3 py-3 text-center">Aktif</th>
              {staffRoleEntries.map(({ role, label }) => (
                <th key={role} className="px-3 py-3 text-center">
                  {label}
                </th>
              ))}
              <th className="px-3 py-3 text-center">Admin</th>
              <th className="px-3 py-3 text-center">Super Admin</th>
            </tr>
          </thead>
          <tbody>
            {SEO_PERMISSION_KEYS.map((perm) => {
              const state = permissions[perm.key];
              if (!state) return null;

              return (
                <tr
                  key={perm.key}
                  data-testid={`perm-${perm.key.replace(/\./g, '-')}`}
                  className="border-b border-border-default last:border-0 hover:bg-neutral-50/50 transition-colors"
                >
                  <td className="px-3 py-3">
                    <div className="text-text-primary font-medium">{perm.label}</div>
                    <div className="text-body-xs text-text-muted">{perm.description}</div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <label className="inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={state.enabled}
                        onChange={(e) => handleToggleAll(perm.key, e.target.checked)}
                        className="h-4 w-4 rounded border-border-default text-primary-600 focus:ring-2 focus:ring-primary-500"
                      />
                    </label>
                  </td>
                  {staffRoleEntries.map(({ role }) => (
                    <td key={role} className="px-3 py-3 text-center">
                      <label className="inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={state.allowedRoles.has(role)}
                          onChange={() => handleToggleRole(perm.key, role)}
                          disabled={!state.enabled}
                          className="h-4 w-4 rounded border-border-default text-primary-600 focus:ring-2 focus:ring-primary-500 disabled:opacity-30"
                        />
                      </label>
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={state.allowedRoles.has('admin')}
                      disabled
                      className="h-4 w-4 rounded border-border-default text-primary-600 opacity-50"
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={state.allowedRoles.has('super_admin')}
                      disabled
                      className="h-4 w-4 rounded border-border-default text-primary-600 opacity-50"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {staffRoleEntries.map(({ role, label }) => (
          <span
            key={role}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-body-xs font-medium ${
              STAFF_ROLE_COLORS[role]
            }`}
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                role === 'content_manager'
                  ? 'bg-violet-500'
                  : role === 'dispatcher'
                    ? 'bg-amber-500'
                    : role === 'finance'
                      ? 'bg-emerald-500'
                      : 'bg-neutral-400'
              }`}
            />
            {label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-body-xs font-medium text-blue-700">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
          Admin
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-body-xs font-medium text-red-700">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          Super Admin
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border-default pt-4">
        <button
          data-testid="reset-permissions"
          onClick={loadPermissions}
          className="inline-flex h-9 items-center rounded-lg px-3 text-body-sm text-text-secondary hover:bg-neutral-100 transition-colors"
        >
          Reset form
        </button>
        <Button data-testid="save-permissions" onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan Permission'}
        </Button>
      </div>
    </Card>
  );
}
