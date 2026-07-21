import { Hono } from 'hono';
import { eq, and, asc, desc, sql, isNull, ne, inArray } from 'drizzle-orm';
import { db, articles, articleCategories, articleLinks } from '../../lib/db.ts';
import { authMiddleware, requireRole } from '../../middleware/auth.ts';
import { validateBody } from '../../middleware/validation.ts';
import {
  createArticleSchema,
  updateArticleSchema,
  createArticleCategorySchema,
  updateArticleCategorySchema,
} from '@ahlipanggilan/validation';
import type {
  CreateArticleCategoryInput,
  UpdateArticleCategoryInput,
  CreateArticleInput,
  UpdateArticleInput,
} from '@ahlipanggilan/validation';
import {
  success,
  created,
  error,
  notFound,
  serverError,
  successPaginated,
} from '../../lib/response.ts';
import { buildPaginationMeta } from '../../lib/pagination.ts';
import { omitUndefined } from '../../lib/update.ts';
import { notifyArticlePublished } from '../../lib/indexnow.ts';
import { invalidateCollectionCache } from '../../lib/cache.ts';
import {
  extractLinks,
  resolveBlogSlug,
  populateArticleLinks,
  rebuildAllArticleLinks,
} from '../../lib/article-links.ts';

const router = new Hono();

router.get(
  '/categories',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const items = await db
      .select()
      .from(articleCategories)
      .orderBy(asc(articleCategories.displayOrder));

    return c.json({ data: items });
  },
);

router.post(
  '/categories',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(createArticleCategorySchema),
  async (c) => {
    const data = c.get('validated') as CreateArticleCategoryInput;

    const [existing] = await db
      .select({ id: articleCategories.id })
      .from(articleCategories)
      .where(eq(articleCategories.slug, data.slug))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

    const [created_category] = await db
      .insert(articleCategories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        displayOrder: data.displayOrder ?? 0,
      })
      .returning();

    if (!created_category) return serverError(c, 'Gagal membuat kategori');
    return created(c, created_category, 'Kategori berhasil dibuat');
  },
);

router.patch(
  '/categories/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(updateArticleCategorySchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateArticleCategoryInput;

    const [category] = await db
      .select({ id: articleCategories.id })
      .from(articleCategories)
      .where(eq(articleCategories.id, id))
      .limit(1);
    if (!category) return notFound(c, 'Kategori tidak ditemukan');

    if (data.slug) {
      const [existing] = await db
        .select({ id: articleCategories.id })
        .from(articleCategories)
        .where(and(eq(articleCategories.slug, data.slug), sql`${articleCategories.id} != ${id}`))
        .limit(1);
      if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
    }

    const [updated] = await db
      .update(articleCategories)
      .set(omitUndefined(data))
      .where(eq(articleCategories.id, id))
      .returning();

    return success(c, updated, 'Kategori berhasil diperbarui');
  },
);

router.delete('/categories/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [category] = await db
    .select({ id: articleCategories.id })
    .from(articleCategories)
    .where(eq(articleCategories.id, id))
    .limit(1);
  if (!category) return notFound(c, 'Kategori tidak ditemukan');

  await db.delete(articleCategories).where(eq(articleCategories.id, id));
  return success(c, null, 'Kategori berhasil dihapus');
});

