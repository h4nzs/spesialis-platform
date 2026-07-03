# docs/api/admin-api.md

# Admin API

Base URL

/api/v1/admin

---

GET /dashboard

GET /statistics

GET /reports

GET /activity

GET /users

PATCH /users/:id/status

GET /settings

PATCH /settings

POST /revalidate

POST /cache/clear

---

## Users

GET /users

List user dengan filter role dan status.

Query: ?page=1&limit=50&search=email&role=customer&status=active

---

PATCH /users/:id/status

Ubah status user.

---

## Activity

GET /dashboard/activity

Aktivitas terbaru (dari audit log).

---

## Articles

GET /articles

List artikel (admin — semua status).

---

POST /articles

Buat artikel baru.

---

GET /articles/:id

Detail artikel.

---

PATCH /articles/:id

Update artikel.

---

DELETE /articles/:id

Soft delete artikel.

---

## Article Categories

GET /articles/categories

List kategori artikel.

---

POST /articles/categories

Buat kategori baru.

---

PATCH /articles/categories/:id

Update kategori.

---

DELETE /articles/categories/:id

Hapus kategori.
