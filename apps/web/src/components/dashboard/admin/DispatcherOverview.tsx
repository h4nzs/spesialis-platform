import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Card } from '@specialist/ui';

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
    return <div className="text-sm text-text-muted py-8 text-center">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card padding="lg">
          <p className="text-sm text-text-muted">Sedang Berjalan</p>
          <p className="mt-1 text-3xl font-bold text-primary">{stats?.orders?.active ?? 0}</p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-text-muted">Menunggu Assignment</p>
          <p className="mt-1 text-3xl font-bold text-accent">
            {stats?.orders?.waitingAssignment ?? 0}
          </p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-text-muted">Partner Tersedia</p>
          <p className="mt-1 text-3xl font-bold text-success">{stats?.partners?.available ?? 0}</p>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
          Aksi Cepat
        </h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/dashboard/admin/bookings"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Kelola Booking
          </a>
          <a
            href="/dashboard/admin/partners"
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface"
          >
            Cari Partner
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">Informasi</h3>
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
