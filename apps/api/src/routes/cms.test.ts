import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cmsRouter } from './cms.ts';
import { setTestEnv } from '../test-utils.ts';
import type { CmsFaqItem, CmsArticle, CmsHomepageSection, CmsPage } from '../lib/cms.ts';

const mockCms = vi.hoisted(() => ({
  faq: { list: vi.fn() },
  articles: { list: vi.fn(), bySlug: vi.fn() },
  homepageSections: { list: vi.fn() },
  pages: { bySlug: vi.fn() },
}));

vi.mock('../lib/cms.ts', () => ({ cms: mockCms }));

function mkApp() {
  const app = new Hono();
  app.route('/api/v1/cms', cmsRouter);
  return app;
}

beforeEach(() => {
  setTestEnv();
  vi.clearAllMocks();
});

describe('GET /faq', () => {
  it('200 list faq from CMS', async () => {
    const mockData: CmsFaqItem[] = [
      {
        id: 'f1',
        question: 'Apa itu Spesialis?',
        answer: 'Platform jasa profesional.',
        category: 'Umum',
        sort: 1,
      },
    ];
    mockCms.faq.list.mockResolvedValue(mockData);

    const res = await mkApp().request('/api/v1/cms/faq');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].question).toBe('Apa itu Spesialis?');
  });

  it('200 empty array on CMS error', async () => {
    mockCms.faq.list.mockRejectedValue(new Error('CMS unreachable'));

    const res = await mkApp().request('/api/v1/cms/faq');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });
});

describe('GET /articles', () => {
  it('200 list articles from CMS', async () => {
    const mockData: CmsArticle[] = [
      {
        id: 'a1',
        title: 'Article 1',
        slug: 'article-1',
        summary: null,
        content: null,
        cover_image: null,
        category: null,
        tags: null,
        author: null,
        published_at: null,
        status: 'published',
      },
    ];
    mockCms.articles.list.mockResolvedValue(mockData);

    const res = await mkApp().request('/api/v1/cms/articles');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toHaveLength(1);
  });

  it('200 empty array on CMS error', async () => {
    mockCms.articles.list.mockRejectedValue(new Error('CMS unreachable'));

    const res = await mkApp().request('/api/v1/cms/articles');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });
});

describe('GET /articles/:slug', () => {
  it('200 found in CMS', async () => {
    const mockData: CmsArticle[] = [
      {
        id: 'a1',
        title: 'Article 1',
        slug: 'article-1',
        summary: null,
        content: null,
        cover_image: null,
        category: null,
        tags: null,
        author: null,
        published_at: null,
        status: 'published',
      },
    ];
    mockCms.articles.bySlug.mockResolvedValue(mockData);

    const res = await mkApp().request('/api/v1/cms/articles/article-1');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).not.toBeNull();
    expect(body.data.slug).toBe('article-1');
  });

  it('200 null on not found', async () => {
    mockCms.articles.bySlug.mockResolvedValue([]);

    const res = await mkApp().request('/api/v1/cms/articles/unknown');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toBeNull();
  });

  it('200 null on CMS error', async () => {
    mockCms.articles.bySlug.mockRejectedValue(new Error('CMS unreachable'));

    const res = await mkApp().request('/api/v1/cms/articles/article-1');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toBeNull();
  });
});

describe('GET /homepage-sections', () => {
  it('200 returns sections from CMS', async () => {
    const mockData: CmsHomepageSection[] = [
      {
        id: 's1',
        section_type: 'hero',
        title: 'Hero Title',
        content: 'Hero content',
        image: null,
        sort_order: 1,
        is_active: true,
      },
    ];
    mockCms.homepageSections.list.mockResolvedValue(mockData);

    const res = await mkApp().request('/api/v1/cms/homepage-sections');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.data[0].section_type).toBe('hero');
  });

  it('200 returns fallback sections when CMS returns empty', async () => {
    mockCms.homepageSections.list.mockResolvedValue([]);

    const res = await mkApp().request('/api/v1/cms/homepage-sections');
    expect(res.status).toBe(200);
    const body = await res.json();
    // Should return fallback sections (hero, services, why-us, stats, cta)
    expect(body.data.length).toBeGreaterThanOrEqual(5);
    expect(body.data[0].section_type).toBe('hero');
  });

  it('200 returns fallback sections on CMS error', async () => {
    mockCms.homepageSections.list.mockRejectedValue(new Error('CMS unreachable'));

    const res = await mkApp().request('/api/v1/cms/homepage-sections');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBeGreaterThanOrEqual(5);
    expect(body.data.map((s: CmsHomepageSection) => s.section_type)).toContain('hero');
    expect(body.data.map((s: CmsHomepageSection) => s.section_type)).toContain('cta');
  });
});

describe('GET /pages/:slug', () => {
  it('200 returns page from CMS', async () => {
    const mockData: CmsPage[] = [
      { id: 'p1', title: 'About Us', slug: 'about', content: '# About', meta: null },
    ];
    mockCms.pages.bySlug.mockResolvedValue(mockData);

    const res = await mkApp().request('/api/v1/cms/pages/about');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).not.toBeNull();
    expect(body.data.slug).toBe('about');
  });

  it('200 returns fallback for known page when CMS empty', async () => {
    mockCms.pages.bySlug.mockResolvedValue([]);

    const res = await mkApp().request('/api/v1/cms/pages/tentang-kami');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).not.toBeNull();
    expect(body.data.slug).toBe('tentang-kami');
    expect(body.data.title).toBe('Tentang Kami');
  });

  it('200 returns null for unknown page when CMS empty', async () => {
    mockCms.pages.bySlug.mockResolvedValue([]);

    const res = await mkApp().request('/api/v1/cms/pages/unknown-page');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toBeNull();
  });

  it('200 returns fallback on CMS error for known page', async () => {
    mockCms.pages.bySlug.mockRejectedValue(new Error('CMS unreachable'));

    const res = await mkApp().request('/api/v1/cms/pages/kebijakan-privasi');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).not.toBeNull();
    expect(body.data.slug).toBe('kebijakan-privasi');
  });

  it('200 returns null on CMS error for unknown page', async () => {
    mockCms.pages.bySlug.mockRejectedValue(new Error('CMS unreachable'));

    const res = await mkApp().request('/api/v1/cms/pages/unknown-page');
    expect(res.status).toBe(200);
    expect((await res.json()).data).toBeNull();
  });
});
