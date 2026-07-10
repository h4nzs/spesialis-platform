# Frontend Specification

# SEO

---

# Goals

Lighthouse

90+

Core Web Vitals

Good

Indexable

100%

---

# URL

/services/ac-cleaning

/blog/cara-merawat-ac

---

Slug selalu lowercase.

Slug unik.

---

# Meta

Title

Description

Canonical

Robots

---

# OpenGraph

Title

Description

Image

Type

---

# Twitter Card

Title

Description

Image

---

# Structured Data

## Static JSON-LD (all pages)

Organization

LocalBusiness

WebSite

WebPage

BreadcrumbList

---

## Dynamic JSON-LD (per page type)

Service

FAQ

Article

Review

Blog

---

## Schema Builder (Admin)

Visual builder di admin panel untuk membuat Structured Data.

6 template types:

| Template       | Entity Type           | Key Fields                               |
| -------------- | --------------------- | ---------------------------------------- |
| Article        | schema:Article        | headline, author, datePublished, image   |
| FAQ            | schema:FAQPage        | mainEntity (Question → Answer array)     |
| Service        | schema:Service        | name, description, provider, areaServed  |
| LocalBusiness  | schema:LocalBusiness  | name, address, telephone, openingHours   |
| BreadcrumbList | schema:BreadcrumbList | itemListElement (position + name + item) |
| Organization   | schema:Organization   | name, url, logo, sameAs (social media)   |

Data disimpan di kolom `schema_json` tabel `seo_metadata`.

# Sitemap

Dynamic.

Generated otomatis.

## Sitemap Settings (Admin)

Admin dapat mengatur prioritas & changefreq untuk 5 page types melalui SitemapSettings UI:

| Page Type    | Default Priority | Default Changefreq |
| ------------ | ---------------- | ------------------ |
| Static Pages | 1.0              | weekly             |
| Services     | 0.8              | weekly             |
| Articles     | 0.7              | weekly             |
| Blog Listing | 0.8              | daily              |
| CMS Pages    | 0.6              | monthly            |

Konfigurasi disimpan di `system_settings` (category: `sitemap`).

# IndexNow

Platform mendukung IndexNow protocol untuk notifikasi konten baru ke search engine.

Fitur:

- Auto-generate API key (UUID v4)
- Key location: `https://spesialis.id/{key}.txt`
- Auto-ping saat artikel dipublish
- Dashboard log: success/error rate, timestamps, URLs
- Toggle enable/disable

# SEO Management (Admin Dashboard)

## Permission System

8 permission keys dengan RBAC:

| Permission           | Allowed Roles                       |
| -------------------- | ----------------------------------- |
| seo.meta             | admin, super_admin, content_manager |
| seo.bulk             | admin, super_admin                  |
| seo.audit            | admin, super_admin, content_manager |
| seo.redirects        | admin, super_admin                  |
| seo.404_monitor      | admin, super_admin, content_manager |
| seo.indexnow         | admin, super_admin                  |
| seo.schema           | admin, super_admin, content_manager |
| seo.sitemap_settings | admin, super_admin                  |

Permissions dikelola via RoleManager UI di Settings page. Data disimpan di `system_settings` (category: `seo_permissions`).

## Redirect Management

Admin dapat mengelola redirects:

- Source path (relative URL)
- Target path (relative/absolute URL)
- Status code: 301 (permanent) or 302 (temporary)
- Active/inactive toggle
- Duplicate source path detection
- Middleware auto-redirect di 404 handler
- Di-log ke `page_errors` table untuk monitoring

## 404 Monitor

Automatic 404 tracking:

- Setiap 404 tercatat ke tabel `page_errors`
- Stats: total errors, top 10 paths (by count), last 24h count
- Admin dapat menghapus individual entries atau clear all
- Data: path, referer, user-agent, count, first/last seen

# SEO Analyzer (Shared Utility)

Package: `@specialist/shared` — file: `src/seo-analyzer.ts`

| Function          | Description                                       |
| ----------------- | ------------------------------------------------- |
| slugify           | Convert text to URL-safe slug                     |
| analyzeContent    | Check keyword presence in title, meta, heading    |
| checkReadability  | Sentence/paragraph length analysis                |
| getSnippetPreview | Generate Google-style SERP preview                |
| getScoreColor     | Color coding berdasarkan score (red/yellow/green) |
| getScoreLabel     | Label: Poor / Needs Work / Good / Excellent       |

# Robots.txt

Generated otomatis.

# Performance

Image Optimization.

Code Splitting.

Prefetch.

Lazy Load.

Font Optimization.

# Internal Linking

Related Services.

Related Articles.

FAQ.

# Future

Multi Language SEO.

Geo SEO.

Programmatic SEO.
