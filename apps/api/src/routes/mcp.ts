import { Hono } from 'hono';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { toolDefinitions } from '@ahlipanggilan/mcp-tools';
import { createGuestBooking as createGuestBookingService } from '../lib/booking-service.ts';

/**
 * Native MCP (Model Context Protocol) server — Streamable HTTP transport.
 *
 * Exposes platform tools to AI agents via JSON-RPC over HTTP at /api/v1/mcp.
 * Stateless mode: fresh transport + server per request (no session state),
 * JSON responses instead of SSE streams — compatible with nginx proxy
 * buffering and horizontally scaled workers.
 *
 * Spec: https://modelcontextprotocol.io/specification/2025-06-18
 */

const API_INTERNAL_BASE = process.env.API_INTERNAL_URL ?? 'http://localhost:3000';

const PAGE_MAP: Record<string, string> = {
  home: '/',
  services: '/services',
  blog: '/blog',
  faq: '/faq',
  booking: '/book',
  tracking: '/tracking',
  partner: '/partner',
  corporate: '/corporate',
  about: '/tentang-kami',
  contact: '/kontak',
};

const PLATFORM_INFO = {
  about:
    '**Ahli Panggilan** adalah platform layanan jasa profesional (on-demand service booking) di Indonesia.\n\n' +
    '**Layanan:** AC, listrik, plumbing, cleaning, bangunan, CCTV, kunci\n' +
    '**Area:** Jakarta, Bandung, Tangerang, Bekasi, Depok, Bogor\n' +
    '**Jam Operasional:** Senin-Sabtu 08:00-20.00, Minggu 09:00-17.00 WIB\n' +
    '**Kontak:** hello@ahlipanggilan.id\n\n' +
    '**Keunggulan:**\n' +
    '✅ Harga transparan tanpa biaya tersembunyi\n' +
    '✅ Teknisi terverifikasi dan berpengalaman\n' +
    '✅ Booking cepat dalam hitungan menit\n' +
    '✅ Garansi kepuasan untuk setiap layanan\n\n' +
    'Website: https://ahlipanggilan.id\n' +
    'Dokumentasi AI: https://ahlipanggilan.id/llms.txt',
  services_overview:
    'Katalog layanan Ahli Panggilan mencakup: perawatan & perbaikan AC, instalasi dan perbaikan listrik, ' +
    'plumbing (pipa bocor, saluran mampet), cleaning rumah & kantor, perbaikan bangunan ringan, ' +
    'pemasangan CCTV, dan jasa tukang kunci. Semua teknisi terverifikasi dengan harga transparan. ' +
    'Gunakan tool search_services untuk melihat katalog lengkap.',
  corporate:
    'Ahli Panggilan melayani kebutuhan korporasi: perawatan gedung rutin, SLA terjadwal, ' +
    'penagihan terpusat, dan manajemen aset. Kunjungi https://ahlipanggilan.id/corporate ' +
    'untuk penawaran korporasi.',
  partner_program:
    'Ahli Panggilan membuka kemitraan untuk teknisi profesional (AC, listrik, plumbing, cleaning, ' +
    'bangunan, CCTV, kunci). Verifikasi dokumen dalam 1x24 jam. Daftar di https://ahlipanggilan.id/partner.',
  contact:
    'Hubungi Ahli Panggilan: email hello@ahlipanggilan.id, halaman kontak ' +
    'https://ahlipanggilan.id/kontak, atau booking langsung di https://ahlipanggilan.id/book.',
};

