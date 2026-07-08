import { useState, useEffect } from 'react';
import { createBrowserClient } from '@specialist/shared';

interface FaqItem {
  q: string;
  a: string;
}

const FALLBACK_FAQS: FaqItem[] = [
  {
    q: 'Apa itu Spesialis?',
    a: 'Spesialis adalah platform layanan jasa profesional on-demand yang menghubungkan Anda dengan teknisi dan profesional terpercaya untuk kebutuhan rumah, kantor, dan bisnis.',
  },
  {
    q: 'Bagaimana cara memesan layanan?',
    a: 'Pilih layanan yang Anda butuhkan, isi form booking dengan detail alamat dan jadwal, lalu admin kami akan mengonfirmasi dan menugaskan mitra teknisi.',
  },
  {
    q: 'Apakah saya perlu membuat akun untuk booking?',
    a: 'Tidak. Anda dapat melakukan booking tanpa membuat akun sebagai guest. Namun, dengan membuat akun Anda bisa melacak riwayat order, menyimpan alamat, dan mendapatkan kemudahan lainnya.',
  },
  {
    q: 'Bagaimana cara menentukan harga final?',
    a: 'Harga awal adalah estimasi berdasarkan base price. Harga final akan ditentukan setelah admin melakukan komunikasi melalui WhatsApp untuk menyesuaikan kondisi lapangan, lokasi, dan kebutuhan spesifik.',
  },
  {
    q: 'Bagaimana cara pembayaran?',
    a: 'Pembayaran dilakukan secara manual setelah pekerjaan selesai. Metode pembayaran yang tersedia: Transfer Bank, Tunai, QRIS, dan E-Wallet.',
  },
  {
    q: 'Apa jaminan jika pekerjaan tidak sesuai?',
    a: 'Setiap layanan dilengkapi garansi. Jika ada ketidaksesuaian, Anda dapat mengajukan komplain melalui dashboard dan tim kami akan segera menindaklanjuti.',
  },
  {
    q: 'Bagaimana cara menjadi mitra teknisi?',
    a: 'Daftar melalui halaman Daftar Mitra, lengkapi data diri dan dokumen yang diperlukan. Setelah diverifikasi oleh admin, Anda dapat mulai menerima pekerjaan.',
  },
  {
    q: 'Apakah Spesialis melayani area Jabodetabek saja?',
    a: 'Saat ini kami fokus melayani area Jabodetabek dan Bandung. Ke depannya kami akan memperluas jangkauan ke kota-kota lain di Indonesia.',
  },
];

interface CmsFaqItem {
  question: string;
  answer: string;
}

export function FaqList() {
  const [faqs, setFaqs] = useState<FaqItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const api = createBrowserClient();

    api
      .get<CmsFaqItem[]>('/api/v1/cms/faq')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data.map((item) => ({ q: item.question, a: item.answer })));
        } else {
          setFaqs(FALLBACK_FAQS);
        }
        setLoading(false);
      })
      .catch(() => {
        setFaqs(FALLBACK_FAQS);
        setLoading(false);
      });
  }, []);

  // ─── Loading skeleton ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="mt-8 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-lg border border-border bg-surface p-4">
            <div className="h-5 w-3/4 rounded bg-border" />
            <div className="mt-3 h-4 w-full rounded bg-border" />
            <div className="mt-2 h-4 w-5/6 rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  // ─── FAQ accordion ─────────────────────────────────────────────

  return (
    <div className="mt-8 space-y-4 motion-safe:animate-fade-in">
      {faqs?.map((faq, i) => (
        <details
          key={i}
          className="group rounded-lg border border-border bg-surface transition-shadow hover:shadow-sm"
        >
          <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-text">
            {faq.q}
            <span className="text-text-muted transition-transform group-open:rotate-180">
              &darr;
            </span>
          </summary>
          <div className="border-t border-border px-4 py-3 text-sm text-text-muted">{faq.a}</div>
        </details>
      ))}
    </div>
  );
}
