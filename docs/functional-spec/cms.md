# Functional Specification

# Module: CMS

**Module ID:** FS-CMS-001

**Version:** 1.1

**Priority:** ⭐⭐⭐⭐☆ (High)

---

# 1. Purpose

CMS digunakan Admin untuk mengelola seluruh konten website tanpa melakukan perubahan kode.

---

# 2. Managed Content

CMS mengelola.

- Services
- Categories
- Blog (Articles)
- FAQ
- CMS Pages (System & Custom)
- SEO Metadata
- Media

---

# 3. Service Management

Admin dapat.

- Membuat Service Baru.
- Mengubah Service.
- Menghapus Service (soft delete).
- Mengatur Status Publish.
- Mengatur Featured Service.
- Mengatur Harga Dasar.
- SEO per Service.

Section terkait: Admin Services.

---

# 4. Blog

Field.

- Title
- Slug (auto-generate + manual override)
- Summary (excerpt)
- Content (RichTextEditor — TipTap)
- Cover Image (Media Picker)
- Category
- Tags
- Author (auto dari user login)
- Status: draft / published / archived
- Published At
- SEO Editor (meta title, meta description, OpenGraph)

Editor: `ArticleEditor.tsx` — full page editor, 2-column layout (editor + live preview).

---

# 5. CMS Pages

## 5.1 Overview

CMS Pages memungkinkan Admin mengelola halaman statis website secara dinamis.

### System Pages (4 halaman default)

| Halaman            | Slug                | Sumber Konten Default      |
| ------------------ | ------------------- | -------------------------- |
| Tentang Kami       | `tentang-kami`      | HTML hardcoded di `.astro` |
| Syarat & Ketentuan | `syarat-ketentuan`  | HTML hardcoded di `.astro` |
| Kebijakan Privasi  | `kebijakan-privasi` | HTML hardcoded di `.astro` |
| Kontak             | `kontak`            | HTML hardcoded di `.astro` |

### Flow

```
Admin buka "Halaman" di sidebar → list semua pages
    ↓
Klik "Tambah" → navigate ke /dashboard/admin/cms-pages/new
    ↓
Klik "Edit" → navigate ke /dashboard/admin/cms-pages/edit/:id
    ↓
PageEditor.tsx — full page editor 2 kolom:
  Kolom kiri: form (title, slug, status, content RichTextEditor)
  Kolom kanan: SEO Editor + live preview
    ↓
Simpan → data disimpan di tabel `cms_pages`
    ↓
Website render → coba fetch dari CMS API
    ↓
Jika CMS punya konten → pakai konten CMS
Jika tidak → fallback ke hardcoded HTML di file .astro
```

### Editor

`PageEditor.tsx` — komponen React full page (menggantikan `PageFormModal.tsx` yang menggunakan modal).

Backend: `POST/GET/PATCH/DELETE /api/v1/admin/cms-pages/:id`

Render publik: `GET /api/v1/cms/pages/:slug` — endpoint publik (cached).

---

# 6. SEO

Setiap halaman (Service, Article, CMS Page) memiliki SEO Editor.

Field.

- Meta Title (max 60 karakter)
- Meta Description (max 160 karakter)
- Canonical URL
- Robots
- OpenGraph Title
- OpenGraph Description
- OpenGraph Image
- Twitter Card

SEO Editor komponen: `SEOEditor.tsx` — shared component, digunakan oleh ArticleEditor dan PageEditor.

---

# 7. FAQ

Field.

- Question
- Answer (RichTextEditor)
- Category (booking, akun, pembayaran, mitra, layanan, umum)
- Display Order
- Is Active

Admin dapat mengelola FAQ dari panel.

Public API: `GET /api/v1/cms/faq` — hanya yang `is_active = true`.

---

# 8. Media Library

Menyimpan.

- Images
- PDF
- Documents

Storage.

Development: Local Filesystem.

Production: Cloudflare R2.

Entity `media` menyimpan metadata file. File fisik di storage terpisah.

---

# 9. Publishing Flow

Service / Article:

```
Draft

↓

Published

↓

Archived
```

CMS Pages: langsung Published saat dibuat (tidak ada draft — page harus selalu visible).

---

# 10. Permission

| Action          | Content Manager | Admin | Super Admin |
| --------------- | --------------- | ----- | ----------- |
| Blog            | ✅              | ✅    | ✅          |
| FAQ             | ✅              | ✅    | ✅          |
| CMS Pages       | ✅              | ✅    | ✅          |
| SEO             | ✅              | ✅    | ✅          |
| Media           | ✅              | ✅    | ✅          |
| Services        | ❌              | ✅    | ✅          |
| Categories      | ❌              | ✅    | ✅          |
| Delete Services | ❌              | ✅    | ✅          |

---

# 11. API

```http
## Blog
GET    /api/v1/admin/articles
POST   /api/v1/admin/articles
GET    /api/v1/admin/articles/:id
PATCH  /api/v1/admin/articles/:id
DELETE /api/v1/admin/articles/:id

## CMS Pages
GET    /api/v1/admin/cms-pages
POST   /api/v1/admin/cms-pages
GET    /api/v1/admin/cms-pages/:id
PATCH  /api/v1/admin/cms-pages/:id
DELETE /api/v1/admin/cms-pages/:id

## FAQ
GET    /api/v1/admin/faq
POST   /api/v1/admin/faq
GET    /api/v1/admin/faq/:id
PATCH  /api/v1/admin/faq/:id
DELETE /api/v1/admin/faq/:id

## Public CMS
GET    /api/v1/cms/pages/:slug
GET    /api/v1/cms/faq
GET    /api/v1/cms/articles
GET    /api/v1/cms/articles/:slug
```

---

# 12. Acceptance Criteria

- Admin dapat mengelola seluruh konten (Blog, FAQ, Pages, Services).
- Publish tidak memerlukan deploy ulang.
- SEO dapat diubah tanpa coding.
- Media tersimpan dengan aman.
- CMS Pages memiliki fallback ke hardcoded content.
- Halaman system (tentang-kami, syarat-ketentuan, dll) dapat diedit dari admin.
