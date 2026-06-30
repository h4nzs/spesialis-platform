# Functional Specification

# Module: Booking

**Module ID:** FS-BOOKING-001

**Version:** 1.0

**Priority:** ⭐⭐⭐⭐⭐ (Critical)

---

# 1. Purpose

Booking Module merupakan inti dari seluruh platform.

Modul ini bertanggung jawab terhadap proses:

- Customer membuat pesanan.
- Admin memverifikasi pesanan.
- Penentuan harga.
- Assignment Partner.
- Monitoring pekerjaan.
- Penyelesaian order.

Seluruh modul lain akan bergantung pada Booking.

> **Referensi:** Untuk perspektif operasional dari sisi Admin / Dispatcher, lihat [Order Management](order-management.md).

---

# 2. Objectives

Booking harus mampu:

- Mendukung Guest Booking.
- Mendukung Customer Booking.
- Mendukung banyak layanan.
- Mendukung banyak alamat.
- Mudah diproses Admin.
- Mudah diassign ke Partner.
- Dapat berkembang menjadi AI Dispatcher.

---

# 3. Actors

Guest

Customer

Admin

Dispatcher

Partner

Corporate (Future)

---

# 4. Booking Lifecycle

```text
Draft

↓

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

Status tambahan.

```text
Cancelled

Rejected

Expired
```

---

# 5. Booking Creation

Booking dapat dibuat oleh:

✅ Guest

✅ Customer

✅ Admin

---

Corporate menggunakan modul Corporate.

---

# 6. Booking Form

Field.

## Customer

- Full Name
- Phone Number
- Email (optional)

---

## Service

- Category
- Service

---

## Location

- Address
- Province
- City
- District
- Postal Code

---

## Schedule

- Today
- Tomorrow
- Custom Date

Jam.

- Morning

- Afternoon

- Evening

---

## Description

Penjelasan masalah.

---

## Photos

Upload.

Maksimal:

10 gambar.

Format.

- jpg

- jpeg

- png

- webp

---

# 7. Booking Validation

Nama wajib.

Nomor HP wajib.

Alamat wajib.

Service wajib.

Foto opsional.

Deskripsi minimal.

10 karakter.

---

# 8. Guest Booking

Guest tidak perlu Login.

Flow.

```text
Landing

↓

Booking

↓

Success

↓

WhatsApp Confirmation

↓

Optional Register
```

Histori Booking tetap dipertahankan apabila Guest Register.

---

# 9. Registered Customer Booking

Flow.

```text
Dashboard

↓

Booking

↓

Address

↓

Submit
```

Alamat dapat dipilih dari Address Book.

---

# 10. Booking Number

Format.

```text
SP-2026-000001
```

Rule.

Prefix.

↓

Tahun.

↓

Running Number.

Booking Number bersifat unik.

---

# 11. Base Price

Setiap Service memiliki Base Price.

Contoh.

```text
Cleaning AC

Rp75.000
```

Base Price hanya estimasi.

---

# 12. Final Price

Admin menentukan.

Harga dapat berubah berdasarkan.

- Lokasi

- Tingkat Kerusakan

- Material

- Transportasi

- Tingkat Kesulitan

---

# 13. Booking Status

| Status               | Description           |
| -------------------- | --------------------- |
| Pending Confirmation | Menunggu Admin        |
| Confirmed            | Sudah dikonfirmasi    |
| Waiting Assignment   | Menunggu Partner      |
| Partner Assigned     | Partner dipilih       |
| Partner Accepted     | Partner menerima      |
| On The Way           | Partner menuju lokasi |
| Working              | Sedang bekerja        |
| Completed            | Pekerjaan selesai     |
| Waiting Payment      | Menunggu pembayaran   |
| Paid                 | Pembayaran diterima   |
| Closed               | Order selesai         |

---

# 14. Status Transition

```text
Pending

↓

Confirmed

↓

Assignment

