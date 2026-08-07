/**
 * WebMCP Tool Definitions — Ahli Panggilan
 *
 * Tool metadata (name, description, inputSchema) bersumber dari
 * @ahlipanggilan/mcp-tools — satu definisi untuk WebMCP (browser) dan
 * native MCP server. Di sini hanya ditambahkan `execute` browser-side
 * yang memanggil API via relative URL (di-proxy Astro/nginx).
 *
 * See: https://webmachinelearning.github.io/webmcp/
 *      https://developer.chrome.com/blog/webmcp-epp
 */

import { toolDefinitions } from '@ahlipanggilan/mcp-tools';

interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<{
    content: Array<{ type: string; text: string }>;
  }>;
}

/**
 * Fetch API data using relative URL.
 * In dev, Astro proxies /api/ → Hono API (port 3000).
 * In production, nginx routes /api/ → API backend.
 * Using relative URLs avoids CORS issues and works everywhere.
 */
async function apiGet(path: string): Promise<unknown> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  const body = (await res.json()) as { data?: unknown };
  return body.data ?? body;
}

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

const PLATFORM_INFO: Record<string, string> = {
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
    'Gunakan search_services untuk melihat katalog lengkap.',
  corporate:
    'Ahli Panggilan melayani kebutuhan korporasi: perawatan gedung rutin, SLA terjadwal, ' +
    'penagihan terpusat, dan manajemen aset. Kunjungi https://ahlipanggilan.id/corporate.',
  partner_program:
    'Ahli Panggilan membuka kemitraan untuk teknisi profesional (AC, listrik, plumbing, cleaning, ' +
    'bangunan, CCTV, kunci). Verifikasi dokumen dalam 1x24 jam. Daftar di https://ahlipanggilan.id/partner.',
  contact:
    'Hubungi Ahli Panggilan: email hello@ahlipanggilan.id, halaman kontak ' +
    'https://ahlipanggilan.id/kontak, atau booking langsung di https://ahlipanggilan.id/book.',
};

async function executeWebMcpTool(name: string, input: Record<string, unknown>): Promise<string> {
  switch (name) {
    case 'search_services': {
      const query = (input.query as string) ?? '';
      const limit = (input.limit as number) ?? 5;
      const params = new URLSearchParams({ limit: String(limit) });
      if (query) params.set('q', query);
      const data = (await apiGet(`/api/v1/services?${params}`)) as Array<Record<string, unknown>>;
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
      const slug = input.slug as string;
      const s = (await apiGet(`/api/v1/services/${slug}`)) as Record<string, unknown>;
      if (!s || !s.name) {
        return `Layanan dengan slug "${slug}" tidak ditemukan. Coba cari layanan dengan search_services terlebih dahulu.`;
      }
      return (
        `## ${s.name}\n\n${(s.shortDescription as string) ?? 'Tidak ada deskripsi'}\n\n` +
        `**Harga Mulai:** Rp${s.basePrice ?? '?'}\n` +
        `**Durasi:** ${s.estimatedDuration ? `${s.estimatedDuration} menit` : 'Tidak ditentukan'}\n` +
        `**Kategori:** ${(s.categoryName as string) ?? '-'}\n\n` +
        `Detail selengkapnya: https://ahlipanggilan.id/services/${slug}`
      );
    }

    case 'track_booking': {
      const bookingNumber = input.bookingNumber as string;
      const b = (await apiGet(`/api/v1/bookings/tracking/${bookingNumber}`)) as Record<
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
      const city = (input.city as string).toLowerCase().trim();
      const areas = (await apiGet('/api/v1/public/coverage-areas')) as Array<
        Record<string, unknown>
      >;
      const cities = (Array.isArray(areas) ? areas : [])
        .map((a) => (a.city as string)?.toLowerCase() ?? '')
        .filter(Boolean);
      const isCovered = cities.some((c) => c.includes(city));
      return isCovered
        ? `✅ **${input.city}** termasuk dalam area layanan Ahli Panggilan! Silakan booking di https://ahlipanggilan.id/book`
        : `❌ **${input.city}** saat ini belum termasuk area layanan Ahli Panggilan. Kami melayani area: ${cities
            .map((c) => c.charAt(0).toUpperCase() + c.slice(1))
            .join(', ')}.`;
    }

    case 'search_faq': {
      const query = input.query as string;
      const data = (await apiGet(`/api/v1/cms/faq?q=${encodeURIComponent(query)}`)) as Array<
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
      const query = input.query as string;
      const limit = (input.limit as number) ?? 3;
      const data = (await apiGet(
        `/api/v1/cms/articles?q=${encodeURIComponent(query)}&limit=${limit}`,
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
      const path = PAGE_MAP[input.page as string] ?? '/';
      return `Mengarahkan ke halaman ${input.page}: https://ahlipanggilan.id${path}`;
    }

    case 'get_platform_info': {
      const topic = (input.topic as string) ?? 'about';
      return PLATFORM_INFO[topic] ?? PLATFORM_INFO.about ?? '';
    }

    default:
      return `Tool "${name}" tidak dikenal.`;
  }
}

/** Build browser-side WebMCP tools from shared definitions + browser execute. */
function buildTools(): WebMcpTool[] {
  return toolDefinitions.map((def) => ({
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema,
    execute: async (input: Record<string, unknown>) => {
      try {
        const text = await executeWebMcpTool(def.name, input);
        return { content: [{ type: 'text', text }] };
      } catch (err) {
        return {
          content: [
            { type: 'text', text: `Gagal menjalankan ${def.name}: ${(err as Error).message}` },
          ],
        };
      }
    },
  }));
}

const tools: WebMcpTool[] = buildTools();

/**
 * Register all WebMCP tools with the browser's AI agent context.
 * Gracefully degrades if the API is not available (not all browsers support it).
 */
export function registerWebMCPTools(): void {
  if (typeof navigator === 'undefined') return;
  const mc = (navigator as unknown as Record<string, unknown>).modelContext as
    { provideContext?: (ctx: { tools: WebMcpTool[] }) => void } | undefined;

  if (!mc?.provideContext) {
    // WebMCP not supported — silently degrade
    return;
  }

  try {
    mc.provideContext({ tools });
  } catch {
    // Silent fail — WebMCP not available
  }
}

export { tools };
