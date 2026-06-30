# ADR-0005

# Use Drizzle ORM for Database Access

**Status:** Accepted

**Date:** 2026-06-30

---

## Context

Platform membutuhkan ORM / query builder untuk:

- Type-safe database access
- Migration management
- Schema definition (source of truth)
- Seed data management
- Integrasi dengan Hono (ESM native)

Opsi yang dipertimbangkan:

- **Prisma** — Schema-driven, migration, type-safe. Namun berat, binary dependency, cold start lambat.
- **Kysely** — Type-safe query builder tanpa ORM overhead. Namun tanpa migration tool bawaan, perlu setup tambahan.
- **Drizzle ORM** — Type-safe, ESM native, ringan, migration built-in, schema-first, compatible Hono.

---

## Decision

Gunakan **Drizzle ORM** untuk:

- Definisi schema di `packages/database/src/schema/`
- Migration di `packages/database/src/migrations/`
- Seed data di `packages/database/src/seeds/`
- Query di `apps/api/src/lib/db.ts` (re-export dari packages/database)

---

## Reason

- **ESM native** — sesuai dengan `"type": "module"` di seluruh monorepo.
- **Type-safe penuh** — schema definition = type, tanpa `prisma generate` step terpisah.
- **Ringan** — zero dependency runtime selain `drizzle-orm`.
- **Migration built-in** — `drizzle-kit` untuk generate dan push migration.
- **Hono friendly** — middleware pattern, transaction support, prepared statements.
- **Relation queries** — ` drizzle-orm` supports `relations` for eager loading.

---

## Consequences

Positif:

- Schema di TypeScript, bukan DSL terpisah — source of truth tetap di code.
- Migration versi terkelola — file SQL + TypeScript migration.
- Tidak ada binary dependency — cocok untuk serverless/edge di masa depan.
- Cold start cepat — tidak perlu generate seperti Prisma.

Negatif:

- Tim perlu belajar Drizzle syntax (berbeda dari Prisma).
- Tidak ada visual editor untuk schema (berbeda dari Prisma Studio / Directus).
- Relasi perlu didefinisikan manual di schema (tidak otomatis dari FK).

---

## Package Structure

```
packages/database/
├── src/
│   ├── schema/
│   │   ├── index.ts          — re-export all tables
│   │   ├── users.ts
│   │   ├── orders.ts
│   │   ├── assignments.ts
│   │   ├── payments.ts
│   │   └── ...
│   ├── migrations/
│   │   ├── 0000_init.sql
│   │   └── meta/
│   ├── seeds/
│   │   ├── index.ts
│   │   ├── services.ts
│   │   └── admin.ts
│   └── client.ts             — Drizzle instance export
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## Alternatives

| Kriteria           | Drizzle | Prisma | Kysely |
| ------------------ | ------- | ------ | ------ |
| ESM Native         | ✅      | ⚠️     | ✅     |
| Type Safety        | ✅      | ✅     | ✅     |
| Migration Built-in | ✅      | ✅     | ❌     |
| Cold Start         | Fast    | Slow   | Fast   |
| Binary Dependency  | ❌      | ✅     | ❌     |
| Relation Queries   | ✅      | ✅     | ❌     |
| Hono Integration   | ✅      | ⚠️     | ✅     |

---
