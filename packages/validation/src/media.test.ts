import { describe, it, expect } from 'vitest';
import { uploadMediaSchema } from './media.ts';

describe('uploadMediaSchema', () => {
  const validMedia = {
    filename: 'photo.jpg',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    size: 1024 * 1024, // 1MB
  };

  it('accepts valid media upload', () => {
    const result = uploadMediaSchema.safeParse(validMedia);
    expect(result.success).toBe(true);
  });

  it('accepts with optional width and height', () => {
    const result = uploadMediaSchema.safeParse({
      ...validMedia,
      width: 1920,
      height: 1080,
    });
    expect(result.success).toBe(true);
  });

  it('coerces string size to number', () => {
    const result = uploadMediaSchema.safeParse({
      ...validMedia,
      size: '2048',
    });
    expect(result.success).toBe(true);
  });

  // ── MimeType regex tests ──

  it('accepts common mime types', () => {
    const mimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'video/mp4',
      'text/plain',
    ];
    for (const mime of mimes) {
      const result = uploadMediaSchema.safeParse({ ...validMedia, mimeType: mime });
      expect(result.success).toBe(true);
    }
  });

  it('rejects mimeType without slash', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, mimeType: 'image' });
    expect(result.success).toBe(false);
  });

  it('rejects mimeType with uppercase', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, mimeType: 'Image/JPEG' });
    expect(result.success).toBe(false);
  });

  it('rejects mimeType with invalid format', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, mimeType: 'image/jp eg' });
    expect(result.success).toBe(false);
  });

  // ── Extension tests ──

  it('rejects empty extension', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, extension: '' });
    expect(result.success).toBe(false);
  });

  it('rejects extension exceeding 10 chars', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, extension: 'x'.repeat(11) });
    expect(result.success).toBe(false);
  });

  // ── Filename tests ──

  it('rejects empty filename', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, filename: '' });
    expect(result.success).toBe(false);
  });

  it('rejects filename exceeding 255 chars', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, filename: 'x'.repeat(256) });
    expect(result.success).toBe(false);
  });

  // ── Size tests ──

  it('rejects size 0', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, size: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects size exceeding 50MB', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, size: 50 * 1024 * 1024 + 1 });
    expect(result.success).toBe(false);
  });

  it('accepts exactly 50MB', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, size: 50 * 1024 * 1024 });
    expect(result.success).toBe(true);
  });

  it('rejects negative size', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, size: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer size', () => {
    const result = uploadMediaSchema.safeParse({ ...validMedia, size: 1024.5 });
    expect(result.success).toBe(false);
  });

  // ── Width/Height tests ──

  it('rejects negative width', () => {
    const result = uploadMediaSchema.safeParse({
      ...validMedia,
      width: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-integer height', () => {
    const result = uploadMediaSchema.safeParse({
      ...validMedia,
      height: 1080.5,
    });
    expect(result.success).toBe(false);
  });

  it('accepts width 0', () => {
    const result = uploadMediaSchema.safeParse({
      ...validMedia,
      width: 0,
      height: 0,
    });
    expect(result.success).toBe(true);
  });
});
