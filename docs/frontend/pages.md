# Frontend Specification

# Pages

Project: Specialist Platform

Version: 1.1

Status: Locked

---

# Overview

Frontend dibangun menggunakan Astro.

Semua halaman SEO menggunakan Astro.

Interaksi menggunakan React Islands.

---

# API Client

## Astro Server (SSR)

- Gunakan `fetch()` langsung di Astro component script (`---`).
- Base URL: `import.meta.env.API_URL` (dari env).
- Cookie (JWT) dikirim otomatis oleh browser.

## React Islands (Client)

- Gunakan `@specialist/shared` API Client.
- Token JWT diterima via props dari Astro — jangan akses cookie langsung.
- Setiap request menyertakan header: `Authorization: Bearer <token>`.

## Pattern

```
Astro (server) → fetch(API_URL + path, { headers: { Cookie } })
React Island   → apiClient.get(path, { token })
Hono API       → validasi token → proses → response JSON
```

---

# Public Pages

`/` — Homepage (14+ hardcoded components: Hero, ServiceGrid, Statistics, Benefits, Process, FeaturedServices, Testimonials, Coverage, FAQSection, LatestArticles, PartnerCTA, CorporateCTA, FinalCTA, Footer)

`/services` — Daftar seluruh layanan

`/services/[slug]` — Detail layanan (static generated, SEO optimized)

`/tentang-kami` — Tentang perusahaan (CMS-managed, fallback hardcoded)

`/syarat-ketentuan` — Syarat & Ketentuan (CMS-managed, fallback hardcoded)

`/kebijakan-privasi` — Kebijakan Privasi (CMS-managed, fallback hardcoded)

`/kontak` — Kontak (CMS-managed, fallback hardcoded)

`/faq` — FAQ

`/blog` — Daftar artikel

`/blog/[slug]` — Detail artikel

`/tracking` — Lacak Order (Guest dapat mengakses)

`/login` — Login

`/register` — Register Customer

`/register/partner` — Registrasi Mitra

`/corporate` — Landing Corporate

`/corporate/inquiry` — Form Inquiry

---

# Admin Dashboard Pages

`/dashboard/admin` — Admin Overview (widget: total booking, active orders, waiting assignment, partner available, revenue, corporate inquiry, complaint, pending verification)

`/dashboard/admin/bookings` — Manajemen Booking

`/dashboard/admin/bookings/[id]` — Detail Booking

`/dashboard/admin/orders` — Manajemen Order

`/dashboard/admin/partners` — Daftar Partner (approve/reject dengan modal alasan)

`/dashboard/admin/customers` — Daftar Customer

`/dashboard/admin/services` — Manajemen Layanan

`/dashboard/admin/service-categories` — Kategori Layanan

`/dashboard/admin/articles` — Manajemen Artikel

`/dashboard/admin/articles/new` — Buat Artikel Baru

`/dashboard/admin/articles/edit/[id]` — Edit Artikel

`/dashboard/admin/cms-pages` — Daftar CMS Pages

`/dashboard/admin/cms-pages/new` — Buat CMS Page Baru

`/dashboard/admin/cms-pages/edit/[id]` — Edit CMS Page

`/dashboard/admin/faq` — Manajemen FAQ

`/dashboard/admin/faq/[id]` — Detail/Edit FAQ

`/dashboard/admin/users` — Manajemen User

`/dashboard/admin/media` — Media Library

`/dashboard/admin/reports` — Laporan

`/dashboard/admin/audit-logs` — Log Aktivitas

`/dashboard/admin/penalties` — Manajemen Penalty

`/dashboard/admin/settings` — Pengaturan Sistem + SitemapSettings + RoleManager (SEO permissions)

`/dashboard/admin/seo` — SEO Metadata Management (list, create, edit)

`/dashboard/admin/seo/bulk-edit` — SEO Bulk Edit

`/dashboard/admin/seo/audit` — SEO Audit

`/dashboard/admin/seo/redirects` — Redirect Management

`/dashboard/admin/seo/404-monitor` — 404 Monitor

`/dashboard/admin/dispatcher` — Dispatcher Overview

`/dashboard/admin/finance` — Finance Overview

---

# Customer Pages

`/dashboard` — Overview (active orders, completed orders, pending payment)

`/dashboard/orders` — Riwayat Order

`/dashboard/orders/[id]` — Detail Order

`/dashboard/profile` — Profil

`/dashboard/addresses` — Address Book

`/dashboard/security` — Password

`/dashboard/reviews` — Review

`/dashboard/complaints` — Complaint

---

# Partner Pages

`/partner` — Dashboard (jobs, earnings, availability)

`/partner/jobs` — Assignment List

`/partner/jobs/[id]` — Detail Assignment

`/partner/profile` — Profil + Skills + Documents

`/partner/earnings` — Pendapatan

`/partner/settings` — Setting

---

# Corporate Pages

`/corporate/dashboard` — Overview

`/corporate/orders` — Orders

`/corporate/invoices` — Invoice

`/corporate/branches` — Cabang

`/corporate/contracts` — Kontrak

`/corporate/profile` — Company Profile

---

# Error Pages

`/404` — Not Found

`/500` — Server Error

Unauthorized (redirect ke /login)

Forbidden (403 page)

---

# Loading States

Skeleton Loader.

Progress Bar.

Optimistic UI (React).

---

# Route Protection

- **Public:** Homepage, Services, Blog, FAQ, About, Contact, Tracking, Login, Register
- **Authenticated:** Dashboard (customer/partner/corporate)
- **Role Based:** Admin routes (admin, super_admin, content_manager, dispatcher, finance)

Middleware: Cek JWT cookie, validasi role, redirect jika tidak sesuai.
