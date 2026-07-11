import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Card } from '@ahlipanggilan/ui';

interface DispatcherDashboard {
  partners?: { available: number };
  orders?: { active: number; waitingAssignment: number };
}

export function DispatcherOverview() {
  const api = useMemo(() => createBrowserClient(), []);
  const [stats, setStats] = useState<DispatcherDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<DispatcherDashboard>('/api/v1/admin/dashboard');
        setStats(data);
      } catch {
        setStats({});
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [api]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border-default bg-bg-surface p-6">
              <div
                className="animate-skeleton h-4 w-1/2 rounded-sm bg-neutral-200"
                aria-hidden="true"
              />
              <div
                className="mt-2 animate-skeleton h-8 w-1/3 rounded-sm bg-neutral-200"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Sedang Berjalan</p>
          <p className="mt-1 text-h3 font-bold text-primary">{stats?.orders?.active ?? 0}</p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Menunggu Assignment</p>
          <p className="mt-1 text-h3 font-bold text-accent">
            {stats?.orders?.waitingAssignment ?? 0}
          </p>
        </Card>
        <Card padding="lg">
          <p className="text-body-sm text-text-secondary">Partner Tersedia</p>
          <p className="mt-1 text-h3 font-bold text-success">{stats?.partners?.available ?? 0}</p>
        </Card>
      </div>

      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
          Aksi Cepat
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/dashboard/admin/bookings"
            className="rounded-lg bg-primary-500 px-4 py-2 text-body-sm font-semibold text-white shadow-xs transition-all duration-150 ease-out hover:bg-primary-600 hover:shadow-sm"
          >
            Kelola Booking
          </a>
          <a
            href="/dashboard/admin/partners"
            className="rounded-lg border border-border-default bg-bg-surface px-4 py-2 text-body-sm font-medium text-text-primary shadow-xs transition-all duration-150 ease-out hover:bg-neutral-100 hover:shadow-sm"
          >
            Cari Partner
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-border-default bg-bg-surface p-6">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
          Informasi
        </h3>
        <div className="mt-3 space-y-2 text-sm text-text-muted">
          <p>
            Sebagai <strong>Dispatcher</strong>, tugas Anda adalah:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Memantau booking yang menunggu assignment</li>
            <li>Menugaskan partner yang tersedia ke booking</li>
            <li>Memantau pekerjaan yang sedang berjalan</li>
            <li>Menangani penolakan assignment dari partner</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
