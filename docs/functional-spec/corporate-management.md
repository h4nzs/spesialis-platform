# Functional Specification

# Module: Corporate Management

**Module ID:** FS-CORPORATE-001

**Version:** 1.0

**Priority:** ⭐⭐⭐⭐☆

---

# 1. Purpose

Corporate Management mengelola seluruh pelanggan B2B mulai dari Inquiry, Verifikasi, hingga menjadi pelanggan aktif yang dapat melakukan pemesanan layanan secara berkala.

Modul ini dirancang untuk perusahaan yang membutuhkan:

- Maintenance rutin
- Outsourcing teknisi
- Kontrak jangka panjang
- Pembayaran Invoice

---

# 2. Objectives

- Mengelola Corporate Inquiry.
- Verifikasi Perusahaan.
- Mengelola Multi User.
- Mengelola Multi Branch.
- Mengelola Invoice.
- Mengelola Contract.
- Menyediakan Dashboard Corporate.

---

# 3. Actors

Corporate

Admin

Finance

Super Admin

---

# 4. Corporate Lifecycle

```text
Inquiry

↓

Negotiation

↓

Verification

↓

Approved

↓

Corporate Account

↓

Contract

↓

Active Customer
```

---

# 5. Corporate Inquiry

Field.

- Company Name
- PIC Name
- Email
- Phone
- Industry
- Employee Count
- Branch Count
- Service Needed
- Message

---

# 6. Verification

Admin dapat meminta:

- NPWP
- NIB
- SIUP (Opsional)
- Company Profile
- Surat Penunjukan PIC (Opsional)

---

# 7. Company Profile

Data.

- Company Name
- Legal Name
- Tax Number
- Address
- Industry
- Website
- Logo

---

# 8. Branch Management

Satu perusahaan dapat memiliki banyak cabang.

Setiap cabang memiliki:

- Nama
- Alamat
- PIC
- Telepon
- Area

---

# 9. Corporate Users

Satu perusahaan dapat memiliki banyak User.

Role.

- Owner
- Manager
- Staff

---

# 10. Contract

Contract menyimpan.

- Start Date
- End Date
- SLA
- Discount
- Notes

---

# 11. Invoice

Corporate menggunakan Invoice.

Status.

Draft

Issued

Paid

Overdue

Cancelled

---

# 12. Dashboard

Corporate dapat melihat.

- Active Orders
- Invoice
- Contract
- Maintenance History
- Branches

---

# 13. Permissions

| Action        | Corporate | Admin |
| ------------- | --------- | ----- |
| View Company  | Own       | All   |
| Manage Branch | Own       | ✅    |
| View Invoice  | Own       | ✅    |
| View Contract | Own       | ✅    |

---

# 14. API

```http
GET /api/v1/companies

POST /api/v1/companies

PATCH /api/v1/companies/:id

GET /api/v1/companies/:id/invoices

GET /api/v1/companies/:id/contracts
```

---

# 15. Database Dependencies

companies

company_users

branches

contracts

invoices

orders

---

# 16. Acceptance Criteria

- Corporate dapat mengirim Inquiry.
- Admin dapat melakukan Verifikasi.
- Corporate memiliki Dashboard.
- Corporate dapat melihat Invoice.
- Corporate dapat mengelola Branch.
