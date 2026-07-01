import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Card, Button, Select } from '@specialist/ui';

export function PartnerAvailability() {
  const api = createBrowserClient();
  const [current, setCurrent] = useState('Available');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ availability: string }>('/api/v1/partners/me')
      .then((data) => setCurrent(data.availability ?? 'Available'))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch('/api/v1/partners/me/availability', { body: { availability: current } });
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-text-muted">Memuat...</div>;
  }

  return (
    <Card padding="lg" className="max-w-md space-y-4">
      <Select
        label="Status Ketersediaan"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        options={[
          { value: 'Available', label: 'Tersedia' },
          { value: 'Busy', label: 'Sibuk' },
          { value: 'Vacation', label: 'Cuti' },
          { value: 'Offline', label: 'Offline' },
        ]}
      />
      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </Card>
  );
}
