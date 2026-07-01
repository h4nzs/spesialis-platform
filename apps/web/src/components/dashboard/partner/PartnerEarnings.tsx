import { useState, useEffect } from 'react';
import { createBrowserClient, formatCurrency } from '@specialist/shared';
import { Card } from '@specialist/ui';

export function PartnerEarnings() {
  const api = createBrowserClient();
  const [profile, setProfile] = useState<{
    completedJobs: number;
    ratingAverage: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/partners/me')
      .then((data) => setProfile(data as typeof profile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card padding="lg">
        <p className="text-sm text-text-muted">Pekerjaan Selesai</p>
        <p className="mt-1 text-3xl font-bold text-text">{profile?.completedJobs ?? 0}</p>
      </Card>
      <Card padding="lg">
        <p className="text-sm text-text-muted">Rating</p>
        <p className="mt-1 text-3xl font-bold text-text">
          {profile?.ratingAverage ? Number(profile.ratingAverage).toFixed(1) : '-'}
        </p>
      </Card>
      <Card padding="lg">
        <p className="text-sm text-text-muted">Riwayat Pendapatan</p>
        <p className="mt-1 text-sm text-text-muted">Fitur akan segera tersedia</p>
      </Card>
    </div>
  );
}
