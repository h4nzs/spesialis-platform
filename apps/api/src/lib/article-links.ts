import { and, eq, isNull, inArray, ne } from 'drizzle-orm';
import { db, articles, articleLinks } from './db.ts';

/**
 * Extract all <a href="...">text</a> from HTML content.
 *
 * Supports:
 * - Double-quoted href:  `<a href="/blog/foo">text</a>`
 * - Single-quoted href:  `<a href='/blog/foo'>text</a>`
 * - Unquoted href:       `<a href=/blog/foo>text</a>`
 */
export function extractLinks(html: string): { href: string; text: string }[] {
  const links: { href: string; text: string }[] = [];
  const anchorRegex =
    /<a\s+[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) !== null) {
    // Groups: 1=double-quoted, 2=single-quoted, 3=unquoted, 4=inner HTML
    const href = match[1] ?? match[2] ?? match[3] ?? '';
    const innerHtml = match[4]!;
    // Strip any HTML tags from anchor text
    const text = innerHtml.replace(/<[^>]+>/g, '').trim();
    if (href && text) {
      links.push({ href, text });
    }
  }
  return links;
}

/**
 * Resolve a href to a blog article slug.
 * Returns null if the href doesn't point to a blog article.
 */
export function resolveBlogSlug(href: string): string | null {
  // Match /blog/{slug} or full URL containing domain/blog/{slug}
  const match = href.match(/\/blog\/([a-z0-9-]+)/i);
  return match?.[1] ?? null;
}

/**
 * Populate the article_links table for a given article.
 *
 * 1. Parses the article's HTML content to find all links
 * 2. Resolves link hrefs to article slugs
 * 3. Looks up target article IDs from slugs
 * 4. Deletes existing links from this source article
 * 5. Inserts new (source_article_id, target_article_id) pairs
 *
 * This function is a no-op if:
 * - The article has no content
 * - The article is deleted
 * - No links to other articles are found
 */
export async function populateArticleLinks(articleId: string): Promise<void> {
  // Fetch the article to get its content
  const [article] = await db
    .select({ id: articles.id, content: articles.content })
    .from(articles)
    .where(and(eq(articles.id, articleId), isNull(articles.deletedAt)))
    .limit(1);

  if (!article || !article.content) {
    // No content to parse — remove any existing links
    await db.delete(articleLinks).where(eq(articleLinks.sourceArticleId, articleId));
    return;
  }

  // Extract all links from content
  const links = extractLinks(article.content);

  // Resolve hrefs to blog slugs
  const targetSlugs = new Set<string>();
  for (const link of links) {
    const slug = resolveBlogSlug(link.href);
    if (slug && slug !== '') {
      targetSlugs.add(slug);
    }
  }

  if (targetSlugs.size === 0) {
    // No blog links found — remove any existing links
    await db.delete(articleLinks).where(eq(articleLinks.sourceArticleId, articleId));
    return;
  }

  // Look up target article IDs from slugs
  const targetArticles = await db
    .select({ id: articles.id, slug: articles.slug })
    .from(articles)
    .where(
      and(
        inArray(articles.slug, Array.from(targetSlugs)),
        isNull(articles.deletedAt),
        ne(articles.id, articleId), // Exclude self-links
      ),
    );

  if (targetArticles.length === 0) {
    // No valid target articles found — remove any existing links
    await db.delete(articleLinks).where(eq(articleLinks.sourceArticleId, articleId));
    return;
  }

  // Delete existing links from this source article
  await db.delete(articleLinks).where(eq(articleLinks.sourceArticleId, articleId));

  // Insert new (source, target) pairs — unique constraint handles duplicates
  for (const target of targetArticles) {
    try {
      await db.insert(articleLinks).values({
        sourceArticleId: articleId,
        targetArticleId: target.id,
        linkType: 'internal',
      });
    } catch {
      // Silently skip duplicate (source, target) — unique constraint violation
    }
  }
}

/**
 * Rebuild the entire article_links table from all non-deleted articles.
 * Deletes all existing entries first, then re-populates from current content.
 *
 * Uses a two-pass batch approach:
 * Pass 1: Collect all unique target slugs across all articles
 * Pass 2: Single batch query to resolve slug → ID, then insert all links
 *
 * Returns the number of articles processed and total links created.
 */
export async function rebuildAllArticleLinks(): Promise<{
  articlesProcessed: number;
  totalLinksCreated: number;
}> {
  // Delete all existing article_links
  await db.delete(articleLinks);

  // Fetch all non-deleted articles with content
  const allArticles = await db
    .select({ id: articles.id, slug: articles.slug, content: articles.content })
    .from(articles)
    .where(and(isNull(articles.deletedAt), ne(articles.status, 'Archived')));

  // ── Pass 1: Collect all unique target slugs ─────────────────
  // Also build a map of articleId → Set<slug> for each source article
  const articleTargetSlugs = new Map<string, Set<string>>();
  const allUniqueSlugs = new Set<string>();

  for (const article of allArticles) {
    if (!article.content) continue;

    const links = extractLinks(article.content);
    const targetSlugs = new Set<string>();

    for (const link of links) {
      const slug = resolveBlogSlug(link.href);
      if (slug && slug !== '') {
        targetSlugs.add(slug);
        allUniqueSlugs.add(slug);
      }
    }

    if (targetSlugs.size > 0) {
      articleTargetSlugs.set(article.id, targetSlugs);
    }
  }

  if (allUniqueSlugs.size === 0 || articleTargetSlugs.size === 0) {
    return { articlesProcessed: allArticles.length, totalLinksCreated: 0 };
  }

  // ── Pass 2: Batch resolve all slugs → article IDs (1 query) ─
  const slugToId = new Map<string, string>();
  const resolvedTargets = await db
    .select({ id: articles.id, slug: articles.slug })
    .from(articles)
    .where(and(inArray(articles.slug, Array.from(allUniqueSlugs)), isNull(articles.deletedAt)));

  for (const t of resolvedTargets) {
    slugToId.set(t.slug, t.id);
  }

  // ── Pass 3: Insert all links using the in-memory map ────────
  let totalLinksCreated = 0;
  const insertBatch: { sourceArticleId: string; targetArticleId: string; linkType: string }[] = [];

  for (const [sourceId, targetSlugs] of articleTargetSlugs) {
    for (const slug of targetSlugs) {
      const targetId = slugToId.get(slug);
      if (targetId && targetId !== sourceId) {
        // Exclude self-links
        insertBatch.push({
          sourceArticleId: sourceId,
          targetArticleId: targetId,
          linkType: 'internal',
        });
      }
    }
  }

  // Bulk insert — let unique constraint handle any remaining duplicates
  for (const row of insertBatch) {
    try {
      await db.insert(articleLinks).values(row);
      totalLinksCreated++;
    } catch {
      // Silently skip duplicates
    }
  }

  return {
    articlesProcessed: allArticles.length,
    totalLinksCreated,
  };
}
