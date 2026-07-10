# AGENTS.md — Specialist Platform

## Project

Platform layanan jasa profesional (on-demand service booking). Customer, Partner, Corporate, Admin dalam satu ekosistem.

Bahasa sumber: **Indonesia** — docs/, .ai/, dan konteks bisnis menggunakan Bahasa Indonesia.

## Monorepo

- **pnpm** + **Turborepo** — dua apps, enam packages
  ```
  apps/{web (Astro 7), api (Hono)}
  packages/{config, database, shared, types, ui, validation}
  ```
- Semua sub-package ESM (`"type": "module"`)
- Node >=22.12, TypeScript 6 strict (ES2023, Bundler resolution)

## Commands

| Perintah           | Efek                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `pnpm dev`         | `turbo run dev` → astro dev + tsx watch api                                              |
| `pnpm build`       | `turbo run build` → astro build                                                          |
| `pnpm lint`        | `turbo run lint` — ESLint flat config (`packages/config/eslint/`)                        |
| `pnpm typecheck`   | `turbo run typecheck` — `tsc --noEmit` di semua sub-package                              |
| `pnpm test`        | `turbo run test` — Vitest di `packages/{shared,validation}` dan `apps/api`               |
| `pnpm format`      | `prettier --write .`                                                                     |
| Web dev background | `astro dev --background` (dari `apps/web/`), kelola via `astro dev stop / status / logs` |
| API dev            | `tsx watch src/index.ts` di `apps/api/`                                                  |

Pre-commit: husky → lint-staged → `prettier --write` pada staged `*.{js,ts,tsx,json,md}`.  
Commit convention: **Conventional Commits** (`@commitlint/config-conventional`).

## Architecture

````
Astro (apps/web) → Hono (apps/api) → PostgreSQL```

- **Business logic hanya di Hono API.** Astro/React = presentation only.
- **Single PostgreSQL** — shared oleh API dan seluruh service.
- Validation schemas di `packages/validation` — source of truth untuk FE & BE.
- Database schema di `packages/database` — source of truth untuk struktur DB.
- Static First → SSR when needed → React only for interactivity.
- JWT + Argon2id, RBAC (8 roles).

## Source of Truth Priority

1. Business Rules (`docs/product/business-rules.md`)
2. Functional Spec
3. Architecture
4. Database Design
5. Coding Standards
6. User Prompt

Jika dokumentasi vs code bertentangan, **dokumentasi dianggap benar**.

## Code Style (wajib)

- No `any` — prefer `unknown`, `type` untuk DTO, `interface` untuk contract
- Files & folders: **kebab-case**, komponen: PascalCase, variable/fungsi: camelCase, konstanta: UPPER_CASE
- Prettier: semicolons, single quotes, printWidth 100, trailingComma all
- Max: component 200 lines, hook 150, utility 100, page 300
- Comment **WHY** not WHAT
- Jangan hardcode endpoint / secret, jangan duplicate, jangan bypass validation

## Infra

- `docker compose up` — postgres, redis (profile: cache), mailpit (profile: mail), api, web, nginx
- Nginx reverse-proxy: `/api/` routed ke API service
- Storage dev: filesystem; production: Cloudflare R2
- `.env` template di `.env.example`

## Referensi AI Agent

- `.ai/context.md` — konteks proyek lengkap
- `.ai/prompts/implementation.md` — template implementasi
- `.ai/prompts/review.md` — template code review
- `.ai/CLAUDE.md`, `.ai/CURSOR.md`, `.ai/CODEX.md`, `.ai/CHATGPT.md` — role-specific

## Frontend (UI/UX) Note

- Never reproduce another company's layout.
- Never imitate Dribbble shots.
- Never imitate popular SaaS landing pages.
- Never create "AI generated" layouts.
- Every screen should solve the user's problem first.
- Visual uniqueness is mandatory.

Before designing any page ask:

- Who is using this page?
- What is their primary goal?
- What is the fastest path to complete that goal?
- What information creates trust?
- What information is unnecessary?
- Design around those answers.

Never generate sections because they are common.

Every section must have a business purpose.

If a section does not improve:

- conversion
- trust
- navigation
- SEO
- usability

it should not exist.

Premium ≠ Fancy

Premium means:

excellent spacing

excellent hierarchy

excellent typography

excellent interactions

excellent responsiveness

excellent accessibility

excellent consistency

Whitespace is a feature.

Never try to fill empty space.

Empty space improves trust.

Empty space improves readability.

Empty space improves perceived quality.

Avoid layouts that look like:

Tailwind UI

Flowbite

Preline

DaisyUI

Bootstrap

Shadcn examples

Random Dribbble clones

Instead create layouts based on business requirements.

After designing every page ask:

Would an experienced designer immediately know this was AI generated?

If yes,

redesign.

Repeat until it feels intentionally designed by humans.

## Status Proyek

**Active development.** API (`apps/api/`) dan Web (`apps/web/`) sudah memiliki implementasi penuh — ~80+ endpoint, ~62 halaman dashboard, full booking lifecycle state machine. `packages/*/src/` sudah terisi (types, database 34 tabel/schema, validation 17+ skema, shared utilities, ui 106+ shared komponen React + Astro).

**Homepage** menggunakan 14+ komponen hardcoded (Hero, ServiceGrid, Statistics, Benefits, Process, FeaturedServices, Testimonials, Coverage, FAQSection, LatestArticles, PartnerCTA, CorporateCTA, FinalCTA, Footer) dengan CMS fallback untuk konten teks. **Homepage Sections (CMS-managed sections) telah dihapus** — homepage dikelola sepenuhnya via komponen Astro.

**CMS Pages (4 system pages): tentang-kami, syarat-ketentuan, kebijakan-privasi, kontak** — dikelola dari admin panel via PageEditor (full page editor, bukan modal). Konten disimpan di tabel `cms_pages` dengan seed default dari hardcoded fallback. Admin dapat mengedit/menambah/menghapus halaman kapan saja.

**SEO Management (full suite):**
- **8 permission keys** — `seo.meta`, `seo.bulk`, `seo.audit`, `seo.redirects`, `seo.404_monitor`, `seo.indexnow`, `seo.schema`, `seo.sitemap_settings` — dikelola via RoleManager UI, middleware `requirePermission()` dengan 30s cache & DB fallback
- **SchemaBuilder** — visual JSON-LD builder dengan 6 template types (Article, FAQ, Service, LocalBusiness, BreadcrumbList, Organization), preview & copy-to-clipboard
- **SitemapSettings** — admin UI untuk prioritas/changefreq 5 page types + IndexNow auto-ping toggle
- **Redirect Management** — CRUD API dengan duplicate detection, middleware auto-redirect di 404 handler
- **404 Monitor** — statistik 404 errors, top paths, last 24h, auto-logging dari setiap 404
- **IndexNow** — API key generation, auto-ping saat artikel dipublish, log ping success/error rate
- Structured data (JSON-LD), OpenGraph, Twitter Card, canonical URL, dynamic sitemap, robots.txt, OG default image

**Partner approve/decline:** Admin dapat menyetujui atau menolak partner. Saat ditolak, modal input alasan muncul — alasan dikirim via API sebagai `note`, partner mendapat notifikasi & email dengan alasan.

**Testing:** Vitest terinstall di `api`, `shared`, `validation` + Playwright E2E (19 spec files, ~160+ tests, 100% P0 coverage, SEO-specific E2E tests).
````
