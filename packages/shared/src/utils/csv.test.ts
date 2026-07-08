// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { serializeCSV, downloadCSV, downloadBlob } from './csv.ts';

// ─── Pure function: serializeCSV ─────────────────────────────────

describe('serializeCSV', () => {
  it('includes BOM prefix', () => {
    const result = serializeCSV(['H'], [['v']]);
    expect(result.startsWith('\uFEFF')).toBe(true);
  });

  it('generates header and data rows', () => {
    const result = serializeCSV(
      ['Nama', 'Email'],
      [
        ['John Doe', 'john@test.com'],
        ['Jane Doe', 'jane@test.com'],
      ],
    );
    const body = result.slice(1);
    expect(body).toBe('Nama,Email\nJohn Doe,john@test.com\nJane Doe,jane@test.com');
  });

  it('quotes values containing commas', () => {
    const result = serializeCSV(['Item', 'Deskripsi'], [['Buku', 'Bagus, murah']]);
    expect(result).toContain('"Bagus, murah"');
  });

  it('escapes double quotes by doubling them', () => {
    const result = serializeCSV(['Item'], [['Kata "ajaib"']]);
    expect(result).toContain('"Kata ""ajaib"""');
  });

  it('quotes values containing newlines', () => {
    const result = serializeCSV(['Catatan'], [['Baris 1\nBaris 2']]);
    expect(result).toContain('"Baris 1\nBaris 2"');
  });

  it('returns just BOM + header when rows are empty', () => {
    const result = serializeCSV(['H1', 'H2'], []);
    const body = result.slice(1);
    expect(body).toBe('H1,H2\n');
  });

  it('handles single row', () => {
    const result = serializeCSV(['X'], [['y']]);
    const body = result.slice(1);
    expect(body).toBe('X\ny');
  });
});

// ─── Browser-only: downloadBlob ──────────────────────────────────

describe('downloadBlob', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates anchor, appends to body, clicks, removes, and revokes URL', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    downloadBlob(blob, 'hello.txt');

    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const anchor = appendChildSpy.mock.calls[0]![0] as HTMLAnchorElement;
    expect(anchor instanceof HTMLAnchorElement).toBe(true);
    expect(anchor.download).toBe('hello.txt');
    expect(anchor.href).toBe('blob:mock');

    expect(removeChildSpy).toHaveBeenCalledWith(anchor);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock');
  });

  it('no-ops gracefully when document is undefined (SSR)', () => {
    const origDoc = globalThis.document;
    (globalThis as unknown as { document: unknown }).document = undefined;

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    downloadBlob(new Blob(['test'], { type: 'text/plain' }), 'test.txt');

    expect(consoleWarn).toHaveBeenCalledWith('[downloadBlob] browser-only');
    expect(createObjectURLSpy).not.toHaveBeenCalled();

    globalThis.document = origDoc;
  });
});

// ─── Browser-only: downloadCSV (via blob metadata) ───────────────

describe('downloadCSV', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:csv');
    vi.spyOn(URL, 'revokeObjectURL');
    vi.spyOn(HTMLAnchorElement.prototype, 'click');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates blob with correct MIME type and non-zero size', () => {
    downloadCSV(['Nama'], [['John']], 'users.csv');

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectURLSpy.mock.calls[0]![0] as Blob;
    expect(blob.type).toBe('text/csv;charset=utf-8;');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('triggers the full download lifecycle', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    downloadCSV(['H'], [['v']], 'test.csv');

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const anchor = appendChildSpy.mock.calls[0]![0] as HTMLAnchorElement;
    expect(anchor.download).toBe('test.csv');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledWith(anchor);
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('no-ops gracefully when document is undefined (SSR)', () => {
    const origDoc = globalThis.document;
    (globalThis as unknown as { document: unknown }).document = undefined;

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    downloadCSV(['H'], [['1']], 'test.csv');

    expect(consoleWarn).toHaveBeenCalledWith('[CSV] downloadCSV is browser-only');
    expect(createObjectURLSpy).not.toHaveBeenCalled();

    globalThis.document = origDoc;
  });
});
