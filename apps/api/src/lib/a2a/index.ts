import {
  AgentCard,
  generateAgentCardSignature,
  type AgentCardSignatureGenerator,
} from '@a2a-js/sdk';
import {
  DefaultPushNotificationSender,
  DefaultRequestHandler,
  type AgentExecutor,
  type PushNotificationStore,
  type TaskStore,
} from '@a2a-js/sdk/server';
import { PostgresTaskStore } from './a2a-task-store.ts';
import { PostgresPushNotificationStore } from './a2a-push-store.ts';
import { PlatformAgentExecutor } from './a2a-executor.ts';

const SITE = 'https://ahlipanggilan.id';
const KID = 'b6opvVeOQR4GHtJIMv19TnAR097PQc5fR-pX7yk7yPk';

/**
 * JWS signing for the Agent Card served over the wire (GetAgentCard and
 * REST card endpoint). Uses the same Ed25519 key as HTTP Message
 * Signatures so the authority is verifiable from both channels.
 * Returns null when BOT_SIGNING_PRIVATE_KEY is absent (unsigned card).
 */
export function buildAgentCardSignatureGenerator(): AgentCardSignatureGenerator | null {
  const raw = process.env.BOT_SIGNING_PRIVATE_KEY;
  if (!raw) return null;
  try {
    const jwk = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as {
      x?: string;
      d?: string;
    };
    if (!jwk.x || !jwk.d) return null;
    return generateAgentCardSignature(
      {
        kty: 'OKP',
        crv: 'Ed25519',
        x: jwk.x,
        d: jwk.d,
      },
      { alg: 'EdDSA', kid: KID, typ: 'JOSE' },
    );
  } catch (err) {
    console.error('[a2a] agent card signing disabled:', err);
    return null;
  }
}

/** Full v1.0 AgentCard — the same manifest is served by the web app. */
export function buildAgentCard(): AgentCard {
  return AgentCard.fromJSON({
    name: 'Ahli Panggilan Booking Agent',
    description:
      'Agent layanan jasa profesional on-demand di Indonesia. Membantu menemukan teknisi ahli (AC, plumbing, listrik, cleaning, dan lainnya), memesan layanan, melacak status pesanan, dan melihat katalog layanan.',
    version: '1.0.0',
    provider: { organization: 'Ahli Panggilan', url: SITE },
    documentationUrl: `${SITE}/auth.md`,
    supportedInterfaces: [
      { url: `${SITE}/a2a`, protocolBinding: 'JSONRPC', protocolVersion: '1.0' },
      { url: `${SITE}/a2a/rest`, protocolBinding: 'HTTP+JSON', protocolVersion: '1.0' },
    ],
    capabilities: { streaming: true, pushNotifications: true, extendedAgentCard: false },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/plain'],
    securitySchemes: {
      bearerAuth: {
        httpAuthSecurityScheme: {
          scheme: 'Bearer',
          bearerFormat: 'JWT',
          description: 'JWT dari akun Ahli Panggilan (login aplikasi).',
        },
      },
    },
    securityRequirements: [
      {
        schemes: {
          bearerAuth: { list: [] },
        },
      },
    ],
    skills: [
      {
        id: 'service-catalog',
        name: 'Katalog Layanan',
        description:
          'Menelusuri dan mencari daftar layanan jasa profesional yang tersedia, termasuk kategori, harga estimasi, dan deskripsi layanan.',
        tags: ['services', 'catalog', 'search'],
        examples: ['Apa saja layanan yang tersedia?', 'Berapa estimasi harga jasa AC service?'],
        inputModes: ['text/plain'],
        outputModes: ['text/plain'],
      },
      {
        id: 'booking',
        name: 'Pemesanan Layanan',
        description:
          'Membuat pemesanan jasa profesional: memilih layanan, menjadwalkan waktu kunjungan, menentukan alamat, dan mengirim permintaan booking. Memerlukan autentikasi (Bearer JWT).',
        tags: ['booking', 'order', 'schedule'],
        examples: ['Saya mau pesan jasa sedot WC untuk besok pagi.'],
        inputModes: ['text/plain'],
        outputModes: ['text/plain'],
        securityRequirements: [
          {
            schemes: {
              bearerAuth: { list: [] },
            },
          },
        ],
      },
      {
        id: 'tracking',
        name: 'Pelacakan Pesanan',
        description:
          'Melacak status pemesanan secara real-time menggunakan nomor booking, termasuk status partner ditugaskan, teknisi berangkat, dan penyelesaian layanan.',
        tags: ['tracking', 'status', 'booking'],
        examples: ['Di mana status pesanan saya?'],
        inputModes: ['text/plain'],
        outputModes: ['text/plain'],
      },
      {
        id: 'partner-verification',
        name: 'Verifikasi Partner',
        description:
          'Menyediakan informasi tentang proses verifikasi mitra teknisi, kriteria kelulusan, dan status aplikasi partner.',
        tags: ['partner', 'verification', 'become-partner'],
        examples: ['Bagaimana cara menjadi partner teknisi?'],
        inputModes: ['text/plain'],
        outputModes: ['text/plain'],
      },
      {
        id: 'corporate-services',
        name: 'Layanan Korporasi',
        description:
          'Menangani kebutuhan layanan jasa untuk perusahaan: kontrak maintenance, penagihan terpusat, dan akun korporat.',
        tags: ['corporate', 'b2b', 'contract'],
        examples: ['Perusahaan kami butuh kontrak maintenance rutin.'],
        inputModes: ['text/plain'],
        outputModes: ['text/plain'],
      },
    ],
  } as never) as unknown as AgentCard;
}

export interface A2AComponents {
  handler: DefaultRequestHandler;
  agentCard: AgentCard;
}

/** Singleton assembly of the full A2A server pipeline. */
export function createA2A(): A2AComponents {
  const agentCard = buildAgentCard();
  const taskStore: TaskStore = new PostgresTaskStore();
  const pushStore: PushNotificationStore = new PostgresPushNotificationStore();
  const pushSender = new DefaultPushNotificationSender(pushStore);
  const agentExecutor: AgentExecutor = new PlatformAgentExecutor();
  const signer = buildAgentCardSignatureGenerator();
  const handler = new DefaultRequestHandler(
    agentCard,
    taskStore,
    agentExecutor,
    undefined,
    pushStore,
    pushSender,
    undefined,
    signer ?? undefined,
  );
  return { handler, agentCard };
}
