// ── Types ──────────────────────────────────────────────────────

export interface SeoCheck {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  /** Optional detail about what was found */
  detail?: string;
}

export interface SeoAnalysisResult {
  score: number;
  checks: SeoCheck[];
  keywordDensity: number;
  keywordCount: number;
  wordCount: number;
}

export interface ReadabilityResult {
  score: number;
  label: string;
  level: 'easy' | 'medium' | 'hard';
  avgSentenceLength: number;
  avgParagraphLength: number;
  longSentences: number;
  longParagraphs: number;
}

export interface SnippetPreviewData {
  title: string;
  description: string;
  url: string;
  titleTooLong: boolean;
  descriptionTooLong: boolean;
}

// ── Constants ──────────────────────────────────────────────────

const TRANSITION_WORDS = [
  'selain itu',
  'disamping',
  'meskipun',
  'namun',
  'tetapi',
  'akan tetapi',
  'oleh karena itu',
  'dengan demikian',
  'sementara itu',
  'sementara',
  'pertama',
  'kedua',
  'ketiga',
  'selanjutnya',
  'kemudian',
  'setelah itu',
  'sebelumnya',
  'akhirnya',
  'sebagai contoh',
  'misalnya',
  'seperti',
  'dalam hal ini',
  'pada dasarnya',
  'secara umum',
  'sebaliknya',
  'di satu sisi',
  'di sisi lain',
  'selain',
  'kecuali',
  'khususnya',
  'terutama',
  'setidaknya',
  'paling tidak',
  'singkatnya',
  'kesimpulannya',
  'oleh sebab itu',
  'dengan kata lain',
  'berdasarkan',
  'mengingat',
  'sehubungan',
  'terkait',
];

// ── Helpers ────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function countOccurrences(text: string, keyword: string): number {
  if (!keyword || !text) return 0;
  const normalized = text.toLowerCase();
  const kw = keyword.toLowerCase();
  let count = 0;
  let pos = 0;
  while ((pos = normalized.indexOf(kw, pos)) !== -1) {
    count++;
    pos += kw.length;
  }
  return count;
}

function isInFirst100Words(text: string, keyword: string): boolean {
  const words = text.split(/\s+/).slice(0, 100);
  return countOccurrences(words.join(' '), keyword) > 0;
}

function isInFirstParagraph(html: string, keyword: string): boolean {
  const match = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (!match) return false;
  return countOccurrences(stripHtml(match[1] ?? ''), keyword) > 0;
}

function extractHeadings(html: string): string[] {
  const headingRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
  const headings: string[] = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push(stripHtml(match[1] ?? ''));
  }
  return headings;
}

function extractImageAltTexts(html: string): string[] {
  const altRegex = /<img[^>]*alt="([^"]*)"[^>]*>/gi;
  const alts: string[] = [];
  let match;
  while ((match = altRegex.exec(html)) !== null) {
    alts.push(match[1] ?? '');
  }
  return alts;
}

