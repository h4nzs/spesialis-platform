import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Card, Skeleton, Grid } from '@specialist/ui';

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
    return (
      <div className="space-y-6">
        <Card padding="lg">
          <Skeleton variant="text" className="w-1/3" />
          <div className="mt-2">
            <Skeleton variant="text" className="w-1/4" />
          </div>
        </Card>
        <Grid cols={3} gap={4}>
          {[1, 2, 3].map((i) => (
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

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-h5 text-text-primary">{profile?.companyName ?? 'Perusahaan'}</h2>
        <p className="mt-1 text-body-sm text-text-secondary">Status: {profile?.status ?? '-'}</p>
      </Card>
      <Grid cols={3} gap={4}>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Karyawan</p>
          <p className="text-h3 font-bold text-text-primary">{profile?.employeeCount ?? '-'}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Pesanan Aktif</p>
          <p className="text-h3 font-bold text-text-primary">{activeOrders}</p>
        </Card>
        <Card padding="lg" className="space-y-2">
          <p className="text-body-sm text-text-secondary">Cabang</p>
          <p className="text-h3 font-bold text-text-primary">{branchCount}</p>
        </Card>
      </Grid>
    </div>
  );
}
