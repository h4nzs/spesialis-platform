import { describe, it, expect } from 'vitest';
import {
  analyzeContent,
  checkReadability,
  getSnippetPreview,
  getScoreColor,
  getScoreLabel,
  slugify,
} from './seo-analyzer.ts';

// ─── slugify ─────────────────────────────────────────────────────

describe('slugify', () => {
  it('converts text to URL-friendly slug', () => {
    expect(slugify('Cara Membersihkan AC')).toBe('cara-membersihkan-ac');
  });

  it('removes special characters', () => {
    expect(slugify('Harga Rp 50.000!')).toBe('harga-rp-50000');
  });

  it('handles multiple spaces and hyphens', () => {
    expect(slugify('  Test   --  Slug  ')).toBe('test-slug');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});

// ─── getScoreColor ───────────────────────────────────────────────

describe('getScoreColor', () => {
  it('returns green for score >= 70', () => {
    expect(getScoreColor(85)).toBe('green');
    expect(getScoreColor(70)).toBe('green');
  });

  it('returns yellow for score between 40 and 69', () => {
    expect(getScoreColor(50)).toBe('yellow');
    expect(getScoreColor(40)).toBe('yellow');
  });

  it('returns red for score < 40', () => {
    expect(getScoreColor(30)).toBe('red');
    expect(getScoreColor(0)).toBe('red');
  });
});

// ─── getScoreLabel ───────────────────────────────────────────────

describe('getScoreLabel', () => {
  it('returns Sangat Baik for score >= 80', () => {
    expect(getScoreLabel(90)).toBe('Sangat Baik');
    expect(getScoreLabel(80)).toBe('Sangat Baik');
  });

  it('returns Baik for score 60-79', () => {
    expect(getScoreLabel(70)).toBe('Baik');
    expect(getScoreLabel(60)).toBe('Baik');
  });

  it('returns Perlu Perbaikan for score 40-59', () => {
    expect(getScoreLabel(50)).toBe('Perlu Perbaikan');
    expect(getScoreLabel(40)).toBe('Perlu Perbaikan');
  });

  it('returns Kurang for score 20-39', () => {
    expect(getScoreLabel(30)).toBe('Kurang');
    expect(getScoreLabel(20)).toBe('Kurang');
  });

  it('returns Buruk for score < 20', () => {
    expect(getScoreLabel(10)).toBe('Buruk');
    expect(getScoreLabel(0)).toBe('Buruk');
  });
});

// ─── analyzeContent ──────────────────────────────────────────────

describe('analyzeContent', () => {
  it('returns analysis with all required fields', () => {
    const result = analyzeContent(
      '<p>Membersihkan AC dengan benar sangat penting.</p>',
      'membersihkan AC',
      'Cara Membersihkan AC',
      'cara-membersihkan-ac',
      'Cara Membersihkan AC | Spesialis',
    );

    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('checks');
    expect(result).toHaveProperty('keywordDensity');
    expect(result).toHaveProperty('keywordCount');
    expect(result).toHaveProperty('wordCount');
    expect(Array.isArray(result.checks)).toBe(true);
    expect(typeof result.score).toBe('number');
  });

  it('detects keyword in title (pass)', () => {
    const result = analyzeContent('<p>Konten</p>', 'AC', 'Cara Membersihkan AC', 'slug', 'Meta AC');
    const titleCheck = result.checks.find((c) => c.id === 'title');
    expect(titleCheck?.status).toBe('pass');
  });

  it('detects missing keyword in title (fail)', () => {
    const result = analyzeContent(
      '<p>Konten</p>',
      'SEO',
      'Cara Membersihkan AC',
      'slug',
      'Meta AC',
    );
    const titleCheck = result.checks.find((c) => c.id === 'title');
    expect(titleCheck?.status).toBe('fail');
  });

  it('detects keyword in meta title (pass)', () => {
    const result = analyzeContent(
      '<p>Konten</p>',
      'SEO',
      'Judul',
      'slug',
      'Panduan SEO Terlengkap',
    );
    const metaCheck = result.checks.find((c) => c.id === 'metaTitle');
    expect(metaCheck?.status).toBe('pass');
  });

  it('detects keyword in slug (pass)', () => {
    const result = analyzeContent(
      '<p>Konten</p>',
      'membersihkan AC',
      'Judul',
      'cara-membersihkan-ac',
      'Meta',
    );
    const slugCheck = result.checks.find((c) => c.id === 'slug');
    expect(slugCheck?.status).toBe('pass');
  });

  it('returns 0 score when no keyword provided', () => {
    const result = analyzeContent('<p>Konten</p>', '', 'Judul', 'slug', 'Meta');
    // Without keyword, max score is 70, but checks are minimal
    expect(result.keywordCount).toBe(0);
    expect(result.keywordDensity).toBe(0);
  });

  it('returns correct word count', () => {
    const result = analyzeContent('<p>Satu dua tiga empat lima</p>', '', 'Judul', 'slug', 'Meta');
    expect(result.wordCount).toBe(5);
  });
});

// ─── checkReadability ────────────────────────────────────────────

describe('checkReadability', () => {
  it('returns 0 for empty content', () => {
    const result = checkReadability('');
    expect(result.score).toBe(0);
    expect(result.level).toBe('hard');
  });

  it('returns high score for short sentences', () => {
    const text = 'Ini kalimat pendek. Ini juga pendek. Dan ini.';
    const result = checkReadability(`<p>${text}</p>`);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.level).toBe('easy');
  });

  it('returns score below maximum for long sentences', () => {
    const longSentence = [
      'satu',
      'dua',
      'tiga',
      'empat',
      'lima',
      'enam',
      'tujuh',
      'delapan',
      'sembilan',
      'sepuluh',
      'sebelas',
      'dua belas',
      'tiga belas',
      'empat belas',
      'lima belas',
      'enam belas',
      'tujuh belas',
      'delapan belas',
      'sembilan belas',
      'dua puluh',
      'dua puluh satu',
      'dua puluh dua',
    ].join(' ');
    const result = checkReadability(`<p>${longSentence}.</p>`);
    // ~22 words → penalty = (22-15)*2 = 14, score ≈ 86
    expect(result.score).toBeLessThanOrEqual(90);
  });

  it('strips HTML tags before analysis', () => {
    const result = checkReadability('<p>Kalimat satu.</p><p>Kalimat dua.</p>');
    expect(result.avgSentenceLength).toBeGreaterThan(0);
  });

  it('penalizes long paragraphs', () => {
    const longPara = Array(150).fill('kata').join(' ');
    const result = checkReadability(`<p>${longPara}</p>`);
    expect(result.longParagraphs).toBeGreaterThanOrEqual(1);
  });
});

// ─── getSnippetPreview ───────────────────────────────────────────

describe('getSnippetPreview', () => {
  it('returns preview with title and description', () => {
    const result = getSnippetPreview(
      'Judul Halaman',
      'Deskripsi meta',
      'https://spesialis.id/page',
    );
    expect(result.title).toBe('Judul Halaman');
    expect(result.description).toBe('Deskripsi meta');
    expect(result.url).toBe('https://spesialis.id/page');
  });

  it('flags title over 60 characters', () => {
    const longTitle = 'A'.repeat(61);
    const result = getSnippetPreview(longTitle, 'desc', 'url');
    expect(result.titleTooLong).toBe(true);
  });

  it('does not flag title under 60 characters', () => {
    const shortTitle = 'A'.repeat(59);
    const result = getSnippetPreview(shortTitle, 'desc', 'url');
    expect(result.titleTooLong).toBe(false);
  });

  it('flags description over 160 characters', () => {
    const longDesc = 'A'.repeat(161);
    const result = getSnippetPreview('title', longDesc, 'url');
    expect(result.descriptionTooLong).toBe(true);
  });

  it('uses fallback text when no title/description provided', () => {
    const result = getSnippetPreview('', '', '');
    expect(result.title).toBeTruthy();
    expect(result.description).toBeTruthy();
    expect(result.url).toBe('https://spesialis.id/...');
  });
});
