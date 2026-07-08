import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Card, Skeleton, Grid } from '@specialist/ui';

export function PartnerOverview() {
  const api = useMemo(() => createBrowserClient(), []);
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
        const [prof] = await Promise.all([
          api.get('/api/v1/partners/me'),
          api.get<unknown[]>('/api/v1/partners/me/jobs').catch(() => []),
        ]);
        setProfile(prof as typeof profile);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [api]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card padding="lg">
          <Skeleton variant="text" className="w-1/3" />
          <div className="mt-2">
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </Card>
        <Grid cols={4} gap={4}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="lg">
              <Skeleton variant="text" className="w-1/2" />
              <div className="mt-2">
                <Skeleton variant="heading" className="w-1/3 h-8" />
              </div>
            </Card>
          ))}
        </Grid>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card padding="lg">
        <p className="text-body text-text-secondary">Gagal memuat profil mitra.</p>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Rating',
      value: profile.ratingAverage ? `${Number(profile.ratingAverage).toFixed(1)} / 5.0` : '-',
    },
    { label: 'Pekerjaan Selesai', value: profile.completedJobs },
    {
      label: 'Status',
      value: profile.availability === 'Available' ? 'Tersedia' : profile.availability,
    },
    {
      label: 'Verifikasi',
      value:
        profile.verificationStatus === 'Approved' ? 'Terverifikasi' : profile.verificationStatus,
    },
  ];

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-h5 text-text-primary">Selamat datang, {profile.fullName}</h2>
        <p className="mt-1 text-body-sm text-text-secondary">Dashboard Mitra Spesialis</p>
      </Card>
      <Grid cols={4} gap={4}>
        {stats.map((s) => (
          <Card key={s.label} padding="lg" className="space-y-2">
            <p className="text-body-sm text-text-secondary">{s.label}</p>
            <p className="text-h3 font-bold text-text-primary">{s.value}</p>
          </Card>
        ))}
      </Grid>
    </div>
  );
}
