# Pillar Content System

Project: Specialist Platform
Version: 1.0
Status: LOCKED

---

# 1. Overview

Pillar Content System mengadopsi konsep Rank Math Pillar Content untuk CMS kustom non-WordPress. Sistem ini memungkinkan content manager membangun **Topical Authority** untuk SEO tradisional, Answer Engine Optimization (AEO), dan Generative Engine Optimization (GEO).

## Sumber Referensi

- [Rank Math Pillar Content](https://rankmath.com/kb/pillar-content-internal-linking/)
- [Rank Math Topic Clusters](https://rankmath.com/blog/topic-clusters/)
- [Rank Math Internal Linking](https://rankmath.com/blog/internal-linking/)

---

# 2. Konsep

## Content Pillar (Artikel Pilar)

Artikel utama yang membahas topik besar secara mendalam, lengkap, dan evergreen. Berfungsi sebagai "pusat data" atau induk dari artikel-artikel kecil (cluster content).

## Cluster Content (Artikel Cluster)

Artikel anak yang membahas subtopik spesifik dari topik utama. Wajib menautkan (link) kembali ke artikel pilar.

## Topical Authority

Struktur pillar-cluster yang saling terhubung memberi sinyal ke Google/AI bahwa website memiliki pemahaman luas dan kredibel mengenai suatu topik.

---

# 3. Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    ArticleEditor.tsx                        │
│  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │   Main Editor Area      │  │  Right Sidebar            │ │
│  │  ┌───────────────────┐  │  │  ┌────────────────────┐  │ │
│  │  │ RichTextEditor    │  │  │  │ ☑ Content Pillar  │  │ │
│  │  │ + Preview         │  │  │  └────────────────────┘  │ │
│  │  └───────────────────┘  │  │  ┌────────────────────┐  │ │
│  │                         │  │  │ 💡 Link Suggestions │  │ │
│  │                         │  │  │   Pillar A    [94%] │  │ │
│  │                         │  │  │   Pillar B    [45%] │  │ │
│  │                         │  │  └────────────────────┘  │ │
│  │                         │  │  ┌────────────────────┐  │ │
│  │                         │  │  │ 📊 SEO Score       │  │ │
│  │                         │  │  │   ████░ 75/100    │  │ │
│  │                         │  │  │   ✅ Pillar link   │  │ │
│  │                         │  │  │   ⚠️ Anchor text   │  │ │
│  │                         │  │  └────────────────────┘  │ │
│  └─────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐  ┌──────────────────────────────────┐
│  Article API      │  │  Suggestion / SEO / Overview API │
│  POST/PATCH       │  │  GET /suggestions               │
│  isPillarContent  │  │  GET /seo-score                 │
│                   │  │  GET /pillar-overview            │
└──────────────────┘  └──────────────────────────────────┘
```

---

# 4. Database Schema

## Tabel: articles

| Kolom             | Tipe    | Default  | Keterangan            |
| ----------------- | ------- | -------- | --------------------- |
| id                | uuid    | PK       |                       |
| title             | varchar | NOT NULL |                       |
| slug              | varchar | UNIQUE   |                       |
| is_pillar_content | boolean | false    | Sprint 1: kolom baru  |
| ...               | ...     | ...      | Kolom artikel lainnya |

## Tabel: article_links

| Kolom             | Tipe      | Constraint                | Keterangan                   |
| ----------------- | --------- | ------------------------- | ---------------------------- |
| id                | uuid      | PK                        |                              |
| source_article_id | uuid      | FK → articles(id) CASCADE | Artikel yang menautkan       |
| target_article_id | uuid      | FK → articles(id) CASCADE | Artikel yang ditaut (pillar) |
| link_type         | varchar   | DEFAULT 'internal'        | Jenis link                   |
| created_at        | timestamp | DEFAULT now()             |                              |

**UNIQUE**: (source_article_id, target_article_id) — mencegah duplikasi.

**Indexes**: source, target, source+target composite.

---

# 5. API Endpoints

## Admin Article Endpoints (di `/api/v1/admin/articles/`)

| Method | Path               | Auth                              | Deskripsi                                                | Sprint |
| ------ | ------------------ | --------------------------------- | -------------------------------------------------------- | ------ |
| GET    | `/suggestions`     | admin/super_admin/content_manager | Rekomendasi pillar content relevan                       | 2      |
| GET    | `/seo-score`       | admin/super_admin/content_manager | SEO score + checklist link validation                    | 3      |
| GET    | `/pillar-overview` | admin/super_admin/content_manager | Stats + cluster + orphan detection                       | 5      |
| POST   | `/rebuild-links`   | admin/super_admin                 | Rebuild ulang tabel `article_links` dari seluruh artikel | 6      |

## Query Parameters

### GET /suggestions?articleId=X

| Parameter | Tipe   | Required | Deskripsi                            |
| --------- | ------ | -------- | ------------------------------------ |
| articleId | string | Ya       | ID artikel untuk mencari rekomendasi |

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Panduan Lengkap AC",
      "slug": "panduan-lengkap-ac",
      "url": "/blog/panduan-lengkap-ac",
      "relevanceScore": 0.94,
      "matchedTags": ["AC", "perawatan"],
      "suggestedAnchor": "perawatan AC",
      "reason": "Artikel pilar ini memiliki topik AC, perawatan yang relevan..."
    }
  ]
}
```

### GET /seo-score?articleId=X

| Parameter | Tipe   | Required | Deskripsi                 |
| --------- | ------ | -------- | ------------------------- |
| articleId | string | Ya       | ID artikel untuk skor SEO |

**Response**:

```json
{
  "success": true,
  "data": {
    "articleId": "uuid",
    "seoScore": 75,
    "isPillarContent": false,
    "pillarConnectionStatus": "partial",
    "checklist": {
      "pillarLinkFound": {
        "status": true,
        "message": "Ditemukan 1 tautan ke artikel pilar.",
        "impact": "low"
      },
      "anchorTextOptimization": {
        "status": "warning",
        "message": "Anchor text tidak mengandung kata kunci.",
        "impact": "moderate"
      },
      "linkDilutionCheck": {
        "status": true,
        "message": "Jumlah tautan keluar (8) masih wajar.",
        "impact": "low"
      }
    }
  }
}
```

### POST /rebuild-links

Menghapus semua entri `article_links` dan mempopulasinya ulang dari konten HTML seluruh artikel.
Endpoint ini berguna untuk:

- Migrasi data awal (saat fitur pertama kali diaktifkan)
- Recovery jika tabel tidak sinkron
- Batch update setelah perubahan slug massal

**Response**:

```json
{
  "success": true,
  "data": {
    "articlesProcessed": 42,
    "totalLinksCreated": 156,
    "message": "Memproses 42 artikel dan membuat 156 tautan."
  }
}
```

### GET /pillar-overview

Tidak ada parameter.

**Response**:

```json
{
  "success": true,
  "data": {
    "totalPillars": 3,
    "totalClusters": 9,
    "totalOrphans": 2,
    "totalArticles": 14,
    "pillars": [
      {
        "id": "uuid",
        "title": "Panduan Lengkap AC",
        "slug": "panduan-lengkap-ac",
        "status": "Published",
        "clusterCount": 5,
        "clusterArticles": [{ "id": "uuid", "title": "Tips AC Irit", "slug": "tips-ac-irit" }]
      }
    ],
    "orphans": [
      {
        "id": "uuid",
        "title": "Cara Hemat Listrik",
        "slug": "cara-hemat-listrik",
        "status": "Published",
        "categoryName": "Listrik",
        "publishedAt": "2026-05-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

# 6. Scoring Algorithm

## Link Suggestion Engine

Relevance dihitung antara artikel cluster (draft) dengan setiap pillar content menggunakan 3 metrik:

```
Score = TagOverlap × 50% + TitleTrigrSim × 30% + TagInTitle × 20%
```

| Metrik        | Bobot | Deskripsi                                      |
| ------------- | ----- | ---------------------------------------------- |
| Tag Overlap   | 50%   | Jumlah tag yang cocok / total tag cluster      |
| Title Trigram | 30%   | Trigram similarity judul cluster vs pillar     |
| Tag-in-Title  | 20%   | Jumlah tag cluster yang muncul di judul pillar |

Trigram similarity dihitung dengan rumus:

```
similarity = |trigram(A) ∩ trigram(B)| / |trigram(A) ∪ trigram(B)|
```

## SEO Score

```
SEO Score = (pillarLinkFound × 50 + anchorTextOpt × 30 + linkDilution × 20) / 100
```

| Komponen               | Bobot | Kondisi True              | Kondisi Warning     | Kondisi False  |
| ---------------------- | ----- | ------------------------- | ------------------- | -------------- |
| pillarLinkFound        | 50    | Ada link ke pillar        | —                   | Tidak ada      |
| anchorTextOptimization | 30    | Anchor mengandung keyword | Keyword tidak cocok | Tidak ada link |
| linkDilutionCheck      | 20    | Total link ≤ 15           | Total link > 15     | —              |

---

# 7. Sitemap Priority Boost

Pillar content mendapat prioritas lebih tinggi di sitemap XML:

| Tipe Artikel   | Priority | Changefreq |
| -------------- | -------- | ---------- |
| Pillar Content | 1.0      | daily      |
| Artikel Biasa  | 0.7      | weekly     |

Konfigurasi disimpan di tabel `system_settings` dengan prefix `sitemap_pillar_content_*` dan bisa diubah melalui SitemapSettings admin UI.

---

# 8. JSON-LD: CollectionPage Schema

Untuk artikel pillar, sistem auto-inject schema `CollectionPage` di JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BreadcrumbList", ... },
    { "@type": "Article", ... },
    {
      "@type": "CollectionPage",
      "mainEntity": {
        "@type": "Article",
        "headline": "Judul Artikel Pilar",
        "inLanguage": "id-ID"
      },
      "about": {
        "@type": "Thing",
        "name": "Nama Kategori"
      }
    }
  ]
}
```

Dampak AEO/GEO:

- **AEO**: Google Assistant dan Siri membaca `CollectionPage` sebagai halaman indeks topikal, meningkatkan kemungkinan dipilih sebagai Featured Snippet.
- **GEO**: LLM (ChatGPT, Perplexity, Google SGE) mendeteksi `mainEntity` dan `about` sebagai sinyal otoritas topik, memprioritaskan halaman pillar sebagai sumber kutipan.

---

# 9. Frontend Components

| Komponen                | File                          | Deskripsi                                 | Sprint |
| ----------------------- | ----------------------------- | ----------------------------------------- | ------ |
| PillarLinkSuggestions   | `PillarLinkSuggestions.tsx`   | Sidebar widget rekomendasi pillar content | 2      |
| PillarSeoScore          | `PillarSeoScore.tsx`          | Sidebar widget SEO score + checklist      | 3      |
| PillarClusterVisualizer | `PillarClusterVisualizer.tsx` | Dashboard halaman cluster visualizer      | 5      |

## ArticleEditor Sidebar Layout

```
Pengaturan (Card)
  ☑ Jadikan sebagai Content Pillar

PillarLinkSuggestions (Card)
  💡 Rekomendasi Tautan Internal
  - [Pilar A] [94%] [Salin Link]
  - [Pilar B] [45%] [Salin Link]

PillarSeoScore (Card)
  📊 Skor SEO Internal Link
  ████████░░ 75/100 Baik
  ✅ Ditemukan 1 tautan ke artikel pilar
  ⚠️ Anchor text tidak mengandung keyword
  ✅ Jumlah tautan keluar (8) wajar
```

---

# 10. Dashboard: Cluster Visualizer

Halaman: `/dashboard/admin/pillar-clusters`

## Layout

```
┌─────────────────────────────────────────────────┐
│ Cluster Visualizer                    [Refresh] │
├──────────┬──────────┬──────────┬─────────────────┤
│ 15       │ 3        │ 10       │ 2               │
│ Total    │ Pillar   │ Cluster  │ Orphan          │
├──────────┴──────────┴──────────┴─────────────────┤
│ Konektivitas                         ██████░ 87% │
│ 2 artikel orphan...                             │
├─────────────────────────────────────────────────┤
│ Artikel Pilar (3)                                │
│ ▶ Panduan AC            ┌── 5 artikel ───────┐  │
│   /blog/panduan-ac      │ Tips AC Irit       │  │
│                          │ AC Rusak?         │  │
│                          └───────────────────┘  │
│ ▶ Tips Listrik           ┌── 3 artikel ───┐    │
├─────────────────────────────────────────────────┤
│ ⚠ 2 Artikel Orphan                              │
│ Cara Hemat Listrik  /blog/hemat-listrik [Edit]  │
│ Pipa Bocor          /blog/pipa-bocor   [Edit]  │
└─────────────────────────────────────────────────┘
```

## Komponen Stat Card

- **Total Artikel**: semua non-deleted, non-archived articles
- **Content Pillar**: artikel dengan `isPillarContent = true`
- **Cluster Articles**: non-pillar articles yang memiliki link ke pillar content
- **Orphan Articles**: non-pillar articles yang TIDAK memiliki link ke pillar content

## Connection Rate

```
connectionRate = (totalArticles - totalOrphans) / totalArticles × 100
```

Warna progress bar:

- ≥ 80% → hijau (baik)
- 50-79% → kuning (perlu perbaikan)
- < 50% → merah (kritis)

## Orphan Detection

Orphan detection dilakukan dengan dua metode, diutamakan dari tabel `article_links`:

### Metode 1: Query article_links (Primary)

Endpoint melakukan batch query ke tabel `article_links` untuk semua non-pillar article:

```typescript
const allLinks = await db
  .select({
    sourceId: articleLinks.sourceArticleId,
    targetId: articleLinks.targetArticleId,
  })
  .from(articleLinks)
  .innerJoin(articles, eq(articleLinks.targetArticleId, articles.id))
  .where(
    and(
      inArray(articleLinks.sourceArticleId, nonPillarIds),
      inArray(articleLinks.targetArticleId, Array.from(pillarIds)),
    ),
  );
```

Artikel yang tidak memiliki baris di `article_links` dengan target pillar → **orphan**.

### Metode 2: HTML Parsing (Fallback)

Jika `article_links` kosong untuk suatu artikel (legacy data), fallback ke parsing HTML:

```typescript
/<a\s+[^>]*href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
```

Link dicocokkan dengan pattern `/blog/{slug}` atau `ahlipanggilan.id/blog/{slug}`. Jika slug ada di daftar pillar, artikel dianggap **cluster**. Jika tidak ada, dianggap **orphan**.

---

# 11. Sprints

| Sprint | Fitur                              | Komponen                                        |
| ------ | ---------------------------------- | ----------------------------------------------- |
| 1      | Database + Checkbox                | Migration, ArticleEditor checkbox               |
| 2      | Link Suggestion Engine             | API `/suggestions`, PillarLinkSuggestions       |
| 3      | Link Validation + SEO Score        | API `/seo-score`, PillarSeoScore                |
| 4      | Sitemap Priority + CollectionPage  | Sitemap boost, Blog detail JSON-LD              |
| 5      | Cluster Visualizer Dashboard       | API `/pillar-overview`, PillarClusterVisualizer |
| 6      | article_links Write Path + Rebuild | API `/rebuild-links`, lib/article-links.ts      |

---

# 12. article_links Lifecycle

## Ringkasan

Tabel `article_links` menyimpan relasi tautan antar artikel. Tidak seperti sistem yang hanya mengandalkan HTML parsing (regex) saat runtime, sistem ini mempertahankan **tabel dedikasi** yang dipopulasi secara otomatis.

## Data Flow

```
┌──────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│  Save Article │────▶│ populateArticleLinks() │────▶│  article_links   │
│  POST/PATCH   │     │  (async, non-blocking)│     │  table (PG)      │
└──────────────┘     └──────────────────────┘     └────────┬─────────┘
                                                          │
                                      ┌───────────────────┼───────────────────┐
                                      ▼                   ▼                   ▼
                              ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
                              │ SEO Score     │   │ Pillar        │   │ Rebuild Links    │
                              │ /seo-score    │   │ Overview      │   │ /rebuild-links   │
                              │ (read)        │   │ (read, batch) │   │ (admin only)     │
                              └──────────────┘   └──────────────┘   └──────────────────┘
```

## 12.1 Write Path (Auto-populate)

Setiap kali artikel dibuat (`POST`) atau diperbarui (`PATCH`), sistem otomatis memanggil `populateArticleLinks()`:

```typescript
// Di apps/api/src/lib/article-links.ts
export async function populateArticleLinks(articleId: string): Promise<void> {
  // 1. Fetch article content dari DB
  const [article] = await db.select(...).from(articles).where(eq(articles.id, articleId));
  if (!article || !article.content) {
    await db.delete(articleLinks).where(eq(articleLinks.sourceArticleId, articleId));
    return;
  }

  // 2. Parse HTML → extract semua link
  const links = extractLinks(article.content);

  // 3. Resolve /blog/{slug} dan full URL ke slug
  const targetSlugs = new Set(resolveBlogSlug(link.href) for each link);

  // 4. Lookup target article IDs dari slugs
  const targetArticles = await db.select(...).from(articles)
    .where(inArray(articles.slug, targetSlugs));  // exclude self-link

  // 5. DELETE existing links → INSERT baru
  await db.delete(articleLinks).where(eq(sourceArticleId, articleId));
  for (const target of targetArticles) {
    await db.insert(articleLinks).values({ sourceArticleId, targetArticleId: target.id });
  }
}
```

**Karakteristik**:

- **Async & non-blocking**: `populateArticleLinks().catch(() => {})` — tidak pernah menggagalkan request utama
- **Idempotent**: DELETE semua existing links sebelum INSERT, jadi selalu merepresentasikan state terkini
- **Transaksional per artikel**: Setiap panggilan hanya memproses 1 artikel, tidak ada race condition antar artikel
- **Safe no-op**: Jika artikel tidak ditemukan, tidak punya konten, atau tidak ada link blog → hapus existing links
- **Self-link exclusion**: Link ke slug artikel sendiri diabaikan
- **FK Cascade**: Jika target artikel dihapus, baris `article_links` otomatis terhapus via `ON DELETE CASCADE`

## 12.2 Read Path

### SEO Score

Membaca `article_links` dengan `INNER JOIN articles` untuk filter hanya pillar links:

```typescript
const existingLinks = await db
  .select({ targetId, targetSlug, targetIsPillar })
  .from(articleLinks)
  .innerJoin(articles, eq(articleLinks.targetArticleId, articles.id))
  .where(eq(articleLinks.sourceArticleId, articleId));
```

Jika `article_links` kosong → **fallback ke HTML parsing** (legacy path untuk artikel yang dibuat sebelum fitur ini).

### Cluster Visualizer

Batch query untuk SEMUA non-pillar articles dalam 1 query:

```typescript
const allLinks = await db
  .select({ sourceId, targetId })
  .from(articleLinks)
  .where(inArray(sourceArticleId, nonPillarIds) && inArray(targetArticleId, pillarIds));
```

Ini jauh lebih efisien daripada meng-iterate dan parse HTML setiap artikel satu per satu.

## 12.3 Rebuild Links (Sync)

### POST /api/v1/admin/articles/rebuild-links

**Auth**: `admin` / `super_admin`

Menghapus semua entri `article_links` dan mempopulasinya ulang dari konten HTML seluruh artikel yang tidak dihapus dan tidak di-archive.

**Alur**:

1. `DELETE FROM article_links` — truncate semua data
2. `SELECT id, slug, content FROM articles WHERE deleted IS NULL AND status != 'Archived'`
3. Untuk setiap artikel: `extractLinks()` → `resolveBlogSlug()` → `inArray lookup` → batch INSERT
4. Return `{ articlesProcessed: N, totalLinksCreated: M }`

**Kapan digunakan**:

- Migrasi data awal saat fitur pertama diaktifkan
- Recovery jika tabel tidak sinkron karena bug
- Setelah perubahan slug massal

## 12.4 Shared Utility: article-links.ts

| Fungsi                            | Visibility | Deskripsi                                                                  |
| --------------------------------- | ---------- | -------------------------------------------------------------------------- |
| `extractLinks(html)`              | Exported   | Parse HTML → array `{ href, text }`. Support double, single, unquoted href |
| `resolveBlogSlug(href)`           | Exported   | Ekstrak slug dari `/blog/{slug}` atau `domain/blog/{slug}`                 |
| `populateArticleLinks(articleId)` | Exported   | Write path: populate article_links untuk 1 artikel                         |
| `rebuildAllArticleLinks()`        | Exported   | Rebuild massal: truncate + populate semua artikel                          |

---

# 13. Future Improvements

- **Persist Link Suggestions**: Simpan rekomendasi yang sudah di-approve content manager untuk tracking.
- **AI-powered Suggestions**: Gunakan vector embeddings (PGVector / OpenAI) untuk semantic search yang lebih akurat.
- **Visual Node Graph**: D3.js / vis.js network graph untuk visualisasi relasi pillar-cluster.
- **Weekly Report**: Laporan otomatis via email untuk health score pillar-cluster.
