import { useState, useEffect, useMemo } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { updateProfileSchema, changePasswordSchema } from '@ahlipanggilan/validation';
import { Input, Button } from '@ahlipanggilan/ui';

interface UserProfile {
  id: string;
  email: string;
  phone: string;
  fullName?: string;
  role: string;
}

interface MeResponse {
  user: UserProfile & { emailVerifiedAt: string | null };
}

export function ProfileSettings() {
  const api = useMemo(() => createBrowserClient(), []);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifSending, setVerifSending] = useState(false);
  const [verifSent, setVerifSent] = useState(false);
  const [verifError, setVerifError] = useState('');
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
      .get<MeResponse>('/api/v1/auth/me')
      .then((data) => {
        const u = data.user;
        setProfile(u);
        setEmail(u.email);
        setPhone(u.phone);
        setEmailVerified(!!u.emailVerifiedAt);
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

  async function handleSendVerification() {
    setVerifSending(true);
    setVerifSent(false);
    setVerifError('');
    try {
      await api.post('/api/v1/auth/resend-verification');
      setVerifSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim email verifikasi';
      setVerifError(msg);
    } finally {
      setVerifSending(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Email Verification Banner */}
      {!emailVerified && (
        <section className="rounded-xl border border-warning-500/30 bg-warning-100/50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-text-primary">Verifikasi Email</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Email <strong>{profile?.email}</strong> belum diverifikasi. Kirim email verifikasi
                untuk mengaktifkan notifikasi dan fitur lainnya.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSendVerification}
              disabled={verifSending}
              className="shrink-0"
            >
              {verifSending ? 'Mengirim...' : 'Kirim Email Verifikasi'}
            </Button>
          </div>
          {verifSent && (
            <p className="mt-3 text-sm text-success-600">
              ✅ Email verifikasi telah dikirim ke <strong>{profile?.email}</strong>. Cek inbox
              (atau folder spam) Anda.
            </p>
          )}
          {verifError && <p className="mt-3 text-sm text-danger-500">❌ {verifError}</p>}
        </section>
      )}

      {/* Verified badge */}
      {emailVerified && (
        <section className="rounded-xl border border-success-500/30 bg-success-100/50 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-500 text-sm text-white">
              ✓
            </span>
            <div>
              <h3 className="font-semibold text-text-primary">Email Terverifikasi</h3>
              <p className="text-sm text-text-secondary">
                <strong>{profile?.email}</strong> — semua notifikasi akan dikirim ke email ini.
              </p>
            </div>
          </div>
        </section>
      )}

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
