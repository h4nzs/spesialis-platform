import type { APIRoute } from 'astro';

const SITE = 'https://ahlipanggilan.id';

/**
 * A2A Agent Card — A2A Protocol v1.0
 *
 * Agent-to-agent discovery metadata. Schema:
 * https://a2a-protocol.org/latest/specification/ (section 4.4.1)
 */
export const GET: APIRoute = async () => {
  const card = {
    name: 'Ahli Panggilan Booking Agent',
    description:
      'Agent layanan jasa profesional on-demand di Indonesia. Membantu menemukan teknisi ahli (AC, plumbing, listrik, cleaning, dan lainnya), memesan layanan, melacak status pesanan, dan melihat katalog layanan. Platform: ahlipanggilan.id.',
    url: SITE,
    provider: {
      organization: 'Ahli Panggilan',
      url: SITE,
    },
    version: '1.0.0',
    documentationUrl: `${SITE}/auth.md`,
    supportedInterfaces: [
      {
        url: `${SITE}/api/v1`,
        protocolBinding: 'HTTP+JSON',
        protocolVersion: '1.0',
      },
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
      extendedAgentCard: false,
    },
    skills: [
      {
        id: 'service-catalog',
        name: 'Katalog Layanan',
        description:
          'Menelusuri dan mencari daftar layanan jasa profesional yang tersedia, termasuk kategori, harga estimasi, dan deskripsi layanan.',
        tags: ['services', 'catalog', 'search'],
        examples: ['Apa saja layanan yang tersedia?', 'Berapa estimasi harga jasa AC service?'],
      },
      {
        id: 'booking',
        name: 'Pemesanan Layanan',
        description:
          'Membuat pemesanan jasa profesional: memilih layanan, menjadwalkan waktu kunjungan, menentukan alamat, dan mengirim permintaan booking.',
        tags: ['booking', 'order', 'schedule'],
        examples: ['Saya mau pesan jasa sedot WC untuk besok pagi.'],
      },
      {
        id: 'tracking',
        name: 'Pelacakan Pesanan',
        description:
          'Melacak status pemesanan secara real-time menggunakan nomor booking, termasuk status partner ditugaskan, teknisi berangkat, dan penyelesaian layanan.',
        tags: ['tracking', 'status', 'booking'],
        examples: ['Di mana status pesanan saya?'],
      },
      {
        id: 'partner-verification',
        name: 'Verifikasi Partner',
        description:
          'Menyediakan informasi tentang proses verifikasi mitra teknisi, kriteria kelulusan, dan status aplikasi partner.',
        tags: ['partner', 'verification', 'become-partner'],
        examples: ['Bagaimana cara menjadi partner teknisi?'],
      },
      {
        id: 'corporate-services',
        name: 'Layanan Korporasi',
        description:
          'Menangani kebutuhan layanan jasa untuk perusahaan: kontrak maintenance, penagihan terpusat, dan akun korporat.',
        tags: ['corporate', 'b2b', 'contract'],
        examples: ['Perusahaan kami butuh kontrak maintenance rutin.'],
      },
    ],
  };

  return new Response(JSON.stringify(card, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      ETag: `"${card.version}"`,
      'Access-Control-Allow-Origin': '*',
    },
  });
};
