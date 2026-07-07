import { describe, it, expect, vi, beforeEach } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('cms.faq', () => {
  it('list fetches FAQ items from CMS', async () => {
    const mockData = [
      { id: '1', question: 'Apa itu Spesialis?', answer: 'Platform jasa profesional.' },
    ];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockData }),
    });

    const mod = await import('./cms.ts');
    const result = await mod.cms.faq.list();

    expect(result).toEqual(mockData);
    expect((fetch as any).mock.calls[0][0]).toContain('/items/cms_faq');
  });
});

describe('cms.articles', () => {
  it('list fetches articles with default params', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: [{ id: '1', title: 'Article', slug: 'article-1', status: 'published' }],
        }),
    });

    const mod = await import('./cms.ts');
    const result = await mod.cms.articles.list();

    expect(result).toHaveLength(1);
    expect((fetch as any).mock.calls[0][0]).toContain('filter[status][_eq]=published');
  });

  it('bySlug fetches single article by slug', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ id: '2', slug: 'test-article' }] }),
    });

    const mod = await import('./cms.ts');
    const result = await mod.cms.articles.bySlug('test-article');

    expect(result).toEqual([{ id: '2', slug: 'test-article' }]);
    expect((fetch as any).mock.calls[0][0]).toContain('filter[slug][_eq]=test-article');
  });
});

describe('cms.homepageSections', () => {
  it('list fetches active homepage sections sorted by order', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          data: [{ id: '1', section_type: 'hero', is_active: true, sort_order: 1 }],
        }),
    });

    const mod = await import('./cms.ts');
    const result = await mod.cms.homepageSections.list();

    expect(result).toHaveLength(1);
    const url = (fetch as any).mock.calls[0][0] as string;
    expect(url).toContain('/items/cms_homepage_sections');
    expect(url).toContain('filter[is_active][_eq]=true');
    expect(url).toContain('sort=sort_order');
  });
});

describe('cms.pages', () => {
  it('bySlug fetches page by slug', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ data: [{ id: '1', title: 'Tentang Kami', slug: 'tentang-kami' }] }),
    });

    const mod = await import('./cms.ts');
    const result = await mod.cms.pages.bySlug('tentang-kami');

    expect(result).toEqual([{ id: '1', title: 'Tentang Kami', slug: 'tentang-kami' }]);
    expect((fetch as any).mock.calls[0][0]).toContain('filter[slug][_eq]=tentang-kami');
  });
});

describe('error handling', () => {
  it('throws on non-ok response with status code', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const mod = await import('./cms.ts');
    await expect(mod.cms.faq.list()).rejects.toThrow('CMS API error 500: Internal Server Error');
  });

  it('throws on 404 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const mod = await import('./cms.ts');
    await expect(mod.cms.pages.bySlug('nonexistent')).rejects.toThrow(
      'CMS API error 404: Not Found',
    );
  });

  it('uses default CMS_URL and CMS_TOKEN when env not set', async () => {
    delete process.env.CMS_URL;
    delete process.env.CMS_TOKEN;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    const mod = await import('./cms.ts');
    await mod.cms.faq.list();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://localhost:8055'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer specialist-setup-token',
        }),
      }),
    );
  });
});
