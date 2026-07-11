import { useState } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { createComplaintSchema } from '@ahlipanggilan/validation';
import { Button, Input, Textarea, Card } from '@ahlipanggilan/ui';

export function ComplaintForm() {
  const api = createBrowserClient();
  const [orderId, setOrderId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);

    const parsed = createComplaintSchema.safeParse({ orderId, title, description });
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => i.message));
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/v1/complaints', { body: parsed.data });
      setSuccess(true);
    } catch {
      setErrors(['Gagal mengirim komplain. Silakan coba lagi.']);
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
      {errors.length > 0 && (
        <div className="rounded-md bg-danger/10 p-3">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-danger">
              {err}
            </p>
          ))}
        </div>
      )}

      <Input
        label="ID Pesanan"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        placeholder="Masukkan ID order"
        required
      />
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
        placeholder="Jelaskan masalah Anda (minimal 10 karakter)"
        required
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Mengirim...' : 'Kirim Komplain'}
      </Button>
    </form>
  );
}
