# .ai/context.md

# Specialist Platform

Version: 1.0

Status: Source of Truth

---

# Project Summary

Specialist Platform merupakan platform layanan jasa profesional berbasis web yang menghubungkan Customer, Partner (Mitra), Corporate, dan Admin dalam satu sistem.

Platform bukan sekadar Company Profile.

Platform adalah Operational Platform.

Target jangka panjang:

- Booking Platform
- Corporate Maintenance Platform
- Outsourcing Platform
- Mobile App
- AI Dispatcher

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
| Frontend      | Astro 5, React 19, Tailwind CSS 4 |
| API Layer     | Hono                              |
| CMS Layer     | Directus                          |
| Database      | PostgreSQL 17                     |
| Storage       | Cloudflare R2                     |
| Infrastruktur | Docker Compose, Nginx             |
| Monorepo      | pnpm, Turborepo                   |

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

Hono API (apps/api) + Directus (apps/cms)

CMS Content

↓

Directus (apps/cms)

---

# Repository Structure

```
apps/
├── web/      # Astro Frontend — Website & Dashboards
├── api/      # Hono API — Business Logic Layer
└── cms/      # Directus — CMS & Admin Panel

packages/
├── config/       # Shared config (ESLint, Prettier, TS, Tailwind)
├── database/     # Schema, Migration, Seed
├── shared/       # Shared utilities (pure TS)
├── types/        # Shared TypeScript types
├── ui/           # Shared UI components
└── validation/   # Zod validation schemas

docs/             # Dokumentasi lengkap
infrastructure/   # Docker, Nginx config
scripts/          # Dev, build, deploy, backup scripts
tools/            # Generator, migration, seed CLI
.ai/              # AI Agent konfigurasi & prompts
```

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

# AI Goal

Generate Production Ready Code.

Never Prototype Code.

Never Demo Code.

Always Assume Production.

---

# Forbidden

Never use any.

Never hardcode.

Never duplicate.

Never ignore error.

Never bypass validation.

Never expose secret.

Never disable strict mode.

---

# Quality Target

Readable

Maintainable

Secure

Scalable

Testable

Reusable

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
