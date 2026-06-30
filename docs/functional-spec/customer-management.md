# Functional Specification

# Module: Customer Management

**Module ID:** FS-CUSTOMER-001

**Version:** 1.0

**Priority:** ⭐⭐⭐⭐☆

---

# 1. Purpose

Customer Management digunakan untuk mengelola seluruh data Customer, baik Guest maupun Registered Customer.

Modul ini menjadi sumber utama informasi pelanggan.

---

# 2. Objectives

- Mengelola profil Customer.
- Mengelola Address Book.
- Mengelola histori Order.
- Mengelola Review.
- Mengelola Complaint.
- Mengelola Status Customer.

---

# 3. Customer Types

Guest

Registered Customer

Corporate User (dipisahkan pada modul Corporate)

---

# 4. Customer Profile

Field.

- Full Name
- Email
- Phone
- Avatar
- Birth Date (Future)
- Gender (Future)

---

# 5. Address Book

Customer dapat memiliki banyak Address.

Field.

- Label

- Receiver Name

- Phone

- Full Address

- Province

- City

- District

- Postal Code

- Latitude

- Longitude

- Default

---

# 6. Customer Dashboard

Menampilkan.

- Active Orders
- Completed Orders
- Pending Payment
- Saved Addresses
- Reviews

---

# 7. Customer Status

Active

Suspended

Blocked

Deleted

---

# 8. Order History

Customer dapat melihat.

- Booking Number
- Status
- Service
- Partner
- Price
- Timeline

---

# 9. Review

Customer dapat.

- Memberikan Rating
- Menulis Review
- Upload Foto (Future)

---

# 10. Complaint

Customer dapat.

- Membuat Complaint
- Melihat Progress
- Menambahkan Bukti

---

# 11. Favorite Services (Future)

Customer dapat menyimpan layanan favorit.

---

# 12. Repeat Booking

Customer dapat membuat Booking ulang dari histori Order.

---

# 13. Notifications

Customer menerima.

- Booking Update
- Payment
- Assignment
- Complaint
- Promo (Future)

---

# 14. Admin Features

Admin dapat.

- Melihat seluruh Customer.
- Mengubah Status.
- Melihat histori.
- Menambahkan Catatan Internal.

---

# 15. Search

Admin dapat mencari.

- Nama
- Nomor HP
- Email

---

# 16. Filter

- Active
- Suspended
- Guest
- Registered
- Corporate

---

# 17. Permissions

| Action         | Customer | Admin |
| -------------- | -------- | ----- |
| Edit Profile   | ✅       | ✅    |
| Delete Account | Request  | ✅    |
| View Orders    | Own      | All   |
| Manage Address | Own      | ✅    |

---

# 18. API

```http
GET /api/v1/customers

GET /api/v1/customers/:id

PATCH /api/v1/customers/:id

GET /api/v1/customers/:id/orders

GET /api/v1/customers/:id/addresses
```

---

# 19. Database Dependencies

users

customer_profiles

addresses

orders

reviews

complaints

notifications

---

# 20. Acceptance Criteria

- Customer dapat mengelola profil.
- Customer dapat mengelola alamat.
- Customer dapat melihat histori.
- Customer dapat membuat Review.
- Customer dapat membuat Complaint.
- Admin dapat mengelola seluruh Customer.

---

# 21. Engineering Notes

Guest Customer dan Registered Customer harus menggunakan entitas Customer yang sama agar histori Order tetap terjaga ketika Guest memutuskan membuat akun.
