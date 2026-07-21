import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeChain } from '../test-utils.ts';

// ── Mocks ───────────────────────────────────────────────────────

const { mockDb, em } = vi.hoisted(() => {
  const db = {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  };
  const exps = (globalThis as Record<string, unknown>).__TABLE_EXPORTS as Record<string, unknown>;
  return { mockDb: db, em: exps };
});

vi.mock('./db.ts', () => ({ db: mockDb, ...em }));

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════
// extractLinks — pure function, no mocking needed
// ═══════════════════════════════════════════════════════════════════

describe('extractLinks', () => {
  it('extracts double-quoted href with text', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<a href="/blog/panduan-ac">Panduan AC Lengkap</a>';
    const result = extractLinks(html);
    expect(result).toEqual([{ href: '/blog/panduan-ac', text: 'Panduan AC Lengkap' }]);
  });

  it('extracts single-quoted href', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = "<a href='/blog/tips-ac'>Tips AC Irit</a>";
    const result = extractLinks(html);
    expect(result).toEqual([{ href: '/blog/tips-ac', text: 'Tips AC Irit' }]);
  });

  it('extracts unquoted href', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<a href=/blog/merawat-ac>Merawat AC</a>';
    const result = extractLinks(html);
    expect(result).toEqual([{ href: '/blog/merawat-ac', text: 'Merawat AC' }]);
  });

  it('extracts full URL href', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<a href="https://ahlipanggilan.id/blog/panduan-ac">Panduan AC</a>';
    const result = extractLinks(html);
    expect(result).toEqual([
      { href: 'https://ahlipanggilan.id/blog/panduan-ac', text: 'Panduan AC' },
    ]);
  });

  it('strips nested HTML tags from anchor text', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<a href="/blog/ac"><strong>AC</strong> <em>Lengkap</em></a>';
    const result = extractLinks(html);
    expect(result).toEqual([{ href: '/blog/ac', text: 'AC Lengkap' }]);
  });

  it('ignores empty href attributes', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<a href="">text</a>';
    const result = extractLinks(html);
    expect(result).toEqual([]);
  });

  it('ignores anchors without href', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<a name="top">Jump to top</a>';
    const result = extractLinks(html);
    expect(result).toEqual([]);
  });

  it('extracts multiple links from same HTML', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<p>Lihat <a href="/blog/ac">AC</a> dan <a href="/blog/listrik">Listrik</a></p>';
    const result = extractLinks(html);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ href: '/blog/ac', text: 'AC' });
    expect(result[1]).toEqual({ href: '/blog/listrik', text: 'Listrik' });
  });

  it('handles href with trailing attributes', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<a href="/blog/ac" class="btn" rel="noopener">Baca AC</a>';
    const result = extractLinks(html);
    expect(result).toEqual([{ href: '/blog/ac', text: 'Baca AC' }]);
  });

  it('handles href with single quotes and trailing attributes', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = "<a href='/blog/ac' class='btn' rel='noopener'>Baca AC</a>";
    const result = extractLinks(html);
    expect(result).toEqual([{ href: '/blog/ac', text: 'Baca AC' }]);
  });

  it('handles whitespace around equals sign', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<a href = "/blog/ac" >Baca AC</a>';
    const result = extractLinks(html);
    expect(result).toEqual([{ href: '/blog/ac', text: 'Baca AC' }]);
  });

  it('returns empty array for HTML without links', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const html = '<p>Just a paragraph without any anchor tags.</p>';
    const result = extractLinks(html);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty string', async () => {
    const { extractLinks } = await import('./article-links.ts');
    const result = extractLinks('');
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// resolveBlogSlug — pure function, no mocking needed
// ═══════════════════════════════════════════════════════════════════

describe('resolveBlogSlug', () => {
  it('extracts slug from relative /blog/ path', async () => {
    const { resolveBlogSlug } = await import('./article-links.ts');
    expect(resolveBlogSlug('/blog/panduan-ac-lengkap')).toBe('panduan-ac-lengkap');
  });

  it('extracts slug from full URL', async () => {
    const { resolveBlogSlug } = await import('./article-links.ts');
    expect(resolveBlogSlug('https://ahlipanggilan.id/blog/tips-ac-irit')).toBe('tips-ac-irit');
  });

  it('extracts slug from URL with trailing slash', async () => {
    const { resolveBlogSlug } = await import('./article-links.ts');
    expect(resolveBlogSlug('https://ahlipanggilan.id/blog/ac/')).toBe('ac');
  });

  it('returns null for non-blog URL', async () => {
    const { resolveBlogSlug } = await import('./article-links.ts');
    expect(resolveBlogSlug('/services/ac')).toBeNull();
  });

  it('returns null for external non-blog URL', async () => {
    const { resolveBlogSlug } = await import('./article-links.ts');
    expect(resolveBlogSlug('https://example.com/other')).toBeNull();
  });

  it('returns null for anchor-only href', async () => {
    const { resolveBlogSlug } = await import('./article-links.ts');
    expect(resolveBlogSlug('#section-1')).toBeNull();
  });

  it('returns null for empty string', async () => {
    const { resolveBlogSlug } = await import('./article-links.ts');
    expect(resolveBlogSlug('')).toBeNull();
  });

  it('extracts slug with hyphens and numbers', async () => {
    const { resolveBlogSlug } = await import('./article-links.ts');
    expect(resolveBlogSlug('/blog/cara-memperbaiki-ac-2026')).toBe('cara-memperbaiki-ac-2026');
  });
});

// ═══════════════════════════════════════════════════════════════════
// populateArticleLinks — needs DB mocking
// ═══════════════════════════════════════════════════════════════════

describe('populateArticleLinks', () => {
  beforeEach(() => {
    // Default: delete returns void resolve
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('inserts links when article has blog links in content', async () => {
    // Mock: fetch article → found with content
    mockDb.select.mockReturnValueOnce(
      makeChain([
        { id: 'article-1', content: '<p><a href="/blog/pillar-ac">Baca Panduan AC</a></p>' },
      ]),
    );
    // Mock: lookup target articles → found
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pillar-1', slug: 'pillar-ac' }]));

    // Mock: insert returns successfully
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    const { populateArticleLinks } = await import('./article-links.ts');
    await populateArticleLinks('article-1');

    // Should delete existing links for this source
    expect(mockDb.delete).toHaveBeenCalled();

    // Should insert new link
    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('skips insert when content has no blog links', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([{ id: 'article-1', content: '<p><a href="/services/ac">Lihat Service</a></p>' }]),
    );

    const { populateArticleLinks } = await import('./article-links.ts');
    await populateArticleLinks('article-1');

    // Should delete existing links (cleanup)
    expect(mockDb.delete).toHaveBeenCalled();
    // Should NOT insert anything
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('skips insert when content is empty', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'article-1', content: '' }]));

    const { populateArticleLinks } = await import('./article-links.ts');
    await populateArticleLinks('article-1');

    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('skips insert when content is null', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'article-1', content: null }]));

    const { populateArticleLinks } = await import('./article-links.ts');
    await populateArticleLinks('article-1');

    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('cleans up stale links when article is not found', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));

    const { populateArticleLinks } = await import('./article-links.ts');
    await populateArticleLinks('nonexistent-id');

    // Should delete stale links (cleanup) but not insert new ones
    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('skips self-link (article linking to itself)', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'article-1',
          content: '<p><a href="/blog/same-article">Link ke diri sendiri</a></p>',
        },
      ]),
    );
    // Target lookup should exclude self → empty result
    mockDb.select.mockReturnValueOnce(makeChain([]));

    const { populateArticleLinks } = await import('./article-links.ts');
    await populateArticleLinks('article-1');

    // Should delete (cleanup) but not insert
    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('handles multiple links to different targets', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'article-1',
          content:
            '<p><a href="/blog/pillar-ac">AC</a> dan <a href="/blog/pillar-listrik">Listrik</a></p>',
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(
      makeChain([
        { id: 'pillar-1', slug: 'pillar-ac' },
        { id: 'pillar-2', slug: 'pillar-listrik' },
      ]),
    );

    let insertCount = 0;
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockImplementation(() => {
        insertCount++;
        return Promise.resolve(undefined);
      }),
    });

    const { populateArticleLinks } = await import('./article-links.ts');
    await populateArticleLinks('article-1');

    expect(insertCount).toBe(2);
    expect(mockDb.delete).toHaveBeenCalledTimes(1);
  });

  it('does not fail when unique constraint violation occurs', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'article-1',
          content: '<p><a href="/blog/pillar-ac">Baca AC</a></p>',
        },
      ]),
    );
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pillar-1', slug: 'pillar-ac' }]));

    // Simulate unique constraint violation
    mockDb.insert.mockReturnValueOnce({
      values: vi
        .fn()
        .mockRejectedValue(new Error('duplicate key value violates unique constraint')),
    });

    const { populateArticleLinks } = await import('./article-links.ts');
    // Should not throw — try/catch handles it silently
    await expect(populateArticleLinks('article-1')).resolves.toBeUndefined();
  });

  it('cleans up stale links when article is soft-deleted', async () => {
    // Soft-deleted article filtered out by isNull(deletedAt) → select returns []
    mockDb.select.mockReturnValueOnce(makeChain([]));

    const { populateArticleLinks } = await import('./article-links.ts');
    await populateArticleLinks('deleted-article');

    // Should delete stale links as cleanup, but not insert new ones
    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  it('skips insert when no valid targets resolved from slugs', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'article-1',
          content: '<p><a href="/blog/nonexistent-pillar">Baca</a></p>',
        },
      ]),
    );
    // No matching articles found for the slug
    mockDb.select.mockReturnValueOnce(makeChain([]));

    const { populateArticleLinks } = await import('./article-links.ts');
    await populateArticleLinks('article-1');

    expect(mockDb.delete).toHaveBeenCalled();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════
