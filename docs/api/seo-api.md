# SEO API

Base URL: `/api/v1`

---

## SEO Metadata

Role: `admin`, `super_admin`, `content_manager` (requires `seo.meta` permission)

### List SEO Metadata

`GET /seo`

Query: `?entityType=Service&entityId=uuid`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entityType": "Service",
      "entityId": "uuid",
      "metaTitle": "Cuci AC Standar - Spesialis",
      "metaDescription": "Pembersihan AC standar untuk rumah.",
      "canonicalUrl": null,
      "robots": null,
      "ogTitle": null,
      "ogDescription": null,
      "ogImage": null,
      "twitterTitle": null,
      "twitterDescription": null,
      "twitterImage": null,
      "schemaJson": null,
      "createdAt": "2026-07-01T00:00:00Z",
      "updatedAt": "2026-07-01T00:00:00Z"
    }
  ]
}
```

### Get SEO Metadata by ID

`GET /seo/:id`

### Create / Upsert SEO Metadata

`POST /seo`

Body:

```json
{
  "entityType": "Service",
  "entityId": "uuid",
  "metaTitle": "Judul Halaman - Spesialis",
  "metaDescription": "Deskripsi meta halaman...",
  "canonicalUrl": "https://spesialis.id/services/ac-cleaning",
  "robots": "index, follow",
  "ogTitle": "OpenGraph Title",
  "ogDescription": "OpenGraph Description",
  "ogImage": "https://spesialis.id/images/og.jpg",
  "twitterTitle": "Twitter Title",
  "twitterDescription": "Twitter Description",
  "twitterImage": "https://spesialis.id/images/twitter.jpg",
  "schemaJson": { "@type": "Service", "name": "..." }
}
```

Jika entityType + entityId sudah ada → update. Jika belum → insert.

### Update SEO Metadata (Partial)

`PATCH /seo/:id`

Body: Partial fields dari create schema.

### Delete SEO Metadata

`DELETE /seo/:id`

---

## Sitemap Settings (Public)

No auth required. Returns sitemap priority/changefreq configuration from system_settings.

`GET /sitemap-settings`

Response:

```json
{
  "success": true,
  "data": {
    "staticPages": { "priority": "1.0", "changefreq": "weekly" },
    "services": { "priority": "0.8", "changefreq": "weekly" },
    "articles": { "priority": "0.7", "changefreq": "weekly" },
    "blogListing": { "priority": "0.8", "changefreq": "daily" },
    "cmsPages": { "priority": "0.6", "changefreq": "monthly" },
    "indexnow": { "key": "uuid-key", "enabled": true }
  }
}
```

---

## IndexNow

Role: `admin`, `super_admin` (requires `seo.indexnow` permission)

### Get/Create IndexNow Key

`GET /indexnow/key`

Auto-generates key if none exists. Returns key location URL.

### Get IndexNow Ping Logs

`GET /indexnow/logs`

Returns last 50 ping attempts with statistics (total, success, error, successRate).

---

## Redirect Management

Role: `admin`, `super_admin` (requires `seo.redirects` permission)

### List Redirects

`GET /admin/redirects`

Query: `?page=1&limit=20&search=/old-path`

### Get Redirect

`GET /admin/redirects/:id`

### Create Redirect

`POST /admin/redirects`

Body:

```json
{
  "sourcePath": "/old-page",
  "targetPath": "/new-page",
  "statusCode": 301,
  "isActive": true,
  "notes": "Optional notes"
}
```

### Update Redirect

`PATCH /admin/redirects/:id`

### Delete Redirect

`DELETE /admin/redirects/:id`

---

## 404 Monitor (Page Errors)

Role: `admin`, `super_admin`, `content_manager` (requires `seo.404_monitor` permission)

### List Page Errors

`GET /admin/page-errors`

Query: `?page=1&limit=20&search=/broken`

### Get Page Error Stats

`GET /admin/page-errors/stats`

Response:

```json
{
  "success": true,
  "data": {
    "total": 150,
    "topPaths": [{ "path": "/old-link", "count": 25, "lastSeen": "..." }],
    "last24h": 12
  }
}
```

### Delete Page Error

`DELETE /admin/page-errors/:id`

### Clear All Page Errors

`DELETE /admin/page-errors/all`
