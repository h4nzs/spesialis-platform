# Functional Specification

# Module: Payment

**Module ID:** FS-PAYMENT-001

**Version:** 1.0

**Priority:** ⭐⭐⭐⭐⭐ (Critical)

---

# 1. Purpose

Payment Module bertanggung jawab mengelola seluruh proses pembayaran pada platform Specialist.

Pada MVP, pembayaran dilakukan secara manual — Customer mentransfer sejumlah uang ke rekening perusahaan, kemudian mengunggah bukti pembayaran untuk diverifikasi Admin.

---

# 2. Objectives

- Menyediakan pencatatan pembayaran manual.
- Mendukung verifikasi pembayaran oleh Admin / Finance.
- Menyediakan status pembayaran yang jelas.
- Mendukung multiple metode pembayaran.
- Mendukung upload bukti pembayaran (media).
- Menyediakan histori pembayaran.
- Menghubungkan pembayaran dengan workflow Order.
- Menyediakan notifikasi perubahan status pembayaran.

---

# 3. Actors

Customer

Admin

Finance

Super Admin

---

# 4. Payment Flow

```text
Order Completed

↓

Customer Mengajukan Pembayaran

↓

(Optional) Upload Bukti Pembayaran

↓

Admin / Finance Verifikasi

↓

Paid / Failed

↓

Order Closed (jika Paid)
```

---

# 5. Payment Methods

Payment Methods yang didukung:

| Method   | Deskripsi                         |
| -------- | --------------------------------- |
| Cash     | Pembayaran tunai langsung         |
| Transfer | Transfer bank                     |
| QRIS     | Scan QRIS                         |
| E-Wallet | GoPay, OVO, Dana, ShopeePay, dll. |
| Other    | Metode lainnya                    |

---

# 6. Payment Status

| Status               | Deskripsi                            |
| -------------------- | ------------------------------------ |
| Waiting              | Customer telah mengajukan pembayaran |
| Pending Verification | Menunggu verifikasi Admin            |
| Paid                 | Pembayaran telah diverifikasi        |
| Failed               | Pembayaran ditolak Admin             |
| Refunded             | Dana telah dikembalikan (Future)     |

---

# 7. Status Transition

```text
Waiting

↓

Pending Verification

↓

Paid ──┐
│      │
▼      │
Closed  │
        │
Failed ◄┘

Refunded (Future)
```

Transition rules:

- **Waiting** → dapat diverifikasi langsung menjadi **Paid** atau **Failed**.
- **Pending Verification** → dapat diverifikasi menjadi **Paid** atau **Failed**.
- **Paid** → status terminal.
- **Failed** → status terminal (Customer dapat mengajukan ulang).
- **Refunded** → hanya dari **Paid** (Future).

---

# 8. Create Payment

Customer dapat mengajukan pembayaran setelah Order berstatus **Completed** atau **Waiting Payment**.

Field yang wajib diisi:

- Order ID
- Method pembayaran
- Jumlah (amount)

Field opsional:

- Bukti pembayaran (media ID)
- Catatan (notes)

Rules:

- Satu Order hanya dapat memiliki satu Payment Record aktif.
- Jika Customer mencoba membuat Payment kedua, sistem mengembalikan error conflict.
- Setelah Payment dibuat, Order berubah status menjadi **Waiting Payment** (jika sebelumnya Completed).

---

# 9. Verify Payment

Admin atau Finance dapat memverifikasi pembayaran.

Aksi yang tersedia:

- **Paid** — Menerima pembayaran.
  - Status Payment berubah menjadi **Paid**.
  - Status Order berubah menjadi **Paid**.
  - Timeline mencatat perubahan status.

- **Failed** — Menolak pembayaran.
  - Status Payment berubah menjadi **Failed**.
  - Status Order kembali ke **Completed**.
  - Timeline mencatat penolakan dengan catatan.
- **Pending Verification** (reserved) — Status ini didefinisikan dalam tipe data untuk keperluan future, namun pada implementasi MVP saat ini, Payment langsung diverifikasi dari **Waiting** menjadi **Paid** atau **Failed**.

Field:

- Status (Paid / Failed)
- Catatan (notes) — wajib diisi jika Failed

Semua perubahan wajib tercatat dalam Audit Log.