router.get(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const page = Number(c.req.query('page') ?? 1);
    const limit = Number(c.req.query('limit') ?? 50);
    const status = c.req.query('status');

    const conditions = and(
      isNull(articles.deletedAt),
      status ? eq(articles.status, status) : undefined,
    );

    const items = await db
      .select({
        id: articles.id,
        categoryId: articles.categoryId,
        categoryName: articleCategories.name,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
        content: articles.content,
        coverImage: articles.coverImage,
        authorName: articles.authorName,
        status: articles.status,
        isFeatured: articles.isFeatured,
        isPillarContent: articles.isPillarContent,
        tags: articles.tags,
        metaTitle: articles.metaTitle,
        metaDescription: articles.metaDescription,
        ogTitle: articles.ogTitle,
        ogDescription: articles.ogDescription,
        ogImage: articles.ogImage,
        canonicalUrl: articles.canonicalUrl,
        robots: articles.robots,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(conditions)
      .orderBy(desc(articles.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(articles)
      .where(conditions);
    const total = Number(countResult[0]?.count ?? 0);
    const pagination = buildPaginationMeta(page, limit, total);

    return successPaginated(c, items, pagination);
  },
);

router.get(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const id = c.req.param('id')!;

    const [article] = await db
      .select({
        id: articles.id,
        categoryId: articles.categoryId,
        categoryName: articleCategories.name,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
        content: articles.content,
        coverImage: articles.coverImage,
        authorName: articles.authorName,
        status: articles.status,
        isFeatured: articles.isFeatured,
        isPillarContent: articles.isPillarContent,
        tags: articles.tags,
        metaTitle: articles.metaTitle,
        metaDescription: articles.metaDescription,
        ogTitle: articles.ogTitle,
        ogDescription: articles.ogDescription,
        ogImage: articles.ogImage,
        canonicalUrl: articles.canonicalUrl,
        robots: articles.robots,
        schemaJson: articles.schemaJson,
        publishedAt: articles.publishedAt,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(eq(articles.id, id))
      .limit(1);

    if (!article) return notFound(c, 'Artikel tidak ditemukan');
    return success(c, article);
  },
);

router.post(
  '/',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(createArticleSchema),
  async (c) => {
    const data = c.get('validated') as CreateArticleInput;

    const [existing] = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, data.slug))
      .limit(1);
    if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);

    const now = new Date();
    const isPublished = data.status === 'Published';

    const [created_article] = await db
      .insert(articles)
      .values({
        categoryId: data.categoryId ?? null,
        title: data.title,
        slug: data.slug,
        summary: data.summary ?? null,
        content: data.content ?? null,
        coverImage: data.coverImage ?? null,
        authorName: data.authorName ?? null,
        status: data.status ?? 'Draft',
        isFeatured: data.isFeatured ?? false,
        isPillarContent: data.isPillarContent ?? false,
        tags: data.tags ?? [],
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        ogTitle: data.ogTitle ?? null,
        ogDescription: data.ogDescription ?? null,
        ogImage: data.ogImage ?? null,
        canonicalUrl: data.canonicalUrl ?? null,
        robots: data.robots ?? 'index, follow',
        schemaJson: data.schemaJson ?? null,
        publishedAt: isPublished ? now : null,
      })
      .returning();

    if (!created_article) return serverError(c, 'Gagal membuat artikel');

    // Populate article_links from content
    populateArticleLinks(created_article.id).catch(() => {});

    // Ping IndexNow for newly published article
    if (isPublished && created_article.slug) {
      notifyArticlePublished(created_article.slug).catch(() => {});
    }

    // Invalidate CMS cache so public endpoints reflect the new article
    invalidateCollectionCache('cms_articles');

    return created(c, created_article, 'Artikel berhasil dibuat');
  },
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  validateBody(updateArticleSchema),
  async (c) => {
    const id = c.req.param('id')!;
    const data = c.get('validated') as UpdateArticleInput;

    const [article] = await db
      .select({ id: articles.id, status: articles.status, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);
    if (!article) return notFound(c, 'Artikel tidak ditemukan');

    if (data.slug) {
      const [existing] = await db
        .select({ id: articles.id })
        .from(articles)
        .where(and(eq(articles.slug, data.slug), sql`${articles.id} != ${id}`))
        .limit(1);
      if (existing) return error(c, 'SLUG_EXISTS', 'Slug sudah digunakan', 409);
    }

    const updateData = omitUndefined({
      categoryId: data.categoryId,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      coverImage: data.coverImage,
      authorName: data.authorName,
      isFeatured: data.isFeatured,
      isPillarContent: data.isPillarContent,
      tags: data.tags,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      ogImage: data.ogImage,
      canonicalUrl: data.canonicalUrl,
      robots: data.robots,
      schemaJson: data.schemaJson,
    });

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'Published' && article.status !== 'Published') {
        updateData.publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, id))
      .returning();

    // Populate article_links from updated content
    if (updated) {
      populateArticleLinks(updated.id).catch(() => {});
    }

    // Ping IndexNow if article was just published
    if (data.status === 'Published' && article.status !== 'Published' && updated?.slug) {
      notifyArticlePublished(updated.slug).catch(() => {});
    }

    // Invalidate CMS cache — content or status may have changed
    invalidateCollectionCache('cms_articles');

    return success(c, updated, 'Artikel berhasil diperbarui');
  },
);

