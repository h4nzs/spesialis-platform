import { describe, it, expect } from 'vitest';
import { getMarkdownForPath } from './markdown-agent';

describe('getMarkdownForPath', () => {
  it('mengembalikan markdown untuk root path (/)', () => {
    const result = getMarkdownForPath('/');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# Ahli Panggilan');
    expect(result!.content).toContain('https://ahlipanggilan.id/book');
    expect(result!.content).toContain('Service Categories');
    expect(result!.tokenCount).toBeGreaterThan(0);
  });

  it('mengembalikan markdown untuk /faq', () => {
    const result = getMarkdownForPath('/faq');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# FAQ');
    expect(result!.content).toContain('Bagaimana cara booking');
    expect(result!.content).toContain('garansi kepuasan');
    expect(result!.tokenCount).toBeGreaterThan(0);
  });

  it('mengembalikan markdown untuk /services', () => {
    const result = getMarkdownForPath('/services');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# Layanan Ahli Panggilan');
    expect(result!.content).toContain('Perawatan AC');
    expect(result!.content).toContain('Booking Sekarang');
  });

  it('mengembalikan markdown untuk /blog', () => {
    const result = getMarkdownForPath('/blog');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# Blog Ahli Panggilan');
    expect(result!.content).toContain('perawatan rumah');
  });

  it('mengembalikan markdown untuk /corporate', () => {
    const result = getMarkdownForPath('/corporate');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# Layanan Corporate');
    expect(result!.content).toContain('Maintenance Rutin');
  });

  it('mengembalikan markdown untuk /partner', () => {
    const result = getMarkdownForPath('/partner');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# Program Mitra');
    expect(result!.content).toContain('Pendaftaran gratis');
  });

  it('mengembalikan markdown untuk /book', () => {
    const result = getMarkdownForPath('/book');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# Booking Layanan');
    expect(result!.content).toContain('Guest booking tersedia');
  });

  it('mengembalikan markdown untuk /tracking', () => {
    const result = getMarkdownForPath('/tracking');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# Lacak Pesanan');
    expect(result!.content).toContain('SP-XXXXX');
  });

  it('mengembalikan markdown untuk /tentang-kami', () => {
    const result = getMarkdownForPath('/tentang-kami');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# Tentang Ahli Panggilan');
  });

  it('mengembalikan markdown untuk /kontak', () => {
    const result = getMarkdownForPath('/kontak');
    expect(result).not.toBeNull();
    expect(result!.content).toContain('# Kontak Ahli Panggilan');
    expect(result!.content).toContain('hello@ahlipanggilan.id');
  });

  it('mengembalikan null untuk path yang tidak dikenal', () => {
    expect(getMarkdownForPath('/dashboard')).toBeNull();
    expect(getMarkdownForPath('/api/v1/services')).toBeNull();
    expect(getMarkdownForPath('/nonexistent-page')).toBeNull();
    expect(getMarkdownForPath('/login')).toBeNull();
  });

  it('handles trailing slash normalization', () => {
    const withSlash = getMarkdownForPath('/faq/');
    const withoutSlash = getMarkdownForPath('/faq');
    expect(withSlash).toEqual(withoutSlash);
    expect(withSlash!.content).toContain('# FAQ');
  });

  it('mengembalikan token count yang valid', () => {
    const root = getMarkdownForPath('/');
    expect(root!.tokenCount).toBeGreaterThan(0);
    expect(Number.isInteger(root!.tokenCount)).toBe(true);

    const faq = getMarkdownForPath('/faq');
    expect(faq!.tokenCount).toBeGreaterThan(0);

    // FAQ should have fewer tokens than homepage
    expect(faq!.tokenCount).toBeLessThan(root!.tokenCount);
  });

  it('setiap markdown mengandung link ke halaman asli', () => {
    const pages = ['/', '/faq', '/services', '/blog', '/partner', '/book', '/tracking'];
    for (const page of pages) {
      const result = getMarkdownForPath(page);
      expect(result).not.toBeNull();
      // Should contain a link back to the original page
      expect(result!.content).toContain('ahlipanggilan.id');
      expect(result!.content).toContain(`[`);
    }
  });
});
