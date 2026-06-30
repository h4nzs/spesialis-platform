# Functional Specification

# Module: Order Management

**Module ID:** FS-ORDER-001

**Version:** 1.0

**Priority:** ⭐⭐⭐⭐⭐ (Critical)

---

# 1. Purpose

Order Management merupakan modul operasional utama yang digunakan oleh Admin dan Dispatcher untuk mengelola seluruh lifecycle Order mulai dari Booking dibuat hingga Order ditutup.

Modul ini menjadi pusat aktivitas operasional perusahaan.

> **Referensi:** Untuk perspektif pembuatan Booking dari sisi Customer, lihat [Booking](booking.md).

---

# 2. Objectives

Modul harus mampu:

- Mengelola seluruh Order.
- Mengubah Status Order.
- Menentukan Harga Final.
- Melakukan Assignment Partner.
- Melihat Timeline.
- Mengelola Payment.
- Mengelola Complaint.
- Menyimpan Audit Log.

---

# 3. Actors

- Admin
- Dispatcher
- Finance
- Super Admin

Customer dan Partner hanya memiliki akses baca terhadap Order miliknya.

---

# 4. Dashboard

Saat membuka halaman Order Management, Admin melihat:

- Total Order Hari Ini
- Pending Confirmation
- Waiting Assignment
- Working
- Waiting Payment
- Completed
- Cancelled

---

# 5. Order List

Kolom yang ditampilkan.

| Field          | Description   |
| -------------- | ------------- |
| Booking Number | Nomor unik    |
| Customer       | Nama Customer |
| Phone          | Nomor HP      |
| Service        | Jenis layanan |
| Area           | Kota          |
| Partner        | Mitra         |
| Status         | Status Order  |
| Final Price    | Harga         |
| Created At     | Tanggal       |

---

# 6. Search

Admin dapat mencari berdasarkan:

- Booking Number
- Nama Customer
- Nomor HP
- Nama Partner
- Service
- Kota

Search harus realtime.

---

# 7. Filter

Filter yang tersedia.

Status

Service

Partner

Tanggal

Area

Payment Status

Corporate

Guest Booking

---

# 8. Sorting

- Newest
- Oldest
- Highest Price
- Lowest Price

---

# 9. Pagination

Default.

20 data.

Pilihan.

20

50

100

---

# 10. Detail Order

Halaman Detail Order menampilkan.

## Customer

- Nama
- HP
- Email

---

## Address

- Alamat lengkap
- Maps Coordinate
- Catatan Lokasi

---

## Service

- Category
- Service
- Quantity

---

## Price

- Base Price
- Discount
- Final Price

---

## Timeline

Semua perubahan status.

---

## Partner

Partner yang ditugaskan.

---

## Payment

Status pembayaran.

---

## Complaint

Riwayat komplain.

---

## Audit Log

Semua perubahan.

---

# 11. Status Management

Admin dapat mengubah Status.

Flow.

```text
Pending Confirmation

↓

Confirmed

↓

Waiting Assignment

↓

Partner Assigned

↓

Partner Accepted

↓

On The Way

↓

Working

↓

Completed

↓

Waiting Payment

↓

Paid

↓

Closed
```

Status tidak boleh dilompati.

---

# 12. Manual Price

Admin dapat mengubah:

Base Price

↓

Discount

↓

Final Price

Semua perubahan wajib masuk Audit Log.

---

# 13. Assignment

Admin memilih Partner.

Data yang ditampilkan.

- Nama
- Rating
- Distance (Future)
- Status
- Skill

---

Partner menerima notifikasi.

↓

Accept

↓

Working.

---

Reject.

↓

Admin memilih Partner baru.

---

# 14. Timeline

Setiap perubahan menghasilkan Timeline baru.

Contoh.

```text
Booking Created

↓

Confirmed

↓

Price Updated

↓

Partner Assigned

↓

Partner Accepted

↓

Working

↓

Completed

↓

Paid

↓

Closed
```

Timeline tidak boleh dihapus.

---

# 15. Internal Notes

Admin dapat menambahkan Catatan Internal.

Catatan tidak terlihat Customer maupun Partner.

---

# 16. Tags

Order dapat diberi Tag.

Contoh.

- Priority
- VIP
- Warranty
- Complaint
- Repeat Customer

---

# 17. Payment

Admin dapat.

- Update Payment Status
- Upload Bukti
- Menambahkan Catatan

---

# 18. Warranty

Order dapat memiliki Garansi.

Data.

- Durasi
- Tanggal Berakhir
- Status

---

# 19. Complaint

Admin dapat.

- Membuka Complaint
- Mengubah Status
- Menambahkan Resolution

---

# 20. Permissions

| Action      | Admin       | Dispatcher | Finance |
| ----------- | ----------- | ---------- | ------- |
| View        | ✅          | ✅         | ✅      |
| Edit Status | ✅          | ✅         | ❌      |
| Edit Price  | ✅          | ❌         | ❌      |
| Payment     | ✅          | ❌         | ✅      |
| Delete      | Super Admin | ❌         | ❌      |

---

# 21. Export

Admin dapat Export.

- Excel
- CSV

Future.

PDF.

---

# 22. Bulk Action

Admin dapat.

- Bulk Assign
- Bulk Update Status
- Bulk Export

---

# 23. Notifications

Saat Status berubah.

Customer.

Partner.

Corporate.

Menerima notifikasi sesuai konfigurasi.

---

# 24. API

```http
GET /api/v1/orders

GET /api/v1/orders/:id

PATCH /api/v1/orders/:id

POST /api/v1/orders/:id/assign

POST /api/v1/orders/:id/payment

POST /api/v1/orders/:id/timeline
```

---

# 25. Database Dependencies

orders

order_items

assignments

payments

complaints

reviews

notifications

audit_logs

---

# 26. Edge Cases

Partner Reject.

↓

Assignment baru.

---

Harga berubah setelah Customer setuju.

↓

Harus ada Approval ulang.

---

Order sudah Closed.

↓

Tidak dapat diedit.

---

# 27. Acceptance Criteria

- Admin dapat melihat seluruh Order.
- Admin dapat Assignment.
- Admin dapat mengubah Harga.
- Admin dapat mengubah Status.
- Timeline berjalan.
- Audit Log berjalan.
- Payment berjalan.
- Complaint berjalan.

---

# 28. Engineering Notes

Order Management merupakan pusat operasional platform.

Semua perubahan wajib menghasilkan Audit Log dan Timeline.
