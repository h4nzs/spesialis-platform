import { useState } from 'react';
import { track } from '@spesialis/analytics';
import { createBrowserClient, parseApiError } from '@ahlipanggilan/shared';
import { createComplaintSchema } from '@ahlipanggilan/validation';
import { Button, Input, Textarea, Card } from '@ahlipanggilan/ui';

export function ComplaintForm() {
  const api = createBrowserClient();
  const [orderId, setOrderId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  function setField(field: string, value: string) {
    if (field === 'orderId') setOrderId(value);
    else if (field === 'title') setTitle(value);
    else if (field === 'description') setDescription(value);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    const parsed = createComplaintSchema.safeParse({ orderId, title, description });
    if (!parsed.success) {
      const fieldErrorMap: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        fieldErrorMap[field] = issue.message;
      }
      setFieldErrors(fieldErrorMap);
      setGeneralError('Lengkapi data komplain dengan benar');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.post<{ id: string; order_id: string; category: string }>(
        '/api/v1/complaints',
        { body: parsed.data },
      );
      setSuccess(true);
      track('complaint_submit', {
        complaint_id: result.id,
        booking_id: result.order_id,
        category: result.category,
      });
    } catch (err: unknown) {
      const result = parseApiError(err, 'Gagal mengirim komplain. Silakan coba lagi.');
      setFieldErrors(result.fieldErrors);
      setGeneralError(result.generalError);
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
      {generalError && (
        <div className="rounded-md bg-danger/10 p-3">
          <p className="text-sm text-danger">{generalError}</p>
        </div>
      )}

      <Input
        label="ID Pesanan"
        value={orderId}
        onChange={(e) => setField('orderId', e.target.value)}
        error={fieldErrors['orderId']}
        placeholder="Masukkan ID order"
        required
      />
      <Input
        label="Judul"
        value={title}
        onChange={(e) => setField('title', e.target.value)}
        error={fieldErrors['title']}
        placeholder="Ringkasan komplain"
        required
      />
      <Textarea
        label="Deskripsi"
        value={description}
        onChange={(e) => setField('description', e.target.value)}
        error={fieldErrors['description']}
        placeholder="Jelaskan masalah Anda (minimal 10 karakter)"
        required
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Mengirim...' : 'Kirim Komplain'}
      </Button>
    </form>
  );
}