↓

Accepted

↓

Working

↓

Completed

↓

Payment

↓

Closed
```

Tidak boleh melompati Status.

---

# 15. Cancellation Rules

Customer.

Dapat membatalkan sebelum:

Partner Accepted.

---

Admin.

Dapat membatalkan kapan saja.

---

Partner.

Tidak dapat membatalkan setelah mulai bekerja.

---

# 16. Assignment

Admin memilih Partner.

Flow.

```text
Booking

↓

Select Partner

↓

Notification

↓

Accept

↓

Working
```

---

Partner Reject.

↓

Admin memilih Partner baru.

---

# 17. Notification

Customer.

- Booking dibuat.
- Booking dikonfirmasi.
- Partner Assigned.
- Partner menuju lokasi.
- Order selesai.
- Pembayaran diterima.

---

Partner.

- Assignment baru.
- Jadwal berubah.
- Assignment dibatalkan.

---

Admin.

- Booking baru.
- Partner Reject.
- Complaint.

---

# 18. Timeline

Setiap perubahan Status disimpan.

Contoh.

```text
09.00

Booking Created

↓

09.15

Confirmed

↓

09.30

Assigned

↓

09.45

Accepted

↓

10.10

Working

↓

11.20

Completed
```

Timeline immutable.

---

# 19. Attachments

Booking dapat memiliki.

- Images
- Videos (Future)
- Invoice
- Warranty
- Complaint Evidence

---

# 20. Booking History

Customer dapat melihat.

- Semua Booking.
- Status.
- Harga.
- Partner.
- Invoice.
- Review.

---

# 21. Search

Admin dapat mencari.

- Booking Number
- Customer
- Phone
- Service
- Status
- Partner

---

# 22. Filter

Admin.

Filter berdasarkan.

- Status

- Service

- Partner

- Date

- Payment Status

- Area

---

# 23. Sorting

- Newest

- Oldest

- Highest Price

- Lowest Price

---

# 24. Pagination

Default.

20 data.

Pilihan.

20

50

100

---

# 25. Security

Customer hanya dapat melihat Booking miliknya.

Partner hanya melihat Assignment miliknya.

Admin melihat seluruh Booking.

---

# 26. API

```
POST /api/v1/bookings

GET /api/v1/bookings

GET /api/v1/bookings/:id

PATCH /api/v1/bookings/:id

DELETE /api/v1/bookings/:id
```

---

# 27. Database Dependencies

users

customer_profiles

addresses

services

orders

order_items

assignments

payments

reviews

complaints

notifications

---

# 28. Edge Cases

Customer submit dua kali.

↓

Harus dicegah.

---

Partner Reject.

↓

Assignment baru dibuat.

---

Harga berubah.

↓

Audit Log dibuat.

---

Customer tidak dapat dihubungi.

↓

Status.

Waiting Customer Confirmation.

---

Semua Partner sibuk.

↓

Status.

Waiting Available Partner.

---

# 29. Future Enhancements

- AI Dispatcher

- Dynamic Pricing

- Live Tracking

- ETA

- Push Notification

- WhatsApp Automation

- Repeat Booking

- Favorite Service

---

# 30. Acceptance Criteria

✅ Guest dapat Booking.

✅ Customer dapat Booking.

✅ Admin dapat melihat Booking.

✅ Admin dapat mengubah Status.

✅ Admin dapat menentukan Harga.

✅ Admin dapat Assignment Partner.

✅ Timeline berjalan.

✅ Notification berjalan.

✅ Audit Log berjalan.

---

# 31. Engineering Notes

Booking merupakan **Aggregate Root** terbesar pada platform.

Seluruh modul berikut bergantung pada Booking:

- Assignment
- Payment
- Review
- Complaint
- Notification
- Reporting
- Dashboard
- Analytics

Perubahan pada Booking wajib mempertimbangkan dampaknya terhadap seluruh modul lain.
