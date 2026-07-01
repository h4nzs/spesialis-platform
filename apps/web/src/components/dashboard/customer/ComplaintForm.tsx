import { useState } from 'react';
import { createBrowserClient } from '@specialist/shared';
import { Button, Input, Textarea, Card } from '@specialist/ui';

export function ComplaintForm() {
  const api = createBrowserClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      await api.post('/api/v1/complaints', { body: { title, description } });
      setSuccess(true);
    } catch {
      setError('Gagal mengirim komplain. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Card padding="lg">
        <p className="text-success font-medium">Komplain berhasil dikirim</p>
        <a
          href="/dashboard/customer/complaints"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          Kembali ke daftar komplain
        </a>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Input
        label="Judul"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ringkasan komplain"
        required
      />
      <Textarea
        label="Deskripsi"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Jelaskan masalah Anda"
        required
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Mengirim...' : 'Kirim Komplain'}
      </Button>
    </form>
  );
}
