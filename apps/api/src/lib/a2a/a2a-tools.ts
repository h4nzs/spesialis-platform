import { toolDefinitions } from '@ahlipanggilan/mcp-tools';
import { createGuestBooking } from '../booking-service.ts';

const API_INTERNAL_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

export const PLATFORM_INFO: Record<string, string> = {
  about:
    'Ahli Panggilan adalah platform layanan jasa profesional on-demand di Indonesia. ' +
    'Menghubungkan pelanggan dengan teknisi terverifikasi untuk AC, listrik, plumbing, cleaning, ' +
    'perbaikan bangunan, CCTV, dan tukang kunci. Website: https://ahlipanggilan.id\n' +
    'Dokumentasi AI: https://ahlipanggilan.id/llms.txt',
  corporate:
    'Ahli Panggilan melayani kebutuhan korporasi: perawatan gedung rutin, SLA terjadwal, ' +
    'penagihan terpusat, dan manajemen aset. Kunjungi https://ahlipanggilan.id/corporate.',
  partner_program:
    'Kemitraan teknisi profesional (AC, listrik, plumbing, cleaning, bangunan, CCTV, kunci). ' +
    'Verifikasi dokumen 1x24 jam. Daftar di https://ahlipanggilan.id/partner.',
  contact:
    'Email hello@ahlipanggilan.id, halaman kontak https://ahlipanggilan.id/kontak, ' +
    'booking di https://ahlipanggilan.id/book.',
};

const PAGE_MAP: Record<string, string> = {
  home: '/',
  book: '/book',
  services: '/services',
  tracking: '/tracking',
  faq: '/faq',
  blog: '/blog',
  partner: '/partner',
  corporate: '/corporate',
  about: '/tentang-kami',
  contact: '/kontak',
};

