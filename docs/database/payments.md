# Database Documentation

# Table: payments

Version: 1.0

---

# Purpose

Menyimpan seluruh transaksi pembayaran.

Pada MVP pembayaran dilakukan secara manual.

---

# Columns

id

order_id

method

amount

status

payment_date

proof_media_id

verified_by

verified_at

notes

created_at

updated_at

---

# Payment Status

Waiting

Pending Verification

Paid

Failed

Refunded

---

# Method

Cash

Transfer

QRIS

E-Wallet

Other

---

# Business Rules

Satu Order dapat memiliki lebih dari satu Payment Record.

Record pertama menjadi pembayaran utama.

Semua verifikasi dilakukan Admin.

---

# Relationships

orders

↓

payments

1:N

---

media

↓

payments

N:1

---

users

↓

verified_by

N:1

---

# Future

Midtrans

Xendit

Virtual Account

Auto Verification

Webhook
