/**
 * Shared tool metadata for AI agent integration (WebMCP + MCP server).
 *
 * Definisi tool tunggal yang dipakai oleh:
 *  - WebMCP browser integration (apps/web/src/lib/webmcp.ts) via
 *    `navigator.modelContext.provideContext()`.
 *  - Native MCP Streamable HTTP server (apps/api/src/routes/mcp.ts) via
 *    `@modelcontextprotocol/sdk`.
 *
 * `inputSchema` mengikuti JSON Schema (draft 2020-12 subset) yang dipahami
 * keduanya; tipe input dijalankan melalui zod schema untuk validasi.
 */

import { z } from 'zod';

export interface ToolDefinition {
  /** Nama tool — identifier unik (snake_case). */
  name: string;
  /** Deskripsi dalam Bahasa Indonesia untuk model AI. */
  description: string;
  /** JSON Schema untuk deklarasi ke WebMCP / MCP. */
  inputSchema: Record<string, unknown>;
  /** Zod schema untuk validasi input di sisi eksekusi. */
  zodSchema: z.ZodType;
}

export const searchServicesSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export const getServiceDetailSchema = z.object({
  slug: z.string().min(1),
});

export const trackBookingSchema = z.object({
  bookingNumber: z.string().regex(/^SP-\d+$/, 'Format nomor booking: SP-12345'),
});

export const checkCoverageSchema = z.object({
  city: z.string().min(1),
});

export const searchFaqSchema = z.object({
  query: z.string().min(1),
});

export const searchArticlesSchema = z.object({
  query: z.string().min(1),
  limit: z.number().int().min(1).max(20).optional(),
});

export const navigateToPageSchema = z.object({
  page: z.enum([
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
  ]),
});

export const getPlatformInfoSchema = z.object({
  topic: z.enum(['about', 'services_overview', 'corporate', 'partner_program', 'contact']),
});

export const createBookingSchema = z.object({
  serviceId: z.string().min(1),
  quantity: z.number().int().min(1).max(99).default(1),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal: YYYY-MM-DD'),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam: HH:mm'),
  fullName: z.string().min(1).optional(),
  phone: z.string().min(6).optional(),
  address: z
    .object({
      receiverName: z.string().min(1),
      receiverPhone: z.string().min(6),
      province: z.string().min(1),
      city: z.string().min(1),
      district: z.string().min(1),
      postalCode: z.string().min(3),
      address: z.string().min(5),
    })
    .optional(),
  notes: z.string().max(2000).optional(),
});

export const searchPartnersSchema = z.object({
  city: z.string().optional(),
  serviceId: z.string().optional(),
  limit: z.number().int().min(1).max(20).optional(),
});

export const toolDefinitions: ToolDefinition[] = [
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
        categoryId: {
          type: 'string',
          description: 'ID kategori layanan (opsional, contoh: UUID kategori)',
        },
        limit: {
          type: 'integer',
          description: 'Jumlah hasil maksimal (default: 5)',
        },
      },
    },
    zodSchema: searchServicesSchema,
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
    zodSchema: getServiceDetailSchema,
  },
  {
    name: 'track_booking',
    description:
      'Melacak status pesanan/service booking menggunakan nomor booking. Format nomor: SP-12345 (tahun terbaru SP-2026-000001).',
    inputSchema: {
      type: 'object',
      properties: {
        bookingNumber: {
          type: 'string',
          description: 'Nomor booking (contoh: SP-12345 atau SP-2026-000001)',
        },
      },
      required: ['bookingNumber'],
    },
    zodSchema: trackBookingSchema,
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
    zodSchema: checkCoverageSchema,
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
    zodSchema: searchFaqSchema,
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
        },
      },
      required: ['query'],
    },
    zodSchema: searchArticlesSchema,
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
    zodSchema: navigateToPageSchema,
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
    zodSchema: getPlatformInfoSchema,
  },
  {
    name: 'create_booking',
    description:
      'Membuat pesanan layanan (booking) baru. Untuk pelanggan tanpa akun, berikan fullName, phone, dan address. Pelanggan terdaftar dapat memakai Bearer token dan cukup memberikan serviceId, bookingDate, bookingTime.',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: {
          type: 'string',
          description: 'ID layanan (UUID). Cari dulu dengan search_services.',
        },
        quantity: {
          type: 'integer',
          description: 'Jumlah unit (default: 1)',
        },
        bookingDate: {
          type: 'string',
          description: 'Tanggal booking (YYYY-MM-DD)',
        },
        bookingTime: {
          type: 'string',
          description: 'Jam booking (HH:mm, format 24 jam)',
        },
        fullName: {
          type: 'string',
          description: 'Nama lengkap (wajib untuk guest booking tanpa akun)',
        },
        phone: {
          type: 'string',
          description: 'Nomor WhatsApp aktif (wajib untuk guest booking tanpa akun)',
        },
        address: {
          type: 'object',
          description: 'Alamat lengkap (wajib untuk guest booking tanpa akun)',
          properties: {
            receiverName: { type: 'string' },
            receiverPhone: { type: 'string' },
            province: { type: 'string' },
            city: { type: 'string' },
            district: { type: 'string' },
            postalCode: { type: 'string' },
            address: { type: 'string' },
          },
          required: [
            'receiverName',
            'receiverPhone',
            'province',
            'city',
            'district',
            'postalCode',
            'address',
          ],
        },
        notes: {
          type: 'string',
          description: 'Catatan tambahan untuk teknisi (opsional)',
        },
      },
      required: ['serviceId', 'bookingDate', 'bookingTime'],
    },
    zodSchema: createBookingSchema,
  },
  {
    name: 'search_partners',
    description:
      'Mencari mitra/teknisi terverifikasi yang tersedia, opsional difilter berdasarkan kota atau layanan.',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'Kota mitra (contoh: Jakarta, Bandung)',
        },
        serviceId: {
          type: 'string',
          description: 'ID layanan untuk filter keahlian',
        },
        limit: {
          type: 'integer',
          description: 'Jumlah hasil maksimal (default: 5)',
        },
      },
    },
    zodSchema: searchPartnersSchema,
  },
];
