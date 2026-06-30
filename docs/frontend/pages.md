# Frontend Specification

# Pages

Project: Specialist Platform

Version: 1.0

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

/

Homepage

---

/services

Daftar seluruh layanan.

---

/services/[slug]

Detail layanan.

Static Generated.

SEO Optimized.

---

/about

Tentang perusahaan.

---

/contact

Kontak.

---

/faq

FAQ.

---

/blog

Daftar artikel.

---

/blog/[slug]

Detail artikel.

---

/tracking

Lacak Order.

Guest dapat mengakses.

---

/login

Login.

---

/register

Register Customer.

---

/partner/register

Registrasi Mitra.

---

/corporate

Landing Corporate.

---

/corporate/inquiry

Form Inquiry.

---

# Customer Pages

/dashboard

Overview.

---

/dashboard/orders

Riwayat Order.

---

/dashboard/orders/[id]

Detail Order.

---

/dashboard/profile

Profil.

---

/dashboard/addresses

Address Book.

---

/dashboard/security

Password.

---

# Partner Pages

/partner

Dashboard.

---

/partner/jobs

Assignment.

---

/partner/jobs/[id]

Detail Assignment.

---

/partner/profile

Profil.

---

/partner/earnings

Pendapatan.

---

/partner/settings

Setting.

---

# Corporate Pages

/corporate/dashboard

Overview.

---

/corporate/orders

Orders.

---

/corporate/invoices

Invoice.

---

/corporate/branches

Cabang.

---

/corporate/profile

Company Profile.

---

# Error Pages

404

500

Maintenance

Unauthorized

Forbidden

---

# Loading States

Skeleton Loader.

Progress Bar.

Optimistic UI.

---

# Route Protection

Guest.

Public.

Authenticated.

Role Based.
