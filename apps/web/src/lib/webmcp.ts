/**
 * WebMCP Tool Definitions — Ahli Panggilan
 *
 * Exposes platform tools to AI agents via navigator.modelContext.provideContext().
 * See: https://webmachinelearning.github.io/webmcp/
 *      https://developer.chrome.com/blog/webmcp-epp
 */

interface ToolDefinition {
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

const tools: ToolDefinition[] = [
  {
    name: 'search_services',
    description:
      'Mencari layanan jasa profesional yang tersedia. Cari berdasarkan kata kunci atau kategori seperti AC, listrik, plumbing, cleaning, CCTV, kunci.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Kata kunci pencarian (contoh: AC, plumbing, listrik, cleaning, CCTV)',
        },
        category: {
          type: 'string',
          description:
            'Kategori layanan (opsional, contoh: ac-service, electrical, plumbing, cleaning)',
        },
        limit: {
          type: 'integer',
          description: 'Jumlah hasil maksimal (default: 5)',
          default: 5,
        },
      },
    },
    execute: async (input) => {
      try {
        const query = (input.query as string) ?? '';
        const limit = (input.limit as number) ?? 5;
        const params = new URLSearchParams({ limit: String(limit) });
        if (query) params.set('q', query);
        const data = await apiGet(`/api/v1/services?${params}`);
        const services = Array.isArray(data)
          ? data
          : ((data as Record<string, unknown>)?.data ?? []);
        const items = (services as Array<Record<string, unknown>>).slice(0, limit);
        return {
          content: [
            {
              type: 'text',
              text: items.length
                ? items
                    .map(
                      (s: Record<string, unknown>, i: number) =>
                        `${i + 1}. **${s.name}** — ${(s.shortDescription as string) ?? 'Tidak ada deskripsi'}\n   Mulai dari Rp${s.basePrice ?? '?'}\n   ${s.slug ? `https://ahlipanggilan.id/services/${s.slug}` : ''}`,
                    )
                    .join('\n\n')
                : `Tidak ada layanan yang ditemukan untuk "${query}". Coba kata kunci lain seperti: AC, listrik, plumbing, cleaning.`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text', text: `Gagal mencari layanan: ${(err as Error).message}` }],
        };
      }
    },
  },
  {
    name: 'get_service_detail',
    description: 'Mendapatkan detail lengkap suatu layanan jasa berdasarkan slug-nya.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description:
            'Slug layanan (contoh: cuci-ac, service-ac, cleaning-rumah, instalasi-listrik, perbaikan-plumbing)',
        },
      },
      required: ['slug'],
    },
    execute: async (input) => {
      try {
        const slug = input.slug as string;
        const data = await apiGet(`/api/v1/services/${slug}`);
        const s = data as Record<string, unknown>;
        return {
          content: [
            {
              type: 'text',
              text:
                `## ${s.name ?? slug}\n\n${(s.shortDescription as string) ?? 'Tidak ada deskripsi'}\n\n` +
                `**Harga Mulai:** Rp${s.basePrice ?? '?'}\n` +
                `**Durasi:** ${s.estimatedDuration ? `${s.estimatedDuration} menit` : 'Tidak ditentukan'}\n` +
                `**Kategori:** ${(s.categoryName as string) ?? '-'}\n\n` +
                `Detail selengkapnya: https://ahlipanggilan.id/services/${slug}`,
            },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: 'text',
              text: `Layanan dengan slug "${input.slug}" tidak ditemukan. Coba cari layanan dengan search_services terlebih dahulu.`,
            },
          ],
        };
      }
    },
  },
  {
    name: 'track_booking',
    description:
      'Melacak status pesanan/service booking menggunakan nomor booking. Format nomor: SP-XXXXX.',
    inputSchema: {
      type: 'object',
      properties: {
        bookingNumber: {
          type: 'string',
          description: 'Nomor booking (contoh: SP-12345)',
        },
      },
      required: ['bookingNumber'],
    },
    execute: async (input) => {
      try {
        const bookingNumber = input.bookingNumber as string;
        const data = await apiGet(`/api/v1/bookings/tracking/${bookingNumber}`);
        const b = data as Record<string, unknown>;
        return {
          content: [
            {
              type: 'text',
              text:
                `## Tracking Pesanan ${bookingNumber}\n\n` +
                `**Status:** ${(b.status as string) ?? '-'}\n` +
                `**Layanan:** ${(b.serviceName as string) ?? '-'}\n` +
                `**Teknisi:** ${(b.partnerName as string) ?? 'Belum ditetapkan'}\n` +
                `**Jadwal:** ${(b.bookingDate as string) ?? '-'} ${(b.bookingTime as string) ?? ''}\n` +
                `**Alamat:** ${(b.address as string) ?? '-'}\n` +
                `**Status Terakhir:** ${(b.statusHistory as string) ?? '-'}\n\n` +
                `Lihat detail: https://ahlipanggilan.id/tracking\n` +
                `Atau hubungi kami untuk bantuan lebih lanjut.`,
            },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: 'text',
              text: `Nomor booking "${input.bookingNumber}" tidak ditemukan. Pastikan formatnya SP-XXXXX (contoh: SP-12345).`,
            },
          ],
        };
      }
    },
  },
  {
    name: 'check_coverage',
    description:
      'Memeriksa apakah suatu kota atau daerah termasuk dalam area layanan Ahli Panggilan.',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description:
            'Nama kota/daerah yang ingin dicek (contoh: Jakarta, Bandung, Tangerang, Bekasi)',
        },
      },
      required: ['city'],
    },
    execute: async (input) => {
      try {
        const city = (input.city as string).toLowerCase().trim();
        const data = await apiGet('/api/v1/public/coverage-areas');
        const areas = Array.isArray(data) ? data : [];
        const cities = (areas as Array<Record<string, unknown>>).map(
          (a) => (a.city as string)?.toLowerCase() ?? '',
        );
        const isCovered = cities.some((c: string) => c.includes(city));
        return {
          content: [
            {
              type: 'text',
              text: isCovered
                ? `✅ **${input.city}** termasuk dalam area layanan Ahli Panggilan! Silakan booking di https://ahlipanggilan.id/book`
                : `❌ **${input.city}** saat ini belum termasuk area layanan Ahli Panggilan. Kami melayani area: ${cities.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}.`,
            },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: 'text',
              text: 'Gagal memeriksa area layanan. Silakan cek langsung di https://ahlipanggilan.id',
            },
          ],
        };
      }
    },
  },
  {
    name: 'search_faq',
    description: 'Mencari pertanyaan yang sering diajukan (FAQ) tentang layanan Ahli Panggilan.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Kata kunci pertanyaan (contoh: booking, pembayaran, garansi, mitra)',
        },
      },
      required: ['query'],
    },
    execute: async (input) => {
      try {
        const query = input.query as string;
        const data = await apiGet(`/api/v1/public/faq?q=${encodeURIComponent(query)}`);
        const faqs = Array.isArray(data) ? data : [];
        const items = faqs as Array<Record<string, unknown>>;
        return {
          content: [
            {
              type: 'text',
              text: items.length
                ? items
                    .slice(0, 5)
                    .map(
                      (faq: Record<string, unknown>, i: number) =>
                        `${i + 1}. **${faq.question ?? '-'}**\n   ${faq.answer ?? '-'}`,
                    )
                    .join('\n\n')
                : `Tidak ada FAQ yang cocok dengan "${query}". Coba kata kunci lain atau kunjungi https://ahlipanggilan.id/faq`,
            },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: 'text',
              text: `Gagal mencari FAQ. Silakan kunjungi https://ahlipanggilan.id/faq untuk daftar lengkap.`,
            },
          ],
        };
      }
    },
  },
  {
    name: 'search_articles',
    description:
      'Mencari artikel blog tentang tips perawatan rumah, AC, plumbing, listrik, dan jasa profesional.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Kata kunci artikel (contoh: AC, plumbing, cleaning, listrik, tips)',
        },
        limit: {
          type: 'integer',
          description: 'Jumlah hasil maksimal (default: 3)',
          default: 3,
        },
      },
      required: ['query'],
    },
    execute: async (input) => {
      try {
        const query = input.query as string;
        const limit = (input.limit as number) ?? 3;
        const data = await apiGet(
          `/api/v1/cms/articles?q=${encodeURIComponent(query)}&limit=${limit}`,
        );
        const articles = Array.isArray(data) ? data : [];
        const items = articles as Array<Record<string, unknown>>;
        return {
          content: [
            {
              type: 'text',
              text: items.length
                ? items
                    .slice(0, limit)
                    .map(
                      (a: Record<string, unknown>, i: number) =>
                        `${i + 1}. **${a.title ?? '-'}**\n   ${(a.summary as string) ?? ''}\n   Baca selengkapnya: https://ahlipanggilan.id/blog/${a.slug ?? ''}`,
                    )
                    .join('\n\n')
                : `Tidak ada artikel yang cocok dengan "${query}". Coba kata kunci lain atau kunjungi https://ahlipanggilan.id/blog`,
            },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: 'text',
              text: `Gagal mencari artikel. Silakan kunjungi https://ahlipanggilan.id/blog`,
            },
          ],
        };
      }
    },
  },
  {
    name: 'navigate_to_page',
    description:
      'Mengarahkan pengguna ke halaman tertentu di website Ahli Panggilan. Gunakan untuk navigasi cepat.',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          enum: [
            'home',
            'services',
            'blog',
            'faq',
            'booking',
            'tracking',
            'partner',
            'corporate',
            'about',
            'contact',
          ],
          description: 'Halaman tujuan',
        },
      },
      required: ['page'],
    },
    execute: async (input) => {
      const pageMap: Record<string, string> = {
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
      const path = pageMap[input.page as string] ?? '/';
      return {
        content: [
          {
            type: 'text',
            text: `Mengarahkan ke halaman ${input.page}: https://ahlipanggilan.id${path}`,
          },
        ],
      };
    },
  },
  {
    name: 'get_platform_info',
    description:
      'Mendapatkan informasi umum tentang platform Ahli Panggilan, visi misi, dan nilai-nilai perusahaan.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          enum: ['about', 'services_overview', 'corporate', 'partner_program', 'contact'],
          description: 'Topik informasi yang ingin diketahui',
        },
      },
      required: ['topic'],
    },
    execute: async () => {
      return {
        content: [
          {
            type: 'text',
            text:
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
          },
        ],
      };
    },
  },
];

/**
 * Register all WebMCP tools with the browser's AI agent context.
 * Gracefully degrades if the API is not available (not all browsers support it).
 */
export function registerWebMCPTools(): void {
  if (typeof navigator === 'undefined') return;
  const mc = (navigator as unknown as Record<string, unknown>).modelContext as
    { provideContext?: (ctx: { tools: ToolDefinition[] }) => void } | undefined;

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
