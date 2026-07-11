# @ahlipanggilan/config

## Purpose

Package ini menyimpan seluruh konfigurasi bersama yang digunakan oleh semua aplikasi.

---

## Scope

- ESLint
- Prettier
- TypeScript
- Tailwind
- PostCSS
- Docker Environment
- Environment Validation

---

## Structure

packages/config/

eslint/

prettier/

tailwind/

typescript/

env/

---

## Rules

Tidak boleh ada konfigurasi duplicate.

Semua aplikasi wajib mengambil konfigurasi dari package ini.

---

## Export

eslint.config.ts

prettier.config.js

tailwind.config.ts

tsconfig.base.json

env.ts
