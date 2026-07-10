# Product Requirements Document (PRD)

**Project Name:** Specialist Platform

**Version:** 1.1

**Status:** Locked

**Last Updated:** 10 July 2026

---

# 1. Executive Summary

## Vision

Membangun platform layanan jasa profesional on-demand yang cepat, terpercaya, transparan, dan scalable untuk kebutuhan rumah tangga maupun perusahaan di Indonesia.

Platform ini tidak hanya menjadi website company profile, tetapi berkembang menjadi platform operasional yang menghubungkan Pelanggan, Mitra, Perusahaan, dan Admin dalam satu ekosistem.

---

# 2. Business Goals

- Mempermudah pelanggan melakukan pemesanan jasa.
- Mempermudah admin mengelola operasional.
- Mempermudah mitra mendapatkan pekerjaan.
- Menyediakan dashboard perusahaan (Corporate Portal).
- Menjadi fondasi ekspansi nasional.

---

# 3. Success Metrics

## Business

- Booking berhasil meningkat setiap bulan.
- Conversion Rate > 15%
- Bounce Rate < 40%
- Repeat Customer > 30%

## Technical

- Lighthouse > 90
- LCP < 2.5s
- CLS < 0.1
- TTFB < 500ms

## SEO

- Semua halaman layanan dapat diindex.
- Dynamic Sitemap.
- Structured Data (JSON-LD).
- OpenGraph / Twitter Card.
- Canonical URL.

---

# 4. Target Users

## Customer (B2C)

Individu yang membutuhkan jasa profesional.

Contoh:

- AC
- Plumbing
- CCTV
- Cleaning
- Listrik
- Renovasi

---

## Corporate (B2B)

Perusahaan yang membutuhkan:

- Maintenance rutin
- Outsourcing teknisi
- SLA
- Invoice
- Kontrak

---

## Partner (Mitra)

Tenaga profesional yang menerima pekerjaan melalui platform.

---

## Admin

Tim operasional yang mengelola:

- Booking
- Assignment
- Pembayaran
- CMS (Blog, FAQ, Pages, Services)
- Customer
- Corporate
- Partner

---

# 5. Scope

## MVP

- Landing Page
- SEO (Structured Data, Sitemap, OpenGraph)
- Booking
- Guest Booking
- Customer Account
- Partner Registration
- Corporate Inquiry
- Dashboard Admin
- Dashboard Customer
- Dashboard Partner
- Dashboard Corporate
- CMS (Articles, FAQ, Pages)
- Blog
- Tracking
- Manual Payment
- Manual Assignment
- Partner Verification (approve/reject dengan alasan)

---

## Future

- Mobile App
- AI Dispatcher
- Live Tracking
- Payment Gateway
- Push Notification
- WhatsApp Automation
- Loyalty Program
- Referral
- Dynamic Pricing

---

# 6. Core Features

## Public

- Homepage (14 komponen hardcoded, tanpa CMS Homepage Sections)
- Services
- Blog
- FAQ
- About (CMS-managed: tentang-kami)
- Syarat & Ketentuan (CMS-managed)
- Kebijakan Privasi (CMS-managed)
- Kontak (CMS-managed)
- Tracking
- Booking

---

## Customer

- Register
- Login
- Booking
- Order History
- Reviews
- Complaint
- Multiple Address

---

## Corporate

- Inquiry
- Dashboard
- Multi Branch
- Invoice
- Maintenance History

---

## Partner

- Registration
- Verification (approve/reject dengan alasan)
- Job List
- Accept / Reject Job
- Availability
- Earnings
- Rating
- Skills & Documents

---

## Admin

- Dashboard
- Booking Management
- Assignment
- CMS (Articles, FAQ, Pages)
- Users
- Services
- Reports
- SEO
- Partner Management
- Audit Logs
- System Settings

---

# 7. Booking Workflow

Customer membuka website.

↓

Memilih layanan.

↓

Mengisi form booking.

↓

Admin menerima order.

↓

Admin menghubungi Customer melalui WhatsApp.

↓

Harga final disepakati.

↓

Admin melakukan assignment Partner.

↓

Partner menerima pekerjaan.

↓

Partner menuju lokasi.

↓

Pekerjaan selesai.

↓

Customer melakukan pembayaran.

↓

Order ditutup.

---

# 8. Payment

MVP menggunakan pembayaran manual.

Pembayaran dilakukan setelah konfirmasi melalui WhatsApp.

Semua metode pembayaran diperbolehkan.

Future:

- Midtrans
- Xendit
- QRIS
- Virtual Account

---

# 9. Assignment

Assignment dilakukan manual oleh Admin.

Partner memiliki pilihan:

- Accept
- Reject

Apabila Reject, Admin memilih Partner lain.

---

# 10. Technology Stack

Frontend

- Astro (Primary — Static First, SEO)
- React (Islands — hanya untuk interaktivitas)
- Tailwind CSS

Backend

- Hono (API Layer — Business Logic)

Database

- PostgreSQL

Deployment

- Docker Compose
- Nginx

Storage

- Cloudflare R2

Package Manager

- pnpm

Monorepo

- Turborepo

---

# 11. Security

- HTTPS
- JWT + Refresh Token (httpOnly Cookie)
- RBAC (8 roles)
- Audit Log
- Soft Delete
- Rate Limiting
- Argon2id Password Hashing

---

# 12. Scalability

Platform harus mampu berkembang menjadi:

- Website
- Admin Panel
- Mobile App
- Public API
- Internal Dashboard

tanpa perubahan arsitektur besar.

---

# 13. Constraints

- Pembayaran masih manual.
- Assignment masih manual.
- WhatsApp menjadi kanal komunikasi utama.
- Fokus area Jabodetabek dan Bandung pada fase awal.
- Homepage menggunakan komponen hardcoded (bukan CMS-managed sections).

---

# 14. Out of Scope (MVP)

- AI Dispatcher
- Payment Gateway
- Mobile App
- Live GPS Tracking
- Multi Language
- Multi Currency

---

# 15. Acceptance Criteria

MVP dianggap selesai apabila:

- Customer dapat melakukan booking.
- Admin dapat mengelola booking.
- Partner dapat menerima pekerjaan.
- Corporate dapat mengirim inquiry.
- CMS dapat mengelola konten (Articles, FAQ, Pages).
- SEO berjalan dengan baik (Structured Data, Sitemap, OpenGraph).
- Dashboard seluruh role dapat digunakan.
- Partner verification dengan alasan penolakan.

---

# 16. Future Roadmap

Phase 1

- MVP Launch ✅ (sebagian besar)

Phase 2

- Payment Gateway
- Notification
- Email Automation

Phase 3

- Mobile App
- AI Assignment

Phase 4

- Nasional Expansion

---

# 17. Document Ownership

Owner: Product Team

Technical Owner: Engineering Team

Source of Truth: Repository Documentation
