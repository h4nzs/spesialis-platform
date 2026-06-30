# AI Agent Guide

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Dokumen ini mendefinisikan aturan kerja seluruh AI Agent yang terlibat dalam pengembangan project.

Termasuk.

- ChatGPT
- Claude Code
- Cursor
- Codex
- Gemini CLI
- Continue
- Cline

Semua AI Agent wajib mengikuti dokumen ini.

---

# Primary Objective

AI Agent harus menghasilkan code yang:

Production Ready.

Readable.

Maintainable.

Secure.

Scalable.

Consistent.

---

# Priority Order

Saat mengambil keputusan.

Gunakan prioritas berikut.

1.

Business Rules

↓

2.

Functional Specification

↓

3.

Architecture

↓

4.

Database

↓

5.

Coding Standards

↓

6.

User Prompt

Jika User Prompt bertentangan dengan Architecture.

Jangan langsung mengikuti.

Berikan rekomendasi terlebih dahulu.

---

# AI Responsibilities

AI boleh.

Generate Code.

Refactor.

Documentation.

Testing.

Migration.

Docker.

CI/CD.

Performance.

Security.

---

AI tidak boleh.

Mengubah Business Rule.

Mengubah Database Schema.

Mengubah API.

Menghapus Feature.

Tanpa persetujuan User.

---

# General Rules

Selalu gunakan TypeScript.

Selalu gunakan Strict Mode.

Selalu gunakan Async/Await.

Hindari Callback.

Gunakan Functional Programming apabila memungkinkan.

---

# Before Writing Code

AI harus memahami.

Business Rules.

Functional Spec.

Architecture.

Database Relation.

---

Jika belum jelas.

Tanyakan.

Jangan berasumsi.

---

# Before Creating New File

Periksa.

Apakah file serupa sudah ada.

Jangan membuat duplicate.

---

# Before Editing Existing File

Pahami seluruh file.

Jangan overwrite.

Lakukan perubahan seminimal mungkin.

---

# Code Style

Readable.

Consistent.

Self Documenting.

No Magic Number.

No Hardcoded Secret.

---

# Performance

Minimal Database Query.

Minimal API Call.

Avoid N+1 Query.

Prefer Pagination.

Use Cache apabila diperlukan.

---

# Security

Never Trust Input.

Validate Everything.

Escape Output.

Parameterized Query.

Rate Limiter.

RBAC.

Audit Log.

---

# Frontend Rules

Prefer Astro.

React hanya bila perlu.

Server Rendering lebih diutamakan.

Hydration seminimal mungkin.

---

# Backend Rules

Business Logic.

Backend.

Validation.

Backend.

Permission.

Backend.

---

# Database Rules

Gunakan UUID.

Gunakan Foreign Key.

Gunakan Transaction.

Gunakan Soft Delete.

---

# Documentation Rules

Setiap perubahan besar.

↓

Update Dokumentasi.

↓

Update Code.

Jangan dibalik.

---

# Commit Rules

Gunakan Conventional Commit.

---

# Pull Request Rules

AI harus menjelaskan.

Apa yang berubah.

Kenapa berubah.

Dampaknya.

Breaking Change.

Migration.

---

# Forbidden

Jangan.

Gunakan any.

Hardcode URL.

Hardcode Secret.

Duplicate Code.

Disable TypeScript.

Ignore Error.

Bypass Validation.

Menghapus Security.

---

# Allowed Refactor

Rename Variable.

Extract Function.

Extract Component.

Improve Naming.

Reduce Complexity.

Improve Performance.

Improve Readability.

---

# Complexity

Target.

Cyclomatic Complexity

<10

---

# Response Format

Saat menghasilkan implementasi.

Selalu gunakan format.

Summary

Files Changed

Implementation

Notes

Next Step

---

# Repository Awareness

AI harus menganggap repository memiliki struktur.

apps/

packages/

docs/

infrastructure/

scripts/

tools/

AI tidak boleh membuat struktur baru tanpa persetujuan.

---

# Long Term Goal

Seluruh codebase harus tetap konsisten meskipun dikembangkan oleh banyak Developer maupun AI Agent yang berbeda.

Dokumentasi adalah Source of Truth.

Implementasi mengikuti Dokumentasi.

Bukan sebaliknya.

---

# Final Rule

Jika terdapat konflik antara:

Code

dan

Documentation

Maka AI wajib menganggap Documentation benar, lalu meminta konfirmasi sebelum mengubah implementasi atau dokumentasi.
