import type { APIRoute } from 'astro';
import { AgentCard, generateAgentCardSignature } from '@a2a-js/sdk';

const SITE = 'https://ahlipanggilan.id';
const KID = 'b6opvVeOQR4GHtJIMv19TnAR097PQc5fR-pX7yk7yPk';

/**
 * A2A Agent Card — A2A Protocol v1.0, JWS-signed.
 *
 * Schema: https://a2a-protocol.org/v1.0.0/specification (section 4.4)
 * Discovery via DNS-AID (`_a2a._agents.ahlipanggilan.id`) and
 * /.well-known/agent-card.json.
 *
 * The card is signed with the same Ed25519 key used for HTTP Message
 * Signatures (BOT_SIGNING_PRIVATE_KEY) so verifiers can authenticate the
 * authority. When the key is absent the card is served unsigned.
 */
const CARD = {
  name: 'Ahli Panggilan Booking Agent',
  description:
    'Agent layanan jasa profesional on-demand di Indonesia. Membantu menemukan teknisi ahli (AC, plumbing, listrik, cleaning, dan lainnya), memesan layanan, melacak status pesanan, dan melihat katalog layanan. Platform: ahlipanggilan.id.',
  provider: {
    organization: 'Ahli Panggilan',
    url: SITE,
  },
  version: '1.0.0',
  documentationUrl: `${SITE}/auth.md`,
  supportedInterfaces: [
    {
      url: `${SITE}/api/v1/a2a`,
      protocolBinding: 'JSONRPC',
      protocolVersion: '1.0',
    },
    {
      url: `${SITE}/api/v1/a2a/rest`,
      protocolBinding: 'HTTP+JSON',
      protocolVersion: '1.0',
    },
  ],
  capabilities: {
    streaming: true,
    pushNotifications: true,
    extendedAgentCard: true,
  },
  securitySchemes: {
    bearerAuth: {
      httpAuthSecurityScheme: {
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        description: 'JWT dari akun ahlipanggilan.id — wajib untuk pemesanan.',
      },
    },
  },
  securityRequirements: [{ schemes: { bearerAuth: { list: [] } } }],
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
      securityRequirements: [{ schemes: { bearerAuth: { list: [] } } }],
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

function loadSigningKey(): { x: string; d: string } | null {
  const raw = process.env.BOT_SIGNING_PRIVATE_KEY;
  if (!raw) return null;
  try {
    const jwk = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as {
      x?: string;
      d?: string;
    };
    if (!jwk.x || !jwk.d) return null;
    return { x: jwk.x, d: jwk.d };
  } catch {
    return null;
  }
}

export const GET: APIRoute = async () => {
  const key = loadSigningKey();
  let body = JSON.stringify(CARD, null, 2);

  if (key) {
    try {
      const sign = generateAgentCardSignature(
        { kty: 'OKP', crv: 'Ed25519', x: key.x, d: key.d },
        { alg: 'EdDSA', kid: KID, typ: 'JOSE' },
      );
      const signed = AgentCard.fromJSON(JSON.parse(JSON.stringify(CARD)));
      const card = await sign(signed);
      body = JSON.stringify(AgentCard.toJSON(card), null, 2);
    } catch (err) {
      console.error('[agent-card] signing failed, serving unsigned:', err);
    }
  }

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      ETag: `"${CARD.version}"`,
      'Access-Control-Allow-Origin': '*',
    },
  });
};
