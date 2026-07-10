# CMS API

Base URL: `/api/v1/cms`

Semua endpoint CMS publik (tidak memerlukan authentication) — untuk rendering halaman website.

Cache: `Cache-Control: public, max-age=60, stale-while-revalidate=30`

---

## Pages

`GET /pages/:slug` — Ambil konten halaman berdasarkan slug.

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Tentang Kami",
    "slug": "tentang-kami",
    "content": "<h2>Visi Kami</h2><p>...</p>",
    "meta": {
      "description": "Pelajari lebih lanjut tentang Spesialis"
    },
    "status": "Published",
    "createdAt": "2026-07-01T10:00:00Z",
    "updatedAt": "2026-07-01T10:00:00Z"
  }
}
```

404 jika slug tidak ditemukan.

---

## Articles

`GET /articles` — List artikel published (paginated).

Query: `?page=1&limit=20&categoryId=uuid`

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Cara Merawat AC",
      "slug": "cara-merawat-ac",
      "excerpt": "Tips merawat AC agar awet...",
      "coverImage": "https://...",
      "category": "Tips",
      "publishedAt": "2026-07-01T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

`GET /articles/:slug` — Detail artikel by slug.

---

## FAQ

`GET /faq` — List FAQ yang aktif.

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "question": "Apa itu Spesialis?",
      "answer": "Spesialis adalah platform...",
      "category": "umum",
      "displayOrder": 1
    }
  ]
}
```

---

# Admin CMS API

Base URL: `/api/v1/admin`

Semua endpoint admin memerlukan role `admin`, `super_admin`, atau `content_manager`.

---

## Articles

`GET /articles` — List artikel (semua status, termasuk draft).

Query: `?page=1&limit=50&status=draft&categoryId=uuid`

`POST /articles` — Buat artikel baru.

Body:

```json
{
  "title": "Cara Merawat AC",
  "slug": "cara-merawat-ac",
  "content": "<p>...</p>",
  "excerpt": "Ringkasan...",
  "coverMediaId": "uuid",
  "categoryId": "uuid",
  "status": "draft"
}
```

`GET /articles/:id` — Detail artikel.

`PATCH /articles/:id` — Update artikel.

`DELETE /articles/:id` — Soft delete artikel.

### Article Categories

`GET /articles/categories` — List kategori.

`POST /articles/categories` — Buat kategori baru.

Body: `{ "name": "Tips", "slug": "tips" }`

`PATCH /articles/categories/:id` — Update kategori.

`DELETE /articles/categories/:id` — Hapus kategori.

---

## CMS Pages

`GET /cms-pages` — List semua CMS pages.

`POST /cms-pages` — Buat CMS page baru.

Body:

```json
{
  "title": "Halaman Baru",
  "slug": "halaman-baru",
  "content": "<h2>Konten...</h2>",
  "meta": { "description": "Deskripsi halaman" },
  "status": "Published"
}
```

`GET /cms-pages/:id` — Detail CMS page.

`PATCH /cms-pages/:id` — Update CMS page.

`DELETE /cms-pages/:id` — Soft delete CMS page.

---

## FAQ

`GET /faq` — List FAQ (paginated, filter by category).

Query: `?page=1&limit=50&category=booking`

`GET /faq/:id` — Detail FAQ.

`POST /faq` — Buat FAQ baru.

Body:

```json
{
  "question": "string",
  "answer": "string",
  "category": "booking | akun | pembayaran | mitra | layanan | umum | null",
  "displayOrder": 0,
  "isActive": true
}
```

`PATCH /faq/:id` — Update FAQ (partial).

`DELETE /faq/:id` — Soft delete FAQ.

---

## Media

`POST /media` — Upload file.

Content-Type: `multipart/form-data`

Field: `file` (binary)

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "filename": "image.jpg",
    "mimeType": "image/jpeg",
    "size": 102400,
    "url": "/uploads/image.jpg",
    "thumbnailUrl": "/uploads/thumbs/image.jpg"
  }
}
```

`DELETE /media/:id` — Hapus file + metadata.
