# .ai/context.md

# Specialist Platform

Version: 1.1

Status: Source of Truth

---

# Project Summary

Specialist Platform merupakan platform layanan jasa profesional berbasis web yang menghubungkan Customer, Partner (Mitra), Corporate, dan Admin dalam satu sistem.

Platform bukan sekadar Company Profile.

Platform adalah Operational Platform.

**Status saat ini:** Active development. Semua fitur inti MVP telah selesai — booking, assignment, payment, CMS, SEO, dashboards.

---

# Perubahan Signifikan

## ✅ Homepage Sections (CMS-managed) telah dihapus

Fitur Homepage Sections (hero, benefits, dll yang bisa diedit via CMS admin) telah dihapus total dari codebase — 15 file dihapus (admin UI, API routes, DB schema, validation, SectionManager component, cache). Homepage sekarang menggunakan komponen hardcoded dengan fallback CMS hanya untuk teks tertentu. Keputusan: performa lebih penting daripada fleksibilitas CMS untuk homepage.

## ✅ CMS Pages system dibuat

4 system pages (tentang-kami, syarat-ketentuan, kebijakan-privasi, kontak) dengan seed script di `packages/database/src/seed-cms-pages.ts`. Admin mengelola via PageEditor (full page editor — bukan modal). Konten CMS fallback ke hardcoded HTML jika tidak ada.

## ✅ PageFormModal diganti PageEditor

PageEditor.tsx adalah full page editor (2 kolom, Card-based, live preview) menggantikan PageFormModal yang berbasis modal. Routing: `/dashboard/admin/cms-pages/new` dan `/edit/:id`.

## ✅ Partner approve/decline dengan modal alasan

Saat admin menolak partner, modal muncul dengan textarea untuk alasan. Alasan dikirim sebagai `note` ke API, partner mendapat notifikasi & email.

## ✅ SEO sudah terpasang

Structured data (JSON-LD), OpenGraph, Twitter Card, canonical URL, dynamic sitemap, robots.txt.

---

# Business Model

Customer

↓

Booking

↓

Admin

↓

Partner

↓

Payment

↓

Review

---

Corporate

↓

Inquiry

↓

Negotiation

↓

Contract

↓

Maintenance

↓

Invoice

---

# Tech Stack

| Layer         | Teknologi                         |
| ------------- | --------------------------------- |
| Frontend      | Astro 7, React 19, Tailwind CSS 4 |
| API Layer     | Hono                              |
| Database      | PostgreSQL 18                     |
| Storage       | Cloudflare R2                     |
| Infrastruktur | Docker Compose, Nginx             |
| Monorepo      | pnpm, Turborepo                   |

---

# Repository Stats

- **62** Astro pages
- **67** API route files
- **34** database schema files
- **106+** shared UI components
- **16** Playwright E2E spec files (~140+ tests)
- **100%** P0 E2E coverage

---

# Development Philosophy

Static First

SSR when needed

React only for Interaction

Performance First

SEO First

Accessibility First

Security First

Scalability First

---

# Architecture Rules

Business Logic

↓

Hono API (apps/api)

UI

↓

Presentation Only

Validation

↓

Hono API (apps/api)

Permission

↓

Hono API (apps/api)

---

# Source of Truth Priority

1 Business Rules

↓

2 Functional Specification

↓

3 Architecture

↓

4 Database

↓

5 Coding Standards

↓

6 User Prompt

Jika User Prompt bertentangan dengan Architecture, jangan langsung ikuti — berikan rekomendasi terlebih dahulu.

---

# Key Documentation

Sebelum memulai implementasi, baca dokumen berikut:

| Prioritas | Dokumen                              |
| --------- | ------------------------------------ |
| 1         | docs/product/business-rules.md       |
| 2         | docs/product/product-requirements.md |
| 3         | docs/architecture/architecture.md    |
| 4         | docs/architecture/database-design.md |
| 5         | docs/development/coding-standards.md |
| 6         | docs/development/ai-agent-guide.md   |