function countWords(text: string): number {
  const cleaned = stripHtml(text).trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

function countSentences(text: string): number {
  const cleaned = stripHtml(text).trim();
  if (!cleaned) return 0;
  return cleaned.split(/[.!?]+/).filter(Boolean).length || 1;
}

function countPassiveVoice(sentence: string): number {
  // Indonesian passive voice patterns: di-, ter-, ke-an, etc.
  const passivePatterns = /\b(di|ter|ke)\w+/gi;
  const matches = sentence.match(passivePatterns);
  return matches?.length ?? 0;
}

// ── Main analysis functions ───────────────────────────────────

export function analyzeContent(
  contentHtml: string,
  keyword: string,
  title: string,
  slug: string,
  metaTitle: string,
): SeoAnalysisResult {
  const text = stripHtml(contentHtml);
  const textLower = text.toLowerCase();
  const kwLower = keyword.toLowerCase();
  const checks: SeoCheck[] = [];
  const wordCount = countWords(text);
  const keywordCount = countOccurrences(text, keyword);
  const keywordDensity = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

  // ── 1. Keyword in title ──────────────────────────────────────
  if (keyword && title.toLowerCase().includes(kwLower)) {
    checks.push({
      id: 'title',
      label: 'Kata kunci di judul',
      status: 'pass',
      message: 'Kata kunci ditemukan di judul artikel',
    });
  } else if (keyword) {
    checks.push({
      id: 'title',
      label: 'Kata kunci di judul',
      status: 'fail',
      message: 'Tambahkan kata kunci ke judul artikel',
    });
  }

  // ── 2. Keyword in meta title ─────────────────────────────────
  if (keyword && metaTitle.toLowerCase().includes(kwLower)) {
    checks.push({
      id: 'metaTitle',
      label: 'Kata kunci di meta title',
      status: 'pass',
      message: 'Kata kunci ditemukan di meta title',
    });
  } else if (keyword && metaTitle) {
    checks.push({
      id: 'metaTitle',
      label: 'Kata kunci di meta title',
      status: 'fail',
      message: 'Tambahkan kata kunci ke meta title',
    });
  }

  // ── 3. Keyword in URL slug ───────────────────────────────────
  if (keyword && slug.includes(slugify(keyword))) {
    checks.push({
      id: 'slug',
      label: 'Kata kunci di URL slug',
      status: 'pass',
      message: 'Kata kunci ditemukan di URL slug',
    });
  } else if (keyword) {
    checks.push({
      id: 'slug',
      label: 'Kata kunci di URL slug',
      status: 'fail',
      message: 'Gunakan kata kunci di URL slug',
    });
  }

  // ── 4. Keyword in first paragraph ────────────────────────────
  if (keyword && isInFirstParagraph(contentHtml, keyword)) {
    checks.push({
      id: 'firstParagraph',
      label: 'Kata kunci di paragraf pertama',
      status: 'pass',
      message: 'Kata kunci muncul di paragraf pertama',
    });
  } else if (keyword) {
    checks.push({
      id: 'firstParagraph',
      label: 'Kata kunci di paragraf pertama',
      status: 'fail',
      message: 'Letakkan kata kunci di paragraf pertama',
    });
  }

  // ── 5. Keyword in first 100 words ────────────────────────────
  if (keyword && isInFirst100Words(text, keyword)) {
    checks.push({
      id: 'keywordProximity',
      label: 'Kata kunci di 100 kata pertama',
      status: 'pass',
      message: 'Kata kunci muncul di 100 kata pertama konten',
    });
  } else if (keyword) {
    checks.push({
      id: 'keywordProximity',
      label: 'Kata kunci di 100 kata pertama',
      status: 'fail',
      message: 'Letakkan kata kunci di awal konten',
    });
  }

  // ── 6. Keyword in headings ───────────────────────────────────
  if (keyword) {
    const headings = extractHeadings(contentHtml);
    const inHeadings = headings.some((h) => h.toLowerCase().includes(kwLower));
    checks.push({
      id: 'headings',
      label: 'Kata kunci di subheading',
      status: inHeadings ? 'pass' : 'fail',
      message: inHeadings
        ? 'Kata kunci ditemukan di subheading (H2/H3)'
        : 'Gunakan kata kunci di setidaknya satu subheading',
    });
  }

  // ── 7. Keyword density ───────────────────────────────────────
  if (keyword && wordCount > 0) {
    if (keywordDensity >= 0.5 && keywordDensity <= 3) {
      checks.push({
        id: 'density',
        label: 'Kepadatan kata kunci',
        status: 'pass',
        message: `Kepadatan ${keywordDensity.toFixed(1)}% — ideal (0.5%–3%)`,
        detail: `${keywordCount} kali dari ${wordCount} kata`,
      });
    } else if (keywordDensity < 0.5 && keywordCount > 0) {
      checks.push({
        id: 'density',
        label: 'Kepadatan kata kunci',
        status: 'warning',
        message: `Kepadatan ${keywordDensity.toFixed(1)}% — terlalu rendah`,
        detail: `Target minimal 0.5% (≈${Math.max(1, Math.round(wordCount * 0.005))} kali)`,
      });
    } else {
      checks.push({
        id: 'density',
        label: 'Kepadatan kata kunci',
        status: 'fail',
        message: 'Kata kunci belum digunakan di konten',
      });
    }
  }

  // ── 8. Content length ────────────────────────────────────────
  if (wordCount >= 1000) {
    checks.push({
      id: 'contentLength',
      label: 'Panjang konten',
      status: 'pass',
      message: `${wordCount} kata — sangat baik untuk SEO`,
    });
  } else if (wordCount >= 500) {
    checks.push({
      id: 'contentLength',
      label: 'Panjang konten',
      status: 'warning',
      message: `${wordCount} kata — cukup, usahakan minimal 1.000 kata`,
    });
  } else if (wordCount > 0) {
    checks.push({
      id: 'contentLength',
      label: 'Panjang konten',
      status: 'fail',
      message: `${wordCount} kata — terlalu pendek, minimal 500 kata`,
    });
  }

  // ── 9. Image alt texts ───────────────────────────────────────
  const imageAlts = extractImageAltTexts(contentHtml);
  const imagesWithAlt = imageAlts.filter((a) => a.trim().length > 0).length;
  const totalImages = imageAlts.length;
  if (totalImages === 0) {
    checks.push({
      id: 'imageAlt',
      label: 'Alt text gambar',
      status: 'warning',
      message: 'Tidak ada gambar di konten — tambahkan gambar untuk SEO',
    });
  } else if (imagesWithAlt === totalImages) {
    checks.push({
      id: 'imageAlt',
      label: 'Alt text gambar',
      status: 'pass',
      message: `Semua ${totalImages} gambar memiliki alt text`,
    });
  } else {
    const missing = totalImages - imagesWithAlt;
    checks.push({
      id: 'imageAlt',
      label: 'Alt text gambar',
      status: 'fail',
      message: `${missing} dari ${totalImages} gambar tidak memiliki alt text`,
    });
  }

  // ── Calculate score ──────────────────────────────────────────
  const passed = checks.filter((c) => c.status === 'pass').length;
  const warned = checks.filter((c) => c.status === 'warning').length;
  const total = checks.length;
  const score = total > 0 ? Math.round((passed / total) * 80 + (warned / total) * 10) + 10 : 0;
  // With keyword bonus: if keyword provided, boost can reach 100
  const finalScore = keyword ? Math.min(100, score + 10) : Math.min(70, score);

  return {
    score: Math.max(0, Math.min(100, finalScore)),
    checks,
    keywordDensity,
    keywordCount,
    wordCount,
  };
}

// ── Readability check ─────────────────────────────────────────

export function checkReadability(contentHtml: string): ReadabilityResult {
  const text = stripHtml(contentHtml).trim();
  if (!text) {
    return {
      score: 0,
      label: 'Tidak ada konten',
      level: 'hard',
      avgSentenceLength: 0,
      avgParagraphLength: 0,
      longSentences: 0,
      longParagraphs: 0,
    };
  }

  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  const sentenceLengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const paragraphLengths = paragraphs.map((p) => p.split(/\s+/).filter(Boolean).length);

  const avgSentenceLength =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
      : 0;

  const avgParagraphLength =
    paragraphLengths.length > 0
      ? paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length
      : 0;

  const longSentences = sentenceLengths.filter((l) => l > 25).length;
  const longParagraphs = paragraphLengths.filter((l) => l > 100).length;

  // Simplified scoring (0-100, higher = more readable)
  let score = 100;
  score -= Math.max(0, avgSentenceLength - 15) * 2; // Penalize long avg sentences
  score -= Math.max(0, avgParagraphLength - 50) * 0.3; // Penalize long avg paragraphs
  score -= longSentences * 3; // Penalize each long sentence
  score -= longParagraphs * 2; // Penalize each long paragraph
  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: string;
  let level: 'easy' | 'medium' | 'hard';

  if (score >= 70) {
    label = 'Mudah dibaca';
    level = 'easy';
  } else if (score >= 40) {
    label = 'Cukup mudah dibaca';
    level = 'medium';
  } else {
    label = 'Sulit dibaca';
    level = 'hard';
  }

  return {
    score,
    label,
    level,
    avgSentenceLength,
    avgParagraphLength,
    longSentences,
    longParagraphs,
  };
}

// ── Snippet preview helpers ────────────────────────────────────

export function getSnippetPreview(
  metaTitle: string,
  metaDescription: string,
  url: string,
): SnippetPreviewData {
  const TITLE_MAX = 60;
  const DESC_MAX = 160;

  return {
    title: metaTitle || '(Meta title akan tampil di sini)',
    description: metaDescription || '(Meta description akan tampil di sini)',
    url: url || 'https://spesialis.id/...',
    titleTooLong: metaTitle.length > TITLE_MAX,
    descriptionTooLong: metaDescription.length > DESC_MAX,
  };
}

// ── Utility ────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getScoreColor(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Sangat Baik';
  if (score >= 60) return 'Baik';
  if (score >= 40) return 'Perlu Perbaikan';
  if (score >= 20) return 'Kurang';
  return 'Buruk';
}
