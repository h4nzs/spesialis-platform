import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Card } from '@specialist/ui';

interface CompanyProfile {
  companyName: string;
  status: string;
  employeeCount: number | null;
}

export function CorporateOverview() {
  const api = createBrowserClient();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/companies/me')
      .then((data) => setProfile(data as CompanyProfile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-text">
          {profile?.companyName ?? 'Perusahaan'}
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Status: {profile?.status ?? '-'}
        </p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="lg">
          <p className="text-sm text-text-muted">Karyawan</p>
          <p className="mt-1 text-2xl font-bold text-text">{profile?.employeeCount ?? '-'}</p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-text-muted">Pesanan Aktif</p>
          <p className="mt-1 text-2xl font-bold text-text">0</p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-text-muted">Cabang</p>
          <p className="mt-1 text-2xl font-bold text-text">0</p>
        </Card>
      </div>
      <p className="text-sm text-text-muted">
        Dashboard Corporate sedang dalam pengembangan. Fitur lengkap akan segera tersedia.
      </p>
    </div>
  );
}