// rebuildAllArticleLinks — needs DB mocking
// ═══════════════════════════════════════════════════════════════════

describe('rebuildAllArticleLinks', () => {
  beforeEach(() => {
    mockDb.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('returns zero counts when no articles exist', async () => {
    mockDb.select.mockReturnValueOnce(makeChain([]));

    const { rebuildAllArticleLinks } = await import('./article-links.ts');
    const result = await rebuildAllArticleLinks();

    expect(result).toEqual({ articlesProcessed: 0, totalLinksCreated: 0 });
    // Should delete all first
    expect(mockDb.delete).toHaveBeenCalled();
  });

  it('processes articles and creates links', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'article-2',
          slug: 'cluster-ac',
          content: '<p><a href="/blog/pillar-ac">Baca Panduan AC</a></p>',
        },
      ]),
    );
    // Second query (target lookup) returns pillar article
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pillar-1', slug: 'pillar-ac' }]));

    const { rebuildAllArticleLinks } = await import('./article-links.ts');
    const result = await rebuildAllArticleLinks();

    expect(result.articlesProcessed).toBe(1);
    expect(result.totalLinksCreated).toBe(1);
  });

  it('skips articles without content', async () => {
    mockDb.select.mockReturnValueOnce(
      makeChain([
        { id: 'article-1', slug: 'empty', content: null },
        { id: 'article-2', slug: 'cluster', content: '<a href="/blog/pillar">Baca</a>' },
      ]),
    );
    // Second query (target lookup for article-2)
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pillar-1', slug: 'pillar' }]));

    const { rebuildAllArticleLinks } = await import('./article-links.ts');
    const result = await rebuildAllArticleLinks();

    expect(result.articlesProcessed).toBe(2);
    expect(result.totalLinksCreated).toBe(1);
  });

  it('handles rebuild with multiple articles and multiple links', async () => {
    // First query: all articles
    mockDb.select.mockReturnValueOnce(
      makeChain([
        {
          id: 'article-1',
          slug: 'cluster-ac',
          content: '<a href="/blog/pillar-ac">AC</a> <a href="/blog/pillar-listrik">Listrik</a>',
        },
        {
          id: 'article-2',
          slug: 'tips-listrik',
          content: '<a href="/blog/pillar-listrik">Listrik</a>',
        },
      ]),
    );

    // For article-1: lookup pillar-ac and pillar-listrik
    mockDb.select.mockReturnValueOnce(
      makeChain([
        { id: 'pillar-1', slug: 'pillar-ac' },
        { id: 'pillar-2', slug: 'pillar-listrik' },
      ]),
    );

    // For article-2: lookup pillar-listrik
    mockDb.select.mockReturnValueOnce(makeChain([{ id: 'pillar-2', slug: 'pillar-listrik' }]));

    const { rebuildAllArticleLinks } = await import('./article-links.ts');
    const result = await rebuildAllArticleLinks();

    expect(result.articlesProcessed).toBe(2);
    expect(result.totalLinksCreated).toBe(3); // 2 + 1
  });
});