router.delete('/:id', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  const id = c.req.param('id')!;

  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  if (!article) return notFound(c, 'Artikel tidak ditemukan');

  await db.update(articles).set({ deletedAt: new Date() }).where(eq(articles.id, id));

  // Invalidate CMS cache after deletion
  invalidateCollectionCache('cms_articles');

  return success(c, null, 'Artikel berhasil dihapus');
});

// ── SEO Score API ────────────────────────────────────────────────

interface SeoCheckItem {
  status: boolean | 'warning';
  message: string;
  impact: 'critical' | 'moderate' | 'low';
}

interface SeoScoreResponse {
  articleId: string;
  seoScore: number;
  isPillarContent: boolean;
  pillarConnectionStatus: 'complete' | 'partial' | 'incomplete';
  checklist: {
    pillarLinkFound: SeoCheckItem;
    anchorTextOptimization: SeoCheckItem;
    linkDilutionCheck: SeoCheckItem;
  };
}

router.get(
  '/seo-score',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const articleId = c.req.query('articleId') ?? '';
    if (!articleId) return error(c, 'VALIDATION_ERROR', 'articleId wajib diisi', 400);

    // Fetch article data
    const [article] = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        tags: articles.tags,
        isPillarContent: articles.isPillarContent,
      })
      .from(articles)
      .where(and(eq(articles.id, articleId), isNull(articles.deletedAt)))
      .limit(1);

    if (!article) return notFound(c, 'Artikel tidak ditemukan');

    // If this IS pillar content, skip validation
    if (article.isPillarContent) {
      const response: SeoScoreResponse = {
        articleId,
        seoScore: 100,
        isPillarContent: true,
        pillarConnectionStatus: 'complete',
        checklist: {
          pillarLinkFound: {
            status: true,
            message: 'Artikel ini adalah Content Pillar — tidak memerlukan tautan ke pilar lain.',
            impact: 'low',
          },
          anchorTextOptimization: {
            status: true,
            message: 'Artikel pilar tidak memerlukan validasi anchor text cluster.',
            impact: 'low',
          },
          linkDilutionCheck: {
            status: true,
            message: 'Artikel pilar adalah sumber otoritas utama.',
            impact: 'low',
          },
        },
      };
      return success(c, response);
    }

    // Get current article title and tags for scoring
    const currentTitle = article.title;
    const currentTags = article.tags;

    // Find all pillar articles (exclude self)
    const allPillars = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        tags: articles.tags,
      })
      .from(articles)
      .where(
        and(
          eq(articles.isPillarContent, true),
          isNull(articles.deletedAt),
          ne(articles.id, articleId),
        ),
      )
      .orderBy(desc(articles.updatedAt))
      .limit(50);

    const pillarUrls = new Set(allPillars.map((p) => `/blog/${p.slug}`));

    // Find links to pillar content — query article_links table first, fall back to HTML parsing
    const foundPillarLinks: { href: string; text: string }[] = [];

    // Query article_links for this article
    const existingLinks = await db
      .select({
        targetId: articleLinks.targetArticleId,
        targetSlug: articles.slug,
        targetTitle: articles.title,
      })
      .from(articleLinks)
      .innerJoin(articles, eq(articleLinks.targetArticleId, articles.id))
      .where(eq(articleLinks.sourceArticleId, articleId));

    if (existingLinks.length > 0) {
      // Use article_links data — filter to only pillar links
      for (const link of existingLinks) {
        if (pillarUrls.has(`/blog/${link.targetSlug}`)) {
          foundPillarLinks.push({
            href: `/blog/${link.targetSlug}`,
            text: link.targetTitle ?? link.targetSlug,
          });
        }
      }
    } else {
      // Fall back to HTML parsing (legacy path for existing articles)
      const htmlContent = article.content ?? '';
      const links = extractLinks(htmlContent);

      for (const l of links) {
        // Resolve slug from any URL format (/blog/{slug}, full URL, etc.)
        const slug = resolveBlogSlug(l.href);
        if (slug && pillarUrls.has(`/blog/${slug}`)) {
          foundPillarLinks.push({
            href: `/blog/${slug}`,
            text: l.text,
          });
        }
      }
    }

    // Check 1: Pillar link found
    const pillarLinkFound: SeoCheckItem =
      foundPillarLinks.length > 0
        ? {
            status: true,
            message: `✅ Ditemukan ${foundPillarLinks.length} tautan ke artikel pilar yang relevan.`,
            impact: 'low',
          }
        : allPillars.length === 0
          ? {
              status: 'warning' as const,
              message:
                'Belum ada artikel pilar yang tersedia. Buat artikel pilar dengan mencentang "Jadikan sebagai Content Pillar".',
              impact: 'moderate',
            }
          : {
              status: false,
              message: 'Anda belum menaruh tautan ke artikel pilar yang relevan.',
              impact: 'critical',
            };

    // Check 2: Anchor text optimization
    let anchorTextOptimization: SeoCheckItem;
    if (foundPillarLinks.length === 0) {
      anchorTextOptimization = {
        status: false,
        message: 'Tidak ada tautan ke artikel pilar untuk diperiksa.',
        impact: 'moderate',
      };
    } else {
      const hasKeywordAnchor = foundPillarLinks.some((link) => {
        const anchorText = link.text.toLowerCase();
        return (
          currentTags.some((tag) => anchorText.includes(tag.toLowerCase())) ||
          anchorText.includes(currentTitle.toLowerCase().split(' ')[0] ?? '')
        );
      });
      anchorTextOptimization = hasKeywordAnchor
        ? {
            status: true,
            message: 'Anchor text pada tautan pilar mengandung kata kunci yang relevan.',
            impact: 'low',
          }
        : {
            status: 'warning' as const,
            message:
              'Tautan ke artikel pilar ditemukan, namun anchor text tidak mengandung kata kunci utama. Gunakan kata kunci seperti: ' +
              currentTags.slice(0, 3).join(', '),
            impact: 'moderate',
          };
    }

    // Check 3: Link dilution check
    const totalOutboundLinks =
      existingLinks.length > 0 ? existingLinks.length : extractLinks(article.content ?? '').length;
    const linkDilutionCheck: SeoCheckItem =
      totalOutboundLinks <= 15
        ? {
            status: true,
            message: `Jumlah tautan keluar (${totalOutboundLinks}) masih wajar, otoritas halaman terjaga.`,
            impact: 'low',
          }
        : {
            status: 'warning' as const,
            message: `Terlalu banyak tautan keluar (${totalOutboundLinks}). Idealnya maksimal 15 tautan per artikel.`,
            impact: 'moderate',
          };

    // Calculate overall SEO score
    const seoScore = calculateSeoScore({
      pillarLinkFound: pillarLinkFound.status,
      anchorTextOptimization: anchorTextOptimization.status,
      linkDilutionCheck: linkDilutionCheck.status,
    });

    // Determine pillar connection status
    let pillarConnectionStatus: 'complete' | 'partial' | 'incomplete';
    if (
      foundPillarLinks.length > 0 &&
      typeof anchorTextOptimization.status === 'boolean' &&
      anchorTextOptimization.status
    ) {
      pillarConnectionStatus = 'complete';
    } else if (foundPillarLinks.length > 0) {
      pillarConnectionStatus = 'partial';
    } else if (allPillars.length === 0) {
      pillarConnectionStatus = 'complete'; // no pillars exist, nothing to link
    } else {
      pillarConnectionStatus = 'incomplete';
    }

    const response: SeoScoreResponse = {
      articleId,
      seoScore,
      isPillarContent: false,
      pillarConnectionStatus,
      checklist: {
        pillarLinkFound,
        anchorTextOptimization,
        linkDilutionCheck,
      },
    };

    return success(c, response);
  },
);

