import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { updateProfileSchema, changePasswordSchema } from '@specialist/validation';
import { Input, Button } from '@specialist/ui';

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  fullName?: string;
  role: string;
}

export function ProfileSettings() {
  const api = useMemo(() => createBrowserClient(), []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileErrors, setProfileErrors] = useState<string[]>([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwErrors, setPwErrors] = useState<string[]>([]);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    api
      .get<{ id: string; email: string; phone: string; role: string }>('/api/v1/auth/me')
      .then((data) => {
        setProfile(data);
        setEmail(data.email);
        setPhone(data.phone);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api]);

  async function handleProfileUpdate(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileErrors([]);

    const parsed = updateProfileSchema.safeParse({ email, phone });
    if (!parsed.success) {
      setProfileErrors(parsed.error.issues.map((i) => i.message));
      return;
    }

    setProfileSaving(true);
    try {
      await api.patch('/api/v1/auth/profile', { body: parsed.data });
      setProfileSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui profil';
      setProfileErrors([msg]);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordChange(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwSuccess(false);
    setPwErrors([]);

    const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword });
    if (!parsed.success) {
      setPwErrors(parsed.error.issues.map((i) => i.message));
      return;
    }

    setPwSaving(true);
    try {
      await api.patch('/api/v1/auth/change-password', { body: parsed.data });
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah password';
      setPwErrors([msg]);
    } finally {
      setPwSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-text-secondary">Memuat profil...</p>;
  }

  if (!profile) {
    return <p className="text-sm text-danger-500">Gagal memuat profil</p>;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Profil</h2>
        <form onSubmit={handleProfileUpdate} className="max-w-md space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Nomor HP"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {profileErrors.length > 0 && (
            <div className="rounded-md bg-danger-500/10 p-3 text-sm text-danger-500">
              {profileErrors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}
          {profileSuccess && <p className="text-sm text-success-500">Profil berhasil diperbarui</p>}
          <Button type="submit" disabled={profileSaving}>
            {profileSaving ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </form>
      </section>

      <hr className="border-border-default" />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">Ubah Password</h2>
        <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
          <Input
            label="Password Saat Ini"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {pwErrors.length > 0 && (
            <div className="rounded-md bg-danger-500/10 p-3 text-sm text-danger-500">
              {pwErrors.map((err, i) => (
                <p key={i}>{err}</p>
              ))}
            </div>
          )}
          {pwSuccess && <p className="text-sm text-success-500">Password berhasil diubah</p>}
          <Button type="submit" disabled={pwSaving}>
            {pwSaving ? 'Menyimpan...' : 'Ubah Password'}
          </Button>
        </form>
      </section>
    </div>
  );
}
