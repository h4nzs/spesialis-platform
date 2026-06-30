# Coding Standards

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Dokumen ini menjadi standar wajib seluruh developer dan AI Agent dalam menulis kode.

Seluruh Pull Request wajib mengikuti standar ini.

---

# General Principles

- Clean Code
- SOLID
- DRY
- KISS
- YAGNI
- Composition over Inheritance
- Explicit > Implicit

---

# Tech Stack

Frontend

- Astro 7
- React 19
- TypeScript
- Tailwind CSS 4

Backend

- Directus

Database

- PostgreSQL 17

Infrastructure

- Docker
- Nginx

Package Manager

- pnpm

Monorepo

- Turborepo

---

# Folder Structure

apps/

packages/

docs/

infrastructure/

scripts/

tools/

---

# TypeScript Rules

Always enable Strict Mode.

Never use:

any

Prefer:

unknown

Use:

type

for DTO.

Use:

interface

for object contract.

Prefer Readonly.

Always type function parameter.

Always type return value.

---

Bad

```ts
function get(data) {}
```

Good

```ts
function get(data: User): Promise<Order> {}
```

---

# Naming Convention

Folder

kebab-case

File

kebab-case

Variable

camelCase

Function

camelCase

Component

PascalCase

Interface

PascalCase

Enum

PascalCase

Constant

UPPER_CASE

Database

snake_case

---

# React Rules

Prefer Functional Component.

Never use Class Component.

Prefer Custom Hook.

Keep Component Small.

Maximum:

200 lines.

---

Bad

Huge Component.

---

Good

Split Component.

---

# Astro Rules

Use Astro Component whenever possible.

React hanya digunakan apabila membutuhkan interactivity.

Static First.

Island Architecture.

---

Priority

Astro

↓

React

↓

Client Only

---

# Tailwind Rules

Never inline style.

Never duplicate utility.

Use class-variance-authority apabila Component memiliki banyak Variant.

---

# Component Rules

Component harus:

Single Responsibility.

Reusable.

Typed.

Accessible.

---

Maximum Props

10.

Jika lebih.

Refactor.

---

# Business Logic

Business Logic tidak boleh berada di UI.

UI hanya:

Display.

Interaction.

Validation ringan.

---

Business Logic.

Backend.

---

# API Rules

Never hardcode endpoint.

Use API Client.

Always handle.

Loading.

Error.

Success.

Empty State.

---

# Error Handling

Use Custom Error.

Never ignore Promise.

Always log unexpected error.

---

Bad

```ts
catch {}
```

---

Good

```ts
catch(error){
 logger.error(error)
}
```

---

# Logging

Development

console.log

boleh.

Production

Gunakan Logger.

---

# Database

Never query directly from UI.

Always use API.

Never duplicate schema.

Use UUID.

---

# Security

Never trust client.

Validate server.

Escape output.

Use HTTPS.

Never expose Secret.

Never commit .env.

---

# Performance

Lazy Load.

Code Split.

Image Optimization.

Memoization jika diperlukan.

Avoid unnecessary rerender.

---

# Accessibility

Semantic HTML.

Keyboard Navigation.

Visible Focus.

Alt Image.

ARIA Label.

---

# Git Convention

Branch

feature/

bugfix/

hotfix/

refactor/

docs/

---

Commit

Conventional Commit.

Example.

feat:

fix:

refactor:

docs:

test:

chore:

---

# Code Review Checklist

Readable.

Typed.

Tested.

Reusable.

No Duplicate.

Secure.

Performant.

Accessible.

---

# Maximum File Size

Component

200 lines.

Hook

150 lines.

Utility

100 lines.

Page

300 lines.

Jika lebih.

Refactor.

---

# Comments

Comment WHY.

Not WHAT.

---

Bad

Increment x.

---

Good

Menggunakan exponential backoff untuk menghindari rate limit API.

---

# Testing

Unit Test.

Integration Test.

E2E.

Future.

---

# Documentation

Semua module baru wajib memiliki dokumentasi.

---

# Source of Truth

Jika implementasi berbeda dengan dokumentasi.

Dokumentasi harus diperbarui terlebih dahulu.