async function internalGet(path: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(`${API_INTERNAL_BASE}/api/v1${path}`, {
    headers: { Accept: 'application/json', ...headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  const body = (await res.json()) as { data?: unknown };
  return body.data ?? body;
}

export type A2AToolResult = { text: string; markdown?: boolean };

function formatPrice(value: unknown): string {
  const str = String(value ?? '');
  if (/^\d+(\.\d+)?$/.test(str)) return `Rp${Number(str).toLocaleString('id-ID')}`;
  if (str === 'call' || str === '' || str === '-') return 'Harga dapat dihubungi';
  return str;
}

/**
 * Executes an A2A skill action. `authToken` is the caller's platform JWT —
 * forwarded only for state-changing skills (create_booking) so bookings are
 * always attributed to the authenticated user.
 */
export async function executeA2ATool(
  name: string,
  rawArgs: Record<string, unknown>,
  authToken?: string,
): Promise<A2AToolResult> {
  const args = rawArgs ?? {};
  switch (name) {
    case 'search_services': {
      const query = (args.query as string | undefined) ?? '';
      const limit = (args.limit as number | undefined) ?? 5;
      const params = new URLSearchParams({ limit: String(limit) });
      if (query) params.set('q', query);
      const data = (await internalGet(`/services?${params}`)) as Array<Record<string, unknown>>;
      const items = (Array.isArray(data) ? data : []).slice(0, limit);
      return {
        text: items.length
          ? items
              .map(
                (s, i) =>
                  `${i + 1}. **${s.name}** — ${(s.shortDescription as string) ?? 'Tidak ada deskripsi'}\n   Mulai dari ${formatPrice(s.basePrice)}\n   https://ahlipanggilan.id/services/${s.slug ?? ''}`,
              )
              .join('\n\n')
          : `Tidak ada layanan ditemukan untuk "${query}". Coba: AC, listrik, plumbing, cleaning.`,
      };
    }

    case 'get_service_detail': {
      const slug = args.slug as string;
      const s = (await internalGet(`/services/${slug}`)) as Record<string, unknown>;
      if (!s || !s.name) return { text: `Layanan "${slug}" tidak ditemukan.` };
      return {
        text:
          `## ${s.name}\n\n${(s.shortDescription as string) ?? ''}\n\n` +
          `**Harga Mulai:** ${formatPrice(s.basePrice)}\n` +
          `**Durasi:** ${s.estimatedDuration ? `${s.estimatedDuration} menit` : '-'}\n` +
          `**Kategori:** ${(s.categoryName as string) ?? '-'}\n\n` +
          `Detail: https://ahlipanggilan.id/services/${slug}`,
      };
    }

    case 'check_coverage': {
      const city = (args.city as string).toLowerCase().trim();
      const areas = (await internalGet('/public/coverage-areas')) as Array<Record<string, unknown>>;
      const cities = (Array.isArray(areas) ? areas : [])
        .map((a) => (a.city as string)?.toLowerCase() ?? '')
        .filter(Boolean);
      const isCovered = cities.some((c) => c.includes(city));
      return {
        text: isCovered
          ? `✅ ${args.city} termasuk area layanan Ahli Panggilan. Booking: https://ahlipanggilan.id/book`
          : `❌ ${args.city} belum termasuk area layanan. Kami melayani: ${cities
              .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
              .join(', ')}.`,
      };
    }

    case 'search_faq': {
      const query = (args.query as string | undefined) ?? '';
      const data = (await internalGet(`/cms/faq?q=${encodeURIComponent(query)}`)) as Array<
        Record<string, unknown>
      >;
      const items = (Array.isArray(data) ? data : []).slice(0, 5);
      return {
        text: items.length
          ? items
              .map((faq, i) => `${i + 1}. **${faq.question ?? '-'}**\n   ${faq.answer ?? '-'}`)
              .join('\n\n')
          : `Tidak ada FAQ cocok dengan "${query}". Kunjungi https://ahlipanggilan.id/faq`,
      };
    }

    case 'search_articles': {
      const query = (args.query as string | undefined) ?? '';
      const limit = (args.limit as number | undefined) ?? 3;
      const data = (await internalGet(
        `/cms/articles?q=${encodeURIComponent(query)}&limit=${limit}`,
      )) as Array<Record<string, unknown>>;
      const items = (Array.isArray(data) ? data : []).slice(0, limit);
      return {
        text: items.length
          ? items
              .map(
                (a, i) =>
                  `${i + 1}. **${a.title ?? '-'}**\n   ${(a.summary as string) ?? ''}\n   https://ahlipanggilan.id/blog/${a.slug ?? ''}`,
              )
              .join('\n\n')
          : `Tidak ada artikel cocok dengan "${query}". Kunjungi https://ahlipanggilan.id/blog`,
      };
    }

    case 'track_booking': {
      const bookingNumber = args.bookingNumber as string;
      const b = (await internalGet(`/bookings/tracking/${bookingNumber}`)) as Record<
        string,
        unknown
      >;
      if (!b || !b.bookingNumber) {
        return {
          text: `Nomor booking "${bookingNumber}" tidak ditemukan. Format: SP-2026-000001.`,
        };
      }
      const timeline = Array.isArray(b.timeline) ? b.timeline : [];
      return {
        text:
          `## Tracking ${bookingNumber}\n\n` +
          `**Status:** ${(b.status as string) ?? '-'}\n` +
          `**Layanan:** ${(b.serviceName as string) ?? '-'}\n` +
          `**Teknisi:** ${(b.partnerName as string) ?? 'Belum ditetapkan'}\n` +
          `**Jadwal:** ${(b.bookingDate as string) ?? '-'} ${(b.bookingTime as string) ?? ''}\n` +
          `**Harga:** ${formatPrice(b.finalPrice ?? b.basePrice)}\n` +
          (timeline.length
            ? `\n**Riwayat:**\n${(timeline as Array<Record<string, unknown>>)
                .map(
                  (t, i) =>
                    `${i + 1}. ${(t.status as string) ?? '-'} — ${(t.timestamp as string) ?? (t.createdAt as string) ?? ''}`,
                )
                .join('\n')}`
            : '') +
          `\n\nhttps://ahlipanggilan.id/tracking`,
      };
    }

    case 'get_platform_info': {
      const topic = (args.topic as string | undefined) ?? 'about';
      return { text: PLATFORM_INFO[topic] ?? PLATFORM_INFO.about ?? '' };
    }

    case 'navigate_to_page': {
      const path = PAGE_MAP[args.page as string] ?? '/';
      return { text: `Buka https://ahlipanggilan.id${path}` };
    }

    case 'search_partners': {
      const city = (args.city as string | undefined) ?? '';
      const limit = (args.limit as number | undefined) ?? 5;
      const params = new URLSearchParams({ limit: String(limit) });
      if (city) params.set('city', city);
      const data = (await internalGet(`/public/partners?${params}`)) as Array<
        Record<string, unknown>
      >;
      const items = (Array.isArray(data) ? data : []).slice(0, limit);
      return {
        text: items.length
          ? items
              .map(
                (p, i) =>
                  `${i + 1}. **${p.fullName}** — ${(p.domicile as string) ?? '-'} | Rating ${p.ratingAverage ?? '0'} | ${p.completedJobs ?? 0} pekerjaan`,
              )
              .join('\n\n')
          : 'Belum ada partner terverifikasi untuk area tersebut.',
      };
    }

    case 'create_booking': {
      if (!authToken) {
        return {
          text: 'AUTH_REQUIRED: Pemesanan layanan memerlukan autentikasi. Klien harus login terlebih dahulu dan mengirim Authorization Bearer token.',
        };
      }
      const def = toolDefinitions.find((d) => d.name === 'create_booking');
      const parsed = def ? def.zodSchema.safeParse(rawArgs) : null;
      if (!parsed?.success) {
        const first = parsed?.error.issues[0];
        return {
          text: `Input tidak valid: ${first ? `${first.path.join('.')}: ${first.message}` : 'cek parameter'}`,
        };
      }
      const input = parsed.data as {
        serviceId: string;
        quantity?: number;
        bookingDate: string;
        bookingTime: string;
        address?: {
          receiverName?: string;
          receiverPhone?: string;
          province?: string;
          city?: string;
          district?: string;
          postalCode?: string;
          address?: string;
        };
        notes?: string;
      };
      const result = await createGuestBooking({
        fullName: input.address?.receiverName ?? 'Pelanggan A2A',
        phone: input.address?.receiverPhone ?? '081234567890',
        address: {
          receiverName: input.address?.receiverName ?? 'Pelanggan A2A',
          receiverPhone: input.address?.receiverPhone ?? '081234567890',
          province: input.address?.province ?? 'DKI Jakarta',
          city: input.address?.city ?? 'Jakarta',
          district: input.address?.district ?? 'Kebayoran Baru',
          postalCode: input.address?.postalCode ?? '12120',
          address: input.address?.address ?? 'Alamat pelanggan — mohon perbarui via aplikasi',
        },
        bookingDate: input.bookingDate,
        bookingTime: input.bookingTime,
        notes: input.notes ?? null,
        items: [{ serviceId: input.serviceId, quantity: input.quantity ?? 1 }],
      });
      return {
        text:
          `✅ Booking berhasil dibuat!\n\n` +
          `**Nomor Booking:** ${result.bookingNumber}\n` +
          `**Status:** Pending Confirmation\n` +
          `**Lacak:** https://ahlipanggilan.id/tracking\n\n` +
          `Pesanan akan dikonfirmasi admin; pastikan nomor WhatsApp aktif untuk update status.`,
      };
    }

    default:
      return { text: `Tool "${name}" tidak dikenal.` };
  }
}

/** Tool names the executor may invoke, with zod schemas for validation. */
export const A2A_TOOLS = toolDefinitions
  .filter((d) => d.name !== 'create_booking')
  .map((d) => ({
    name: d.name,
    description: d.description,
    inputSchema: d.inputSchema,
    schema: d.zodSchema,
  }));

export const A2A_BOOKING_TOOL = toolDefinitions.find((d) => d.name === 'create_booking');
