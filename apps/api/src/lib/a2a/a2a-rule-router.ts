import { executeA2ATool } from './a2a-tools.ts';

interface RouteMatch {
  tool: string;
  args: Record<string, unknown>;
}

/**
 * Deterministic intent router (fallback saat LLM tidak tersedia).
 * Memetakan kata kunci Bahasa Indonesia ke tool yang tepat. Ini bukan
 * parser bahasa; hanya router perkiraan — cukup untuk menjawab permintaan
 * umum tanpa bergantung pada key LLM.
 */
const ROUTES: Array<{
  tool: string;
  keywords: string[];
  buildArgs: (text: string) => Record<string, unknown>;
}> = [
  {
    tool: 'check_coverage',
    keywords: [
      'area layanan',
      'jangkauan',
      'melayani daerah',
      'melayani kota',
      'apakah tersedia di',
      'layanan di kota',
      'operasi di',
      'cakupan',
      'kota mana',
    ],
    buildArgs: (text) => {
      const match = text.match(/di\s+([A-Za-z][A-Za-z\s]{1,30}?)(\?|\.|$)/i);
      return { city: match?.[1]?.trim() ?? '' };
    },
  },
  {
    tool: 'track_booking',
    keywords: [
      'track',
      'lacak',
      'status pesanan',
      'status booking',
      'pesanan saya',
      'nomor booking',
      'cek pesanan',
      'di mana pesanan',
      'booking saya',
      'progress',
    ],
    buildArgs: (text) => {
      const match = text.match(/SP-\d+/i);
      return { bookingNumber: match?.[0] ?? '' };
    },
  },
  {
    tool: 'search_articles',
    keywords: ['artikel', 'blog', 'tips', 'cara', 'panduan', 'tutorial', 'info menarik'],
    buildArgs: (text) => ({
      query: text.replace(/^(tolong|kak|min|om|kak|hai|halo|hey)[,!\s]*/i, '').slice(0, 60),
    }),
  },
  {
    tool: 'search_faq',
    keywords: [
      'faq',
      'pertanyaan',
      'tanya',
      'cara kerja',
      'garansi',
      'pembayaran',
      'refund',
      'batal',
      'reschedule',
      'biaya',
      'harga',
      'tarif',
      'estimasi',
    ],
    buildArgs: (text) => ({ query: text.slice(0, 60) }),
  },
  {
    tool: 'search_partners',
    keywords: ['partner', 'teknisi', 'tukang', 'mitra', 'terverifikasi', 'profesional terdekat'],
    buildArgs: (_text) => ({ city: '', limit: 5 }),
  },
  {
    tool: 'get_platform_info',
    keywords: [
      'korporasi',
      'korporat',
      'perusahaan',
      'b2b',
      'kontrak',
      'kerjasama',
      'mitra bisnis',
      'partner program',
      'jadi partner',
      'daftar partner',
      'cara daftar',
      'kontak',
      'hubungi',
      'alamat',
      'email',
      'tentang',
      'apa itu ahlipanggilan',
      'siapa',
    ],
    buildArgs: (text) => {
      const lower = text.toLowerCase();
      if (/(korporasi|korporat|perusahaan|b2b|kontrak|kerjasama)/.test(lower))
        return { topic: 'corporate' };
      if (/(partner|mitra|jadi)/.test(lower)) return { topic: 'partner_program' };
      if (/(kontak|hubungi|email|alamat)/.test(lower)) return { topic: 'contact' };
      return { topic: 'about' };
    },
  },
  {
    tool: 'get_service_detail',
    keywords: [
      'detail layanan',
      'info layanan',
      'spesifikasi',
      'durasi',
      'termasuk apa',
      'apa saja',
    ],
    buildArgs: (text) => {
      const match = text.match(
        /(?:layanan|jasa|service)\s+(ac|listrik|plumbing|cleaning|cctv|kunci|bangunan|sedot)\s*([a-z0-9-]*)/i,
      );
      return { slug: match?.[2] || match?.[1] || '' };
    },
  },
  {
    tool: 'search_services',
    keywords: [
      'layanan',
      'service',
      'jasa',
      'daftar',
      'katalog',
      'apa saja',
      'tersedia',
      'pilihan',
      'berlangganan',
      'perbaikan',
      'perawatan',
      'pasang',
      'service ac',
      'cuci ac',
      'freon',
      'pipa',
      'mampet',
      'sedot',
      'instalasi listrik',
      'cctv',
      'kunci',
    ],
    buildArgs: (text) => ({ query: text.slice(0, 40), limit: 5 }),
  },
];

export function routeIntent(text: string): RouteMatch | null {
  const lower = text.toLowerCase().trim();
  for (const route of ROUTES) {
    if (route.keywords.some((k) => lower.includes(k))) {
      return { tool: route.tool, args: route.buildArgs(lower) };
    }
  }
  return null;
}

export async function answerWithRules(
  text: string,
): Promise<{ text: string; tool: string | null }> {
  const match = routeIntent(text);
  if (!match) {
    return {
      text:
        'Saya adalah Ahli Panggilan Booking Agent. Saya bisa membantu:\n' +
        '- Mencari layanan (mis. "layanan AC", "service listrik")\n' +
        '- Cek area layanan (mis. "apakah melayani Bandung?")\n' +
        '- Melacak pesanan (nomor SP-XXXX)\n' +
        '- Info partner / korporasi / kontak\n\n' +
        'Atau kunjungi https://ahlipanggilan.id untuk info lengkap.',
      tool: null,
    };
  }
  const result = await executeA2ATool(match.tool, match.args, undefined);
  return { text: result.text, tool: match.tool };
}