/**
 * Calculate SEO score from checklist statuses.
 * critical = 0 points, warning/moderate = 50 points, true/low = 100 points.
 */
function calculateSeoScore(checks: {
  pillarLinkFound: boolean | 'warning';
  anchorTextOptimization: boolean | 'warning';
  linkDilutionCheck: boolean | 'warning';
}): number {
  const weights = {
    pillarLinkFound: 50,
    anchorTextOptimization: 30,
    linkDilutionCheck: 20,
  };

  let total = 0;
  let maxTotal = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const status = checks[key as keyof typeof checks];
    maxTotal += weight;
    if (status === true) {
      total += weight;
    } else if (status === 'warning') {
      total += Math.round(weight * 0.5);
    }
    // false = 0
  }

  return Math.round((total / maxTotal) * 100);
}
// ── Pillar Cluster Overview API ────────────────────────────────

interface PillarClusterItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  clusterCount: number;
  clusterArticles: { id: string; title: string; slug: string }[];
}

interface OrphanItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  categoryName: string | null;
  publishedAt: string | null;
}

interface PillarOverviewResponse {
  totalPillars: number;
  totalClusters: number;
  totalOrphans: number;
  totalArticles: number;
  pillars: PillarClusterItem[];
  orphans: OrphanItem[];
}

