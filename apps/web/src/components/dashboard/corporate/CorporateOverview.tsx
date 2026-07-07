import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Card } from '@specialist/ui';

interface CompanyProfile {
  id: string;
  companyName: string;
  status: string;
  employeeCount: number | null;
}

export function CorporateOverview() {
  const api = useMemo(() => createBrowserClient(), []);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [activeOrders, setActiveOrders] = useState(0);
  const [branchCount, setBranchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const profileData = (await api.get('/api/v1/companies/me')) as CompanyProfile | null;
      if (!profileData) return;
      setProfile(profileData);

      const [ordersData, branchesData] = await Promise.all([
        api.get('/api/v1/bookings').catch(() => []),
        api.get(`/api/v1/companies/${profileData.id}/branches`).catch(() => []),
      ]);

      if (Array.isArray(ordersData)) {
        setActiveOrders(
          ordersData.filter(
            (o: Record<string, unknown>) =>
              !['Paid', 'Closed', 'Cancelled'].includes(o.status as string),
          ).length,
        );
      }
      if (Array.isArray(branchesData)) setBranchCount(branchesData.length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-lg font-semibold text-text">{profile?.companyName ?? 'Perusahaan'}</h2>
        <p className="mt-1 text-sm text-text-muted">Status: {profile?.status ?? '-'}</p>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="lg">
          <p className="text-sm text-text-muted">Karyawan</p>
          <p className="mt-1 text-2xl font-bold text-text">{profile?.employeeCount ?? '-'}</p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-text-muted">Pesanan Aktif</p>
          <p className="mt-1 text-2xl font-bold text-text">{activeOrders}</p>
        </Card>
        <Card padding="lg">
          <p className="text-sm text-text-muted">Cabang</p>
          <p className="mt-1 text-2xl font-bold text-text">{branchCount}</p>
        </Card>
      </div>
    </div>
  );
}