---

# 10. View Payment

Customer hanya dapat melihat Payment miliknya.

Admin / Finance / Super Admin dapat melihat semua Payment.

---

# 11. Notifications

Customer menerima notifikasi saat:

| Event               | Tipe                | Channel        |
| ------------------- | ------------------- | -------------- |
| Pembayaran diajukan | `payment.submitted` | In-App         |
| Pembayaran diterima | `payment.received`  | Email + In-App |
| Pembayaran ditolak  | `payment.received`  | Email + In-App |

Admin menerima notifikasi saat:

| Event                    | Tipe                | Channel |
| ------------------------ | ------------------- | ------- |
| Pembayaran baru diajukan | `payment.submitted` | In-App  |

---

# 12. Permissions

| Action                  | Customer | Partner | Corporate | Finance | Admin  | Super Admin |
| ----------------------- | -------- | ------- | --------- | ------- | ------ | ----------- |
| Create Payment          | ✅ Own   | ❌      | ❌        | ❌      | ✅     | ✅          |
| View Payment            | ✅ Own   | ❌      | ❌        | ✅ All  | ✅ All | ✅ All      |
| Verify Payment (Paid)   | ❌       | ❌      | ❌        | ✅      | ✅     | ✅          |
| Verify Payment (Failed) | ❌       | ❌      | ❌        | ✅      | ✅     | ✅          |

---

# 13. API

```http
POST /api/v1/payments                        — Create payment
GET  /api/v1/payments/:id                    — View payment detail
POST /api/v1/payments/:id/verify             — Verify payment (Paid / Failed)
```

---

# 14. Validation Rules

- Order ID harus UUID valid.
- Method harus salah satu dari: Cash, Transfer, QRIS, E-Wallet, Other.
- Amount harus >= 0.
- Bukti pembayaran (media ID) harus UUID valid (opsional).
- Catatan maksimal 500 karakter.

---

# 15. Edge Cases

**Customer mengajukan pembayaran dua kali**

Sistem mengembalikan error conflict. Satu Order hanya memiliki satu Payment Record.

**Pembayaran ditolak (Failed)**

Status Payment menjadi Failed. Order kembali ke Completed. Customer dapat mengajukan pembayaran ulang.

**Customer melakukan pembayaran sebelum Order selesai**

Sistem tetap menerima, status Order diubah menjadi Waiting Payment.

**Admin memverifikasi pembayaran yang sudah diverifikasi**

Sistem mengembalikan error conflict.

**Customer mengunggah bukti yang salah**

Admin dapat menolak dengan catatan.

**Pembayaran dengan amount tidak sesuai**

Admin dapat menolak dengan catatan untuk meminta pembayaran ulang dengan jumlah yang benar.

---

# 16. Database Dependencies

orders

payments

media

users

---

# 17. Audit Log

Semua perubahan status Payment wajib tercatat di Audit Log.

Data yang dicatat:

- Aksi (payment.verify / payment.reject)
- Entity (payment)
- Entity ID
- Nilai lama (status sebelumnya)
- Nilai baru (status baru, verified_by)

---

# 18. Acceptance Criteria

✅ Customer dapat mengajukan pembayaran.
✅ Customer dapat mengunggah bukti pembayaran.
✅ Admin dapat melihat seluruh pembayaran.
✅ Finance dapat memverifikasi pembayaran.
✅ Status Payment tercatat dengan benar.
✅ Status Order berubah sesuai workflow.
✅ Notifikasi dikirim ke Customer.
✅ Audit Log tercatat.
✅ Notifikasi Admin saat pembayaran baru diajukan.

---

# 19. Future Enhancements

- Payment Gateway (Midtrans / Xendit)
- Virtual Account
- QRIS dinamis
- E-Wallet integration
- Auto Verification
- Webhook
- Refund
- Partial Payment
- Multi Payment
- Recurring Payment (Corporate)
- Invoice Generation

---

# 20. Engineering Notes

Payment Module terintegrasi erat dengan Order Module.

Setiap perubahan status Payment harus memicu perubahan status Order yang sesuai.

Pada MVP, verifikasi dilakukan manual oleh Admin atau Finance.

Untuk production, disarankan menggunakan Payment Gateway agar verifikasi dapat dilakukan otomatis.