router.get(
  '/pillar-overview',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    // Fetch all non-deleted articles with pillar flag
    const allArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        content: articles.content,
        status: articles.status,
        isPillarContent: articles.isPillarContent,
        categoryName: articleCategories.name,
        publishedAt: articles.publishedAt,
      })
      .from(articles)
      .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(and(isNull(articles.deletedAt), ne(articles.status, 'Archived')))
      .orderBy(desc(articles.isPillarContent), desc(articles.updatedAt));

    const pillars = allArticles.filter((a) => a.isPillarContent);
    const nonPillars = allArticles.filter((a) => !a.isPillarContent);

    // Build pillar ID set
    const pillarIds = new Set(pillars.map((p) => p.id));
    const pillarSlugToId = new Map(pillars.map((p) => [p.slug, p.id]));

    // Query article_links for ALL non-pillar articles in one batch
    const nonPillarIds = nonPillars.map((a) => a.id);

    const allLinks =
      nonPillarIds.length > 0 && pillarIds.size > 0
        ? await db
            .select({
              sourceId: articleLinks.sourceArticleId,
              targetId: articleLinks.targetArticleId,
              targetSlug: articles.slug,
            })
            .from(articleLinks)
            .innerJoin(articles, eq(articleLinks.targetArticleId, articles.id))
            .where(
              and(
                inArray(articleLinks.sourceArticleId, nonPillarIds),
                inArray(articleLinks.targetArticleId, Array.from(pillarIds)),
              ),
            )
        : [];

    // Build cluster map: for each article, which pillar IDs it links to
    const articleToPillarIds = new Map<string, Set<string>>();
    for (const link of allLinks) {
      if (!articleToPillarIds.has(link.sourceId)) {
        articleToPillarIds.set(link.sourceId, new Set());
      }
      articleToPillarIds.get(link.sourceId)!.add(link.targetId);
    }

    // Build pillar link counts from article_links
    const pillarLinkCounts = new Map<string, { count: number; clusterIds: string[] }>();
    for (const p of pillars) {
      pillarLinkCounts.set(p.id, { count: 0, clusterIds: [] });
    }

    const orphanIds: string[] = [];

    for (const article of nonPillars) {
      const linkedPillarIds = articleToPillarIds.get(article.id);

      if (linkedPillarIds && linkedPillarIds.size > 0) {
        // Article links to at least one pillar via article_links
        for (const pillarId of linkedPillarIds) {
          const entry = pillarLinkCounts.get(pillarId);
          if (entry) {
            entry.count++;
            entry.clusterIds.push(article.id);
          }
        }
      } else {
        // Fall back to HTML parsing (legacy path)
        const htmlContent = article.content ?? '';
        const links = extractLinks(htmlContent);

        const foundPillarSlugs = new Set<string>();
        for (const link of links) {
          const match = link.href.match(/\/blog\/([a-z0-9-]+)/i);
          if (match) {
            const slug = match[1]!;
            if (pillarSlugToId.has(slug)) {
              foundPillarSlugs.add(slug);
            }
          }
        }

        if (foundPillarSlugs.size > 0) {
          for (const slug of foundPillarSlugs) {
            const pillarId = pillarSlugToId.get(slug)!;
            const entry = pillarLinkCounts.get(pillarId)!;
            entry.count++;
            entry.clusterIds.push(article.id);
          }
        } else {
          orphanIds.push(article.id);
        }
      }
    }

    // Build pillar cluster items
    const pillarItems: PillarClusterItem[] = pillars.map((p) => {
      const linkData = pillarLinkCounts.get(p.id) ?? { count: 0, clusterIds: [] };
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        clusterCount: linkData.count,
        clusterArticles: linkData.clusterIds
          .map((cid) => {
            const ca = allArticles.find((a) => a.id === cid);
            return ca ? { id: ca.id, title: ca.title, slug: ca.slug } : null;
          })
          .filter((x): x is { id: string; title: string; slug: string } => x !== null),
      };
    });

    // Sort pillars by cluster count descending
    pillarItems.sort((a, b) => b.clusterCount - a.clusterCount);

    // Build orphan items
    const orphanItems: OrphanItem[] = orphanIds
      .map((id) => {
        const oa = allArticles.find((a) => a.id === id);
        return oa
          ? {
              id: oa.id,
              title: oa.title,
              slug: oa.slug,
              status: oa.status,
              categoryName: oa.categoryName,
              publishedAt: oa.publishedAt ? oa.publishedAt.toISOString() : null,
            }
          : null;
      })
      .filter((x): x is OrphanItem => x !== null);

    const response: PillarOverviewResponse = {
      totalPillars: pillars.length,
      totalClusters: nonPillars.length - orphanIds.length,
      totalOrphans: orphanIds.length,
      totalArticles: allArticles.length,
      pillars: pillarItems,
      orphans: orphanItems,
    };

    return success(c, response);
  },
);

