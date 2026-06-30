# AGENTS.md — Specialist Platform

## Project

Platform layanan jasa profesional (on-demand service booking). Customer, Partner, Corporate, Admin dalam satu ekosistem.

Bahasa sumber: **Indonesia** — docs/, .ai/, dan konteks bisnis menggunakan Bahasa Indonesia.

## Monorepo

- **pnpm** + **Turborepo** — tiga apps, enam packages
  ```
  apps/{web (Astro 7), api (Hono), cms (Directus Docker)}
  packages/{config, database, shared, types, ui, validation}
  ```
- Semua sub-package ESM (`"type": "module"`)
- Node >=22.12, TypeScript 6 strict (ES2023, Bundler resolution)

## Commands

| Perintah           | Efek                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| `pnpm dev`         | `turbo run dev` → astro dev + tsx watch api                                              |
| `pnpm build`       | `turbo run build` → astro build                                                          |
| `pnpm lint`        | `turbo run lint` — **saat ini no-op** (belum ada config eslint)                          |
| `pnpm typecheck`   | `turbo run typecheck` — **saat ini no-op** (belum ada script di sub-package)             |
| `pnpm test`        | `turbo run test` — **placeholder only** (belum ada test framework)                       |
| `pnpm format`      | `prettier --write .`                                                                     |
| Web dev background | `astro dev --background` (dari `apps/web/`), kelola via `astro dev stop / status / logs` |
| API dev            | `tsx watch src/index.ts` di `apps/api/`                                                  |

Pre-commit: husky → lint-staged → `prettier --write` pada staged `*.{js,ts,tsx,json,md}`.  
Commit convention: **Conventional Commits** (`@commitlint/config-conventional`).

## Architecture

```
Astro (apps/web) → Hono (apps/api) → PostgreSQL
Astro (apps/web) → Directus (apps/cms) — konten publik (SSG)
```

- **Business logic hanya di Hono API.** Astro/React = presentation only.
- **Single PostgreSQL** — shared oleh API, Directus, dan seluruh service.
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

- `docker compose up` — postgres, redis (profile: cache), mailpit (profile: mail), api, web, cms, nginx
- Nginx reverse-proxy: `/{api,cms}/` routed ke service masing-masing
- CMS: Directus 11.6 via Docker (`directus/directus:11.6.0`)
- Storage dev: filesystem; production: Cloudflare R2
- `.env` template di `.env.example`

## Referensi AI Agent

- `.ai/context.md` — konteks proyek lengkap
- `.ai/prompts/implementation.md` — template implementasi
- `.ai/prompts/review.md` — template code review
- `.ai/CLAUDE.md`, `.ai/CURSOR.md`, `.ai/CODEX.md`, `.ai/CHATGPT.md` — role-specific

## Status Proyek

**Early development.** Sebagian besar `packages/*/src/` dan `apps/cms/` masih kosong. CI hanya lint + typecheck (keduanya no-op saat ini). Belum ada test framework terinstall.
