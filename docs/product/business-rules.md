# Business Rules

**Project:** Specialist Platform

**Version:** 1.0

---

# 1. Overview

Dokumen ini mendefinisikan seluruh aturan bisnis (Business Rules) yang menjadi dasar implementasi sistem. Semua modul, API, database, dan antarmuka harus mengacu pada aturan dalam dokumen ini.

---

# 2. Customer Rules

### BR-001 — Guest Booking

Customer diperbolehkan melakukan booking tanpa membuat akun.

Guest wajib mengisi:

- Nama
- Nomor HP
- Alamat
- Jenis layanan

Setelah booking selesai, Guest dapat mengubah dirinya menjadi akun Customer tanpa kehilangan histori order.

---

### BR-002 — Registered Customer

Customer yang telah login dapat:

- Melihat histori order.
- Menyimpan banyak alamat.
- Memberikan review.
- Mengajukan komplain.
- Melacak status order.

---

### BR-003 — Multiple Address

Satu Customer dapat memiliki banyak alamat.

Satu alamat dapat ditandai sebagai Default.

Perubahan alamat tidak mengubah histori order yang sudah dibuat.

---

# 3. Booking Rules

### BR-004 — Booking Creation

Booking dapat dibuat:

- Guest
- Customer
- Admin

Corporate menggunakan alur Inquiry terlebih dahulu.

---

### BR-005 — Booking Status

Status booking mengikuti lifecycle berikut:

```text
Draft
│
▼
Pending Confirmation ────┐
│                        │
▼                        │
Confirmed ───────────────┤
│                        │
▼                        │
Waiting Assignment ──────┤
│                        │
▼                        │
Partner Assigned ────────┤
│         │              │
│         ▼              │
│    (reject) ───────────┤
│                        │
▼                        │
Partner Accepted ────────┤
│                        │
▼                        │
On The Way ──────────────┤
│                        │
▼                        │
Working                  │
│                        │
▼                        │
Completed                │
│                        │
▼                        │
Waiting Payment          │
│                        │
▼                        │
Paid                     │
│                        │
▼                        │
Closed                   │
                         │
Terminal: Cancelled ◄────┘
          Rejected
          Expired
```

---

### BR-006 — Booking Cancellation

Customer dapat membatalkan order apabila pekerjaan belum dimulai.

Admin dapat membatalkan order kapan saja.

Partner tidak dapat membatalkan order yang telah diterima.

---

# 4. Pricing Rules

### BR-007 — Base Price

Setiap layanan memiliki Base Price.

Base Price hanya digunakan sebagai estimasi awal.

---

### BR-008 — Final Price

Harga final ditentukan Admin setelah komunikasi melalui WhatsApp.

Harga final dapat berbeda dari Base Price berdasarkan:

- Lokasi
- Tingkat kesulitan
- Material
- Transportasi
- Kondisi lapangan

---

### BR-009 — Discount

Admin dapat memberikan:

- Diskon nominal
- Diskon persentase

Semua perubahan harga wajib tercatat dalam Audit Log.

---

# 5. Partner Rules

### BR-010 — Registration

Partner dapat mendaftar sendiri melalui website.

Status awal:

Waiting Verification.

---

### BR-011 — Verification

Partner baru dapat menerima pekerjaan setelah diverifikasi Admin.

Dokumen minimal:

- KTP
- Foto Profil

---

### BR-012 — Assignment

Assignment dilakukan manual oleh Admin.

Future:

Auto Assignment.

---

### BR-013 — Reject Assignment

Partner dapat menolak assignment.

Alasan wajib dipilih.

Admin mencari Partner lain.

---

### BR-014 — Availability

Partner dapat mengubah status:

- Available
- Busy
- Vacation
- Offline

Partner selain Available tidak diprioritaskan.

---

# 6. Corporate Rules

### BR-015 — Corporate Registration

Corporate wajib diverifikasi Admin.

Dokumen yang dapat diminta:

- NPWP
- NIB
- Data Perusahaan

---

### BR-016 — Corporate Inquiry

Corporate tidak langsung melakukan booking.

Flow:
Inquiry → Contacted → Negotiation → Converted (akun dibuat) → Order.

Inquiry dilakukan melalui form publik tanpa login.

Admin meng-handle inquiry dengan workflow:

1. **Pending** — Menunggu diproses
2. **Contacted** — Admin menghubungi perusahaan
3. **Negotiation** — Negosiasi harga & kontrak
4. **Converted** — Perusahaan didaftarkan sebagai akun Corporate
5. **Closed** — Inquiry ditutup (tidak jadi)

---

# 7. Payment Rules

### BR-017 — Payment Method

Pada MVP pembayaran dilakukan manual.

Media komunikasi utama adalah WhatsApp untuk operasional (negosiasi, konfirmasi booking, payment).

> **Catatan:** Autentikasi (verifikasi email, reset password) tetap menggunakan Email. WhatsApp dan Email memiliki domain terpisah — bukan pengganti satu sama lain.

---

### BR-018 — Payment Status

Status:

- Waiting
- Pending Verification
- Paid
- Failed
- Refunded (Future)

---

# 8. Review Rules

Customer hanya dapat memberikan review apabila:

- Order Completed.
- Customer Login.

Satu Order hanya memiliki satu Review.

---

# 9. Complaint Rules

Customer dapat membuat Complaint setelah order selesai.

Complaint memiliki status:

- Open
- Investigating
- Resolved
- Closed

---

# 10. Notification Rules

Customer menerima notifikasi saat:

- Booking berhasil dibuat (`booking.created`)
- Booking dikonfirmasi (`booking.confirmed`)
- Partner menuju lokasi (`booking.on-the-way`)
- Pekerjaan dimulai (`booking.in-progress`)
- Pekerjaan selesai (`booking.completed`)
- Booking dibatalkan (`booking.cancelled`)
- Pembayaran diterima/ditolak (`payment.received`)
- Complaint direspon admin (`complaint.resolved`)

Partner menerima notifikasi saat:

- Assignment baru (`booking.assigned`)
- Verifikasi akun (`partner.verified`)

Admin menerima notifikasi saat:

- Booking baru (`booking.new`)
- Partner menolak assignment (`booking.rejected`)
- Pekerjaan dimulai (`booking.in-progress`)
- Pekerjaan selesai (`booking.completed`)
- Booking dibatalkan (`booking.cancelled`)
- Complaint baru (`complaint.new`)
- Pembayaran baru diajukan (`payment.submitted`)
- Partner baru mendaftar (`partner.registered`)

---

# 11. Security Rules

- Password menggunakan Argon2id.
- Soft Delete digunakan pada seluruh data utama.
- Audit Log bersifat immutable.
- Semua komunikasi menggunakan HTTPS.

---

# 12. Future Business Rules

- Dynamic Pricing
- AI Dispatcher
- Loyalty Program
- Referral
- Membership
- Subscription
- Multi Region

---

# 13. Source of Truth

Semua implementasi harus mengikuti Business Rules ini.

Perubahan Business Rules wajib diperbarui sebelum implementasi.