// ── Rebuild Article Links API ───────────────────────────────────

interface RebuildLinksResponse {
  success: boolean;
  articlesProcessed: number;
  totalLinksCreated: number;
  message: string;
}

router.post('/rebuild-links', authMiddleware, requireRole('admin', 'super_admin'), async (c) => {
  try {
    const { articlesProcessed, totalLinksCreated } = await rebuildAllArticleLinks();

    const response: RebuildLinksResponse = {
      success: true,
      articlesProcessed,
      totalLinksCreated,
      message: `Memproses ${articlesProcessed} artikel dan membuat ${totalLinksCreated} tautan.`,
    };
    return success(c, response, 'Tautan artikel berhasil dibangun ulang');
  } catch {
    return serverError(c, 'Gagal membangun ulang tautan artikel');
  }
});

// ── Link Suggestions API ────────────────────────────────────────

interface SuggestionItem {
  id: string;
  title: string;
  slug: string;
  url: string;
  relevanceScore: number;
  matchedTags: string[];
  suggestedAnchor: string;
  reason: string;
}

router.get(
  '/suggestions',
  authMiddleware,
  requireRole('admin', 'super_admin', 'content_manager'),
  async (c) => {
    const articleId = c.req.query('articleId') ?? '';

    // Fetch current article data to compute relevance
    let currentTitle = '';
    let currentTags: string[] = [];

    if (articleId) {
      const [current] = await db
        .select({ title: articles.title, tags: articles.tags, content: articles.content })
        .from(articles)
        .where(and(eq(articles.id, articleId), isNull(articles.deletedAt)))
        .limit(1);
      if (current) {
        currentTitle = current.title;
        currentTags = current.tags;
      }
    }

    // Find all active pillar content (exclude current article)
    const conditions = [eq(articles.isPillarContent, true), isNull(articles.deletedAt)];
    if (articleId) conditions.push(ne(articles.id, articleId));

    const pillars = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        tags: articles.tags,
        summary: articles.summary,
      })
      .from(articles)
      .where(and(...conditions))
      .orderBy(desc(articles.updatedAt))
      .limit(20);

    if (pillars.length === 0) {
      return success(c, []);
    }

    // Calculate relevance for each pillar
    const suggestions: SuggestionItem[] = pillars.map((pillar) => {
      // 1. Tag overlap score (0-1)
      const tagOverlap =
        currentTags.length > 0 && pillar.tags.length > 0
          ? currentTags.filter((t) =>
              pillar.tags.some((pt) => pt.toLowerCase() === t.toLowerCase()),
            ).length / Math.max(currentTags.length, 1)
          : 0;

      // 2. Title trigram similarity (0-1)
      const titleSim = currentTitle
        ? trigramSimilarity(currentTitle.toLowerCase(), pillar.title.toLowerCase())
        : 0;

      // 3. Tag-in-title match (0-1)
      const tagInTitle =
        currentTags.length > 0 && pillar.title
          ? currentTags.filter((t) => pillar.title.toLowerCase().includes(t.toLowerCase())).length /
            currentTags.length
          : 0;

      // Weighted combined score
      const relevanceScore = Math.min(1, tagOverlap * 0.5 + titleSim * 0.3 + tagInTitle * 0.2);

      // Find matched tags
      const matchedTags =
        currentTags.length > 0
          ? currentTags.filter(
              (t) =>
                pillar.tags.some((pt) => pt.toLowerCase() === t.toLowerCase()) ||
                pillar.title.toLowerCase().includes(t.toLowerCase()),
            )
          : [];

      return {
        id: pillar.id,
        title: pillar.title,
        slug: pillar.slug,
        url: `/blog/${pillar.slug}`,
        relevanceScore: Math.round(relevanceScore * 100) / 100,
        matchedTags,
        suggestedAnchor: generateSuggestedAnchor(pillar.title, currentTags),
        reason: generateReason(pillar, matchedTags, relevanceScore),
      };
    });

    // Sort by relevance descending, filter low scores, limit
    suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const filtered = suggestions.filter((s) => s.relevanceScore >= 0.1).slice(0, 10);

    return success(c, filtered);
  },
);