/** Internal GET helper — reuses the public API endpoints (single source of truth for business logic). */
async function internalGet(path: string): Promise<unknown> {
  const res = await fetch(`${API_INTERNAL_BASE}/api/v1${path}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  const body = (await res.json()) as { data?: unknown };
  return body.data ?? body;
}

/** Get a fresh stateless MCP server with all platform tools registered. */
function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: 'Ahli Panggilan API',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const defs = new Map(toolDefinitions.map((d) => [d.name, d]));

  for (const def of toolDefinitions) {
    server.registerTool(
      def.name,
      {
        description: def.description,
        inputSchema: def.zodSchema,
      },
      async (args: unknown) => {
        try {
          const text = await executeTool(def.name, args);
          return { content: [{ type: 'text' as const, text }] };
        } catch (err) {
          return {
            content: [{ type: 'text' as const, text: `Error: ${(err as Error).message}` }],
            isError: true,
          };
        }
      },
    );
  }
  void defs;

  return server;
}

async function executeTool(name: string, rawArgs: unknown): Promise<string> {
  const args = (rawArgs ?? {}) as Record<string, unknown>;
  switch (name) {
    case 'search_services': {
      const query = (args.query as string | undefined) ?? '';
      const limit = (args.limit as number | undefined) ?? 5;
      const params = new URLSearchParams({ limit: String(limit) });
      if (query) params.set('q', query);
      const data = (await internalGet(`/services?${params}`)) as Array<Record<string, unknown>>;
      const items = (Array.isArray(data) ? data : []).slice(0, limit);
      return items.length
        ? items
            .map(
              (s, i) =>
                `${i + 1}. **${s.name}** — ${(s.shortDescription as string) ?? 'Tidak ada deskripsi'}\n   Mulai dari Rp${s.basePrice ?? '?'}\n   ${s.slug ? `https://ahlipanggilan.id/services/${s.slug}` : ''}`,
            )
            .join('\n\n')
        : `Tidak ada layanan yang ditemukan untuk "${query}". Coba kata kunci lain seperti: AC, listrik, plumbing, cleaning.`;
    }

    case 'get_service_detail': {
      const slug = args.slug as string;
      const s = (await internalGet(`/services/${slug}`)) as Record<string, unknown>;
      if (!s || !s.name)
        return `Layanan dengan slug "${slug}" tidak ditemukan. Coba cari layanan dengan search_services terlebih dahulu.`;
      return (
        `## ${s.name}\n\n${(s.shortDescription as string) ?? 'Tidak ada deskripsi'}\n\n` +
        `**Harga Mulai:** Rp${s.basePrice ?? '?'}\n` +
        `**Durasi:** ${s.estimatedDuration ? `${s.estimatedDuration} menit` : 'Tidak ditentukan'}\n` +
        `**Kategori:** ${(s.categoryName as string) ?? '-'}\n\n` +
        `Detail selengkapnya: https://ahlipanggilan.id/services/${slug}`
      );
    }

    case 'track_booking': {
      const bookingNumber = args.bookingNumber as string;
      const b = (await internalGet(`/bookings/tracking/${bookingNumber}`)) as Record<
        string,
        unknown
      >;
      if (!b || !b.bookingNumber) {
        return `Nomor booking "${bookingNumber}" tidak ditemukan. Pastikan formatnya SP-12345 atau SP-2026-000001.`;
      }
      const timeline = Array.isArray(b.timeline) ? b.timeline : [];
      return (
        `## Tracking Pesanan ${bookingNumber}\n\n` +
        `**Status:** ${(b.status as string) ?? '-'}\n` +
        `**Layanan:** ${(b.serviceName as string) ?? '-'}\n` +
        `**Teknisi:** ${(b.partnerName as string) ?? 'Belum ditetapkan'}\n` +
        `**Jadwal:** ${(b.bookingDate as string) ?? '-'} ${(b.bookingTime as string) ?? ''}\n` +
        `**Harga:** Rp${b.finalPrice ?? b.basePrice ?? '-'}\n` +
        (timeline.length
          ? `\n**Riwayat Status:**\n${(timeline as Array<Record<string, unknown>>)
              .map(
                (t, i) =>
                  `${i + 1}. ${(t.status as string) ?? '-'} — ${(t.timestamp as string) ?? (t.createdAt as string) ?? ''}`,
              )
              .join('\n')}`
          : '') +
        `\n\nLihat detail: https://ahlipanggilan.id/tracking`
      );
    }

    case 'check_coverage': {
      const city = (args.city as string).toLowerCase().trim();
      const areas = (await internalGet('/public/coverage-areas')) as Array<Record<string, unknown>>;
      const cities = (Array.isArray(areas) ? areas : [])
        .map((a) => (a.city as string)?.toLowerCase() ?? '')
        .filter(Boolean);
      const isCovered = cities.some((c) => c.includes(city));
      return isCovered
        ? `✅ **${args.city}** termasuk dalam area layanan Ahli Panggilan! Silakan booking di https://ahlipanggilan.id/book`
        : `❌ **${args.city}** saat ini belum termasuk area layanan Ahli Panggilan. Kami melayani area: ${cities
            .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
            .join(', ')}.`;
    }

    case 'search_faq': {
      const query = args.query as string;
      const data = (await internalGet(`/cms/faq?q=${encodeURIComponent(query)}`)) as Array<
        Record<string, unknown>
      >;
      const items = (Array.isArray(data) ? data : []).slice(0, 5);
      return items.length
        ? items
            .map((faq, i) => `${i + 1}. **${faq.question ?? '-'}**\n   ${faq.answer ?? '-'}`)
            .join('\n\n')
        : `Tidak ada FAQ yang cocok dengan "${query}". Coba kata kunci lain atau kunjungi https://ahlipanggilan.id/faq`;
    }

    case 'search_articles': {
      const query = args.query as string;
      const limit = (args.limit as number | undefined) ?? 3;
      const data = (await internalGet(
        `/cms/articles?q=${encodeURIComponent(query)}&limit=${limit}`,
      )) as Array<Record<string, unknown>>;
      const items = (Array.isArray(data) ? data : []).slice(0, limit);
      return items.length
        ? items
            .map(
              (a, i) =>
                `${i + 1}. **${a.title ?? '-'}**\n   ${(a.summary as string) ?? ''}\n   Baca selengkapnya: https://ahlipanggilan.id/blog/${a.slug ?? ''}`,
            )
            .join('\n\n')
        : `Tidak ada artikel yang cocok dengan "${query}". Coba kata kunci lain atau kunjungi https://ahlipanggilan.id/blog`;
    }

    case 'navigate_to_page': {
      const path = PAGE_MAP[args.page as string] ?? '/';
      return `Mengarahkan ke halaman ${args.page}: https://ahlipanggilan.id${path}`;
    }

    case 'get_platform_info': {
      const topic = (args.topic as string) ?? 'about';
      return PLATFORM_INFO[topic as keyof typeof PLATFORM_INFO] ?? PLATFORM_INFO.about;
    }

    case 'create_booking': {
      const parsed = toolDefinitions
        .find((d) => d.name === 'create_booking')!
        .zodSchema.safeParse(rawArgs);
      if (!parsed.success) {
        const first = parsed.error.issues[0];
        return `Input tidak valid: ${first ? `${first.path.join('.')}: ${first.message}` : 'cek kembali parameter'}`;
      }
      const input = parsed.data as {
        serviceId: string;
        quantity?: number;
        bookingDate: string;
        bookingTime: string;
        fullName?: string;
        phone?: string;
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
      const result = await createGuestBookingService({
        fullName: input.fullName ?? 'Pelanggan MCP',
        phone: input.phone ?? '081234567890',
        address: {
          receiverName: input.address?.receiverName ?? input.fullName ?? 'Pelanggan MCP',
          receiverPhone: input.address?.receiverPhone ?? input.phone ?? '081234567890',
          province: input.address?.province ?? 'DKI Jakarta',
          city: input.address?.city ?? 'Jakarta',
          district: input.address?.district ?? 'Kebayoran Baru',
          postalCode: input.address?.postalCode ?? '12120',
          address:
            input.address?.address ??
            'Alamat lengkap pelanggan (default) — mohon perbarui via aplikasi',
        },
        bookingDate: input.bookingDate,
        bookingTime: input.bookingTime,
        notes: input.notes ?? null,
        items: [{ serviceId: input.serviceId, quantity: input.quantity ?? 1 }],
      });
      return (
        `✅ Booking berhasil dibuat!\n\n` +
        `**Nomor Booking:** ${result.bookingNumber}\n` +
        `**Status:** Pending Confirmation\n` +
        `**Lacak:** https://ahlipanggilan.id/api/v1/bookings/tracking/${result.bookingNumber}\n` +
        `**Lihat di website:** https://ahlipanggilan.id/tracking\n\n` +
        `Pesanan akan dikonfirmasi oleh admin. Mohon pastikan nomor WhatsApp aktif untuk update status.`
      );
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
      return items.length
        ? items
            .map(
              (p, i) =>
                `${i + 1}. **${p.fullName}** — ${(p.domicile as string) ?? '-'} | Rating ${p.ratingAverage ?? '0'} | ${p.completedJobs ?? 0} pekerjaan | ${(p.availability as string) ?? '-'}`,
            )
            .join('\n')
        : `Tidak ada mitra ditemukan${city ? ` di "${city}"` : ''}.`;
    }

    default:
      return `Tool "${name}" tidak dikenal.`;
  }
}

const mcpRouter = new Hono();

mcpRouter.all('/mcp', async (c) => {
  const transport = new WebStandardStreamableHTTPServerTransport({
    enableJsonResponse: true,
  });
  const server = createMcpServer();
  await server.connect(transport);
  return transport.handleRequest(c.req.raw);
});

export { mcpRouter };
