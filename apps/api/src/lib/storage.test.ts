import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs', () => ({ existsSync: vi.fn() }));
vi.mock('node:fs/promises', () => ({ writeFile: vi.fn(), mkdir: vi.fn(), unlink: vi.fn() }));

import { existsSync } from 'node:fs';
import { writeFile, mkdir, unlink } from 'node:fs/promises';

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.UPLOAD_DIR;
});

describe('isAllowedMimeType', () => {
  it('allows image/jpeg', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isAllowedMimeType('image/jpeg')).toBe(true);
  });

  it('allows image/png', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isAllowedMimeType('image/png')).toBe(true);
  });

  it('allows image/webp', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isAllowedMimeType('image/webp')).toBe(true);
  });

  it('allows application/pdf', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isAllowedMimeType('application/pdf')).toBe(true);
  });

  it('rejects text/plain', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isAllowedMimeType('text/plain')).toBe(false);
  });

  it('rejects image/gif', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isAllowedMimeType('image/gif')).toBe(false);
  });

  it('rejects empty string', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isAllowedMimeType('')).toBe(false);
  });
});

describe('isWithinSizeLimit', () => {
  it('returns true for 5 MB file', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isWithinSizeLimit(5 * 1024 * 1024)).toBe(true);
  });

  it('returns true for exactly 10 MB file', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isWithinSizeLimit(10 * 1024 * 1024)).toBe(true);
  });

  it('returns false for 11 MB file', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isWithinSizeLimit(11 * 1024 * 1024)).toBe(false);
  });

  it('returns false for zero bytes', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isWithinSizeLimit(0)).toBe(false);
  });

  it('returns true for 1 byte', async () => {
    const mod = await import('./storage.ts');
    expect(mod.isWithinSizeLimit(1)).toBe(true);
  });
});

describe('ensureUploadDir', () => {
  it('creates directory when UPLOAD_DIR does not exist', async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const mod = await import('./storage.ts');
    await mod.ensureUploadDir();

    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('skips mkdir when UPLOAD_DIR already exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true);

    const mod = await import('./storage.ts');
    await mod.ensureUploadDir();

    expect(mkdir).not.toHaveBeenCalled();
  });
});

describe('saveFile', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReturnValue(true);
  });

  it('throws for disallowed mime type', async () => {
    const mod = await import('./storage.ts');
    const file = new File(['test'], 'file.gif', { type: 'image/gif' });

    await expect(mod.saveFile(file)).rejects.toThrow('File type image/gif not allowed');
  });

  it('throws for oversized file', async () => {
    const oversized = {
      name: 'photo.jpg',
      type: 'image/jpeg',
      size: 15 * 1024 * 1024,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    } as File;

    const mod = await import('./storage.ts');
    await expect(mod.saveFile(oversized)).rejects.toThrow('File exceeds maximum size');
  });

  it('saves file and returns StoredFile with correct shape', async () => {
    const fileBuffer = new ArrayBuffer(8);
    const file = {
      name: 'profile.jpg',
      type: 'image/jpeg',
      size: 4096,
      arrayBuffer: () => Promise.resolve(fileBuffer),
    } as File;

    const mod = await import('./storage.ts');
    const result = await mod.saveFile(file);

    expect(result).toHaveProperty('filename');
    expect(result).toHaveProperty('originalName', 'profile.jpg');
    expect(result).toHaveProperty('mimeType', 'image/jpeg');
    expect(result).toHaveProperty('extension', 'jpg');
    expect(result).toHaveProperty('size', 4096);
    expect(result).toHaveProperty('path');
    expect(result.path).toContain(result.filename);
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining(result.filename),
      expect.any(Buffer),
    );
  });

  it('handles file with no extension', async () => {
    const fileBuffer = new ArrayBuffer(4);
    const file = {
      name: 'noext',
      type: 'application/pdf',
      size: 256,
      arrayBuffer: () => Promise.resolve(fileBuffer),
    } as File;

    const mod = await import('./storage.ts');
    const result = await mod.saveFile(file);

    expect(result.extension).toBe('');
    expect(result.originalName).toBe('noext');
  });
});

describe('deleteFile', () => {
  it('calls unlink with the given path', async () => {
    const mod = await import('./storage.ts');
    await mod.deleteFile('/tmp/uploads/test.pdf');

    expect(unlink).toHaveBeenCalledWith('/tmp/uploads/test.pdf');
  });

  it('does not throw when unlink fails', async () => {
    vi.mocked(unlink).mockRejectedValue(new Error('ENOENT'));

    const mod = await import('./storage.ts');
    await expect(mod.deleteFile('/tmp/uploads/missing.pdf')).resolves.toBeUndefined();
  });
});
