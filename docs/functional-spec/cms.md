# Functional Specification

# Module: CMS

**Module ID:** FS-CMS-001

**Version:** 1.0

**Priority:** ⭐⭐⭐⭐☆ (High)

---

# 1. Purpose

CMS digunakan Admin untuk mengelola seluruh konten website tanpa melakukan perubahan kode.

---

# 2. Managed Content

CMS mengelola.

- Services
- Categories
- Blog
- FAQ
- Landing Pages
- SEO Metadata
- Media
- Homepage Banner

---

# 3. Service Management

Admin dapat.

- Membuat Service Baru.
- Mengubah Service.
- Menghapus Service.
- Mengatur Status Publish.

---

# 4. Blog

Field.

- Title
- Slug
- Summary
- Content
- Cover Image
- Category
- Tags
- Author
- Published At

---

# 5. SEO

Setiap halaman memiliki.

- Meta Title
- Meta Description
- Canonical URL
- Robots
- OpenGraph
- Twitter Card

---

# 6. FAQ

Field.

- Question
- Answer
- Category
- Order

---

# 7. Media Library

Menyimpan.

- Images
- PDF
- Documents

Storage.

Development.

Local Filesystem.

Production.

Cloudflare R2.

---

# 8. Homepage Builder

Homepage terdiri dari Section.

- Hero
- Services
- Why Us
- Statistics
- Testimonials
- CTA
- FAQ

Urutan dapat diubah melalui CMS.

---

# 9. Publishing Workflow

```text
Draft

↓

Review

↓

Published

↓

Archived
```

---

# 10. Permission

Content Manager.

- Blog
- FAQ
- SEO

Admin.

Semua.

Super Admin.

Semua termasuk Settings.

---

# 11. API

```http
GET /api/v1/articles

GET /api/v1/services

GET /api/v1/pages

GET /api/v1/faqs
```

---

# 12. Acceptance Criteria

- Admin dapat mengelola seluruh konten.
- Publish tidak memerlukan deploy ulang.
- SEO dapat diubah tanpa coding.
- Media tersimpan dengan aman.