/**
 * Trigram similarity: count shared trigrams / total unique trigrams.
 * Approximation of PostgreSQL pg_trgm similarity().
 */
function trigramSimilarity(a: string, b: string): number {
  const trigramsA = getTrigrams(a);
  const trigramsB = getTrigrams(b);
  if (trigramsA.size === 0 && trigramsB.size === 0) return 0;
  const intersection = new Set<string>();
  for (const t of trigramsA) {
    if (trigramsB.has(t)) intersection.add(t);
  }
  const union = new Set([...trigramsA, ...trigramsB]);
  return intersection.size / union.size;
}

function getTrigrams(s: string): Set<string> {
  const padded = `  ${s} `;
  const trigrams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.add(padded.slice(i, i + 3));
  }
  return trigrams;
}

function generateSuggestedAnchor(title: string, tags: string[]): string {
  if (tags.length > 0) {
    const matchedTag = tags.find((t) => title.toLowerCase().includes(t.toLowerCase()));
    if (matchedTag) return matchedTag.toLowerCase();
  }
  return title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 5)
    .join(' ')
    .toLowerCase();
}

function generateReason(
  pillar: { title: string; tags: string[]; summary: string | null },
  matchedTags: string[],
  score: number,
): string {
  if (matchedTags.length > 0) {
    return `Artikel pilar ini memiliki kesamaan topik ${matchedTags.slice(0, 3).join(', ')} yang relevan dengan tulisan Anda.`;
  }
  if (score >= 0.5) {
    return 'Artikel pilar ini sangat relevan karena membahas topik yang serupa dengan draf Anda.';
  }
  return 'Ditemukan kecocokan topik sekunder — pertimbangkan untuk menautkannya sebagai referensi tambahan.';
}

export { router as adminArticlesRouter };
