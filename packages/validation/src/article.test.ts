import { describe, it, expect } from 'vitest';
import {
  createArticleCategorySchema,
  updateArticleCategorySchema,
  createArticleSchema,
  updateArticleSchema,
} from './article.ts';

const UUID = '550e8400-e29b-41d4-a716-446655440000';

// ───── Article Category Schemas ─────

describe('createArticleCategorySchema', () => {
  it('accepts valid category', () => {
    const result = createArticleCategorySchema.safeParse({
      name: 'Tips & Trik',
      slug: 'tips-trik',
    });
    expect(result.success).toBe(true);
  });

  it('accepts with description and displayOrder', () => {
    const result = createArticleCategorySchema.safeParse({
      name: 'Tips & Trik',
      slug: 'tips-trik',
      description: 'Kumpulan tips dan trik',
      displayOrder: 1,
    });
    expect(result.success).toBe(true);
  });

  it('coerces string displayOrder to number', () => {
    const result = createArticleCategorySchema.safeParse({
      name: 'Tips',
      slug: 'tips',
      displayOrder: '2',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createArticleCategorySchema.safeParse({ name: '', slug: 'tips' });
    expect(result.success).toBe(false);
  });

  it('rejects empty slug', () => {
    const result = createArticleCategorySchema.safeParse({ name: 'Tips', slug: '' });
    expect(result.success).toBe(false);
  });

  it('rejects slug with uppercase', () => {
    const result = createArticleCategorySchema.safeParse({ name: 'Tips', slug: 'Tips-Trik' });
    expect(result.success).toBe(false);
  });

  it('rejects slug with spaces', () => {
    const result = createArticleCategorySchema.safeParse({ name: 'Tips', slug: 'tips trik' });
    expect(result.success).toBe(false);
  });

  it('rejects slug with special chars', () => {
    const result = createArticleCategorySchema.safeParse({ name: 'Tips', slug: 'tips_trik!' });
    expect(result.success).toBe(false);
  });

  it('rejects negative displayOrder', () => {
    const result = createArticleCategorySchema.safeParse({
      name: 'Tips',
      slug: 'tips',
      displayOrder: -1,
    });
    expect(result.success).toBe(false);
  });
});

describe('updateArticleCategorySchema', () => {
  it('accepts empty object (no changes)', () => {
    const result = updateArticleCategorySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with name only', () => {
    const result = updateArticleCategorySchema.safeParse({ name: 'Updated Name' });
    expect(result.success).toBe(true);
  });

  it('accepts nullable description', () => {
    const result = updateArticleCategorySchema.safeParse({ description: null });
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug', () => {
    const result = updateArticleCategorySchema.safeParse({ slug: 'UPPERCASE' });
    expect(result.success).toBe(false);
  });
});

// ───── Article Schemas ─────

describe('createArticleSchema', () => {
  const validArticle = {
    title: 'Cara Merawat AC',
    slug: 'cara-merawat-ac',
  };

  it('accepts valid article (minimal)', () => {
    const result = createArticleSchema.safeParse(validArticle);
    expect(result.success).toBe(true);
  });

  it('accepts with all optional fields', () => {
    const result = createArticleSchema.safeParse({
      ...validArticle,
      categoryId: UUID,
      summary: 'Panduan lengkap merawat AC',
      content: '## Cara Merawat AC\\n\\nBerikut adalah langkah-langkah...',
      coverImage: 'https://example.com/image.jpg',
      authorName: 'Admin',
      status: 'Published',
      isFeatured: true,
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid status values', () => {
    for (const s of ['Draft', 'Review', 'Published', 'Archived']) {
      const result = createArticleSchema.safeParse({ ...validArticle, status: s });
      expect(result.success).toBe(true);
    }
  });

  it('rejects empty title', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, title: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty slug', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, slug: '' });
    expect(result.success).toBe(false);
  });

  it('rejects slug with uppercase', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, slug: 'Cara-Merawat-AC' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, status: 'Deleted' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid categoryId', () => {
    const result = createArticleSchema.safeParse({ ...validArticle, categoryId: 'not-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects summary exceeding 500 chars', () => {
    const result = createArticleSchema.safeParse({
      ...validArticle,
      summary: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding 255 chars', () => {
    const result = createArticleSchema.safeParse({
      ...validArticle,
      title: 'x'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('rejects coverImage exceeding 255 chars', () => {
    const result = createArticleSchema.safeParse({
      ...validArticle,
      coverImage: 'x'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('rejects authorName exceeding 255 chars', () => {
    const result = createArticleSchema.safeParse({
      ...validArticle,
      authorName: 'x'.repeat(256),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid isFeatured type (string instead of boolean)', () => {
    const result = createArticleSchema.safeParse({
      title: 'Test',
      slug: 'test',
      isFeatured: 'true',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateArticleSchema', () => {
  it('accepts empty object (no changes)', () => {
    const result = updateArticleSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts partial update with title only', () => {
    const result = updateArticleSchema.safeParse({ title: 'Updated Title' });
    expect(result.success).toBe(true);
  });

  it('accepts nullable fields', () => {
    const result = updateArticleSchema.safeParse({
      categoryId: null,
      summary: null,
      content: null,
      coverImage: null,
      authorName: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid status change', () => {
    const result = updateArticleSchema.safeParse({ status: 'Published' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug', () => {
    const result = updateArticleSchema.safeParse({ slug: 'SPACES AND UPPERCASE' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid status', () => {
    const result = updateArticleSchema.safeParse({ status: 'Deleted' });
    expect(result.success).toBe(false);
  });
});
