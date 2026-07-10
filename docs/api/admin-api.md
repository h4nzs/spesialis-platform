# docs/api/admin-api.md

# Admin API

Base URL: `/api/v1/admin`

Semua endpoint memerlukan role `admin`, `super_admin`, atau `finance`/`content_manager`/`dispatcher` sesuai konteks.

---

## Dashboard

`GET /dashboard` — Ringkasan dashboard (total users, bookings, revenue, dll).

`GET /dashboard/activity` — Aktivitas terbaru (dari audit log).

---

## Reports

Role: `admin`, `super_admin`

`GET /reports` — Laporan analitik.

Response:

```json
{
  "summary": {
    "totalOrders": 150,
    "totalPartners": 25,
    "avgRating": 4.5,
    "totalCompletedJobs": 320
  },
  "revenueByMonth": [{ "month": "2026-01", "order_count": 12, "revenue": 2400000 }],
  "ordersByStatus": [{ "status": "Completed", "count": 80 }],
  "ordersByDay": [{ "day": "2026-07-01", "count": 5 }],
  "topServices": [{ "name": "Cuci AC", "slug": "cuci-ac", "category": "AC", "order_count": 45 }]
}
```

---

## Audit Logs

Role: `admin`, `super_admin`

`GET /audit-logs` — Log aktivitas paginated dengan filter.

Query: `?page=1&limit=20&action=LOGIN&entity=user&dateFrom=2026-01-01&dateTo=2026-12-31`

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "action": "LOGIN",
      "entity": "user",
      "entityId": "uuid",
      "oldValue": null,
      "newValue": null,
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/...",
      "createdAt": "2026-07-01T10:00:00Z",
      "userEmail": "admin@test.com",
      "userRole": "admin"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

## Users

`GET /users` — List user dengan filter role dan status.

Query: `?page=1&limit=50&search=email&role=customer&status=active`

`PATCH /users/:id/status` — Ubah status user (active / suspended / banned).

---

## Settings

`GET /settings` — Ambil system settings.

`PATCH /settings` — Update system settings.

---

## Articles

`GET /articles` — List artikel (admin — semua status, termasuk draft).

`POST /articles` — Buat artikel baru.

`GET /articles/:id` — Detail artikel.

`PATCH /articles/:id` — Update artikel.

`DELETE /articles/:id` — Soft delete artikel.

### Article Categories

`GET /articles/categories` — List kategori artikel.

`POST /articles/categories` — Buat kategori baru.

`PATCH /articles/categories/:id` — Update kategori.

`DELETE /articles/categories/:id` — Hapus kategori.

---

## CMS Pages

Role: `admin`, `super_admin`, `content_manager`

`GET /cms-pages` — List semua CMS pages (paginated).

`POST /cms-pages` — Buat CMS page baru.

Body:

```json
{
  "title": "Halaman Baru",
  "slug": "halaman-baru",
  "content": "<h2>Konten...</h2>",
  "meta": { "description": "Deskripsi" },
  "status": "Published"
}
```

`GET /cms-pages/:id` — Detail CMS page.

`PATCH /cms-pages/:id` — Update CMS page.

`DELETE /cms-pages/:id` — Soft delete CMS page.

Default seed: 4 system pages (tentang-kami, syarat-ketentuan, kebijakan-privasi, kontak) via `pnpm --filter @specialist/database db:seed-pages`.

---

## FAQ

Role: `admin`, `super_admin`, `content_manager`

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
  "isActive": "true | false"
}
```

`PATCH /faq/:id` — Update FAQ (partial).

`DELETE /faq/:id` — Soft delete FAQ. Role: `admin`, `super_admin`

---

## Services

Role: `admin`, `super_admin`

`GET /services` — List layanan (paginated).

Query: `?page=1&limit=50&categoryId=uuid`

`GET /services/:id` — Detail layanan.

`POST /services` — Buat layanan baru.

`PATCH /services/:id` — Update layanan.

`DELETE /services/:id` — Soft delete layanan.

---

## Service Categories

Role: `admin`, `super_admin`

`GET /service-categories` — List kategori layanan.

`POST /service-categories` — Buat kategori baru.

`PATCH /service-categories/:id` — Update kategori.

`DELETE /service-categories/:id` — Hapus kategori.

---

## Orders

Role: `admin`, `super_admin`

### Discount

`PATCH /orders/:id/discount` — Terapkan diskon ke order.

Body (setidaknya satu wajib diisi):

```json
{
  "discountPercent": 10,
  "discountAmount": 50000,
  "note": "Diskon pelanggan tetap"
}
```

Semua perubahan harga tercatat di Audit Log.
