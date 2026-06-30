# docs/api/cms-api.md

# CMS API

Base URL

/cms/api/v1

> **Catatan:** Nginx me-route `/cms/*` ke Directus (lihat `infrastructure/docker/nginx/default.conf`).

---

GET /articles

POST /articles

PATCH /articles/:id

DELETE /articles/:id

---

GET /services

POST /services

PATCH /services/:id

DELETE /services/:id

---

GET /categories

POST /categories

PATCH /categories/:id

DELETE /categories/:id

---

GET /faq

POST /faq

PATCH /faq/:id

DELETE /faq/:id

---

GET /media

List media.

---

POST /media

Upload file.

Content-Type: multipart/form-data

Field: file (binary)

Response: `{ id, filename, mime_type, size, url }`

---

DELETE /media/:id

Hapus file + metadata.
