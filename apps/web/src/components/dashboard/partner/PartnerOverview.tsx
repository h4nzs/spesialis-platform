import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Card } from '@specialist/ui';

export function PartnerOverview() {
  const api = createBrowserClient();
  const [profile, setProfile] = useState<{
    fullName: string;
    ratingAverage: string | null;
    completedJobs: number;
    availability: string;
    verificationStatus: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prof, _jobs] = await Promise.all([
          api.get('/api/v1/partners/me'),
          api.get<unknown[]>('/api/v1/partners/me/jobs'),
        ]);
        setProfile(prof as typeof profile);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  if (!profile) {
    return <p className="text-sm text-text-muted">Gagal memuat profil</p>;
  }

  const stats = [
    {
      label: 'Rating',
      value: profile.ratingAverage ? `${Number(profile.ratingAverage).toFixed(1)} / 5.0` : '-',
    },
    { label: 'Pekerjaan Selesai', value: profile.completedJobs },
    { label: 'Status', value: profile.availability },
    { label: 'Verifikasi', value: profile.verificationStatus },
  ];

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-text">Selamat datang, {profile.fullName}</h2>
        <p className="mt-1 text-sm text-text-muted">Dashboard Mitra Spesialis</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} padding="lg">
            <p className="text-sm text-text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-text">{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
