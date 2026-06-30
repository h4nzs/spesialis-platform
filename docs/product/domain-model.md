# Domain Model

**Project:** Specialist Platform

**Version:** 1.0

---

# 1. Purpose

Dokumen ini mendeskripsikan model bisnis utama (Domain Model) yang menjadi dasar perancangan Database, API, dan implementasi Backend.

Domain Model bukan representasi tabel database, tetapi representasi hubungan antar objek bisnis.

---

# 2. Core Domains

Platform terdiri dari beberapa domain utama.

```text
Authentication

Users

Customers

Corporate

Partners

Services

Orders

Assignments

Payments

Reviews

Complaints

Notifications

CMS

Media

SEO
```

---

# 3. User Domain

```text
User
│
├── Customer
├── Corporate User
├── Partner
└── Admin
```

Semua pengguna berasal dari entitas **User**.

Perbedaan ditentukan berdasarkan Role.

Role:

- customer
- partner
- corporate
- admin
- dispatcher
- finance
- content_manager
- super_admin

---

# 4. Customer Domain

```text
Customer
│
├── Addresses
├── Orders
├── Reviews
├── Complaints
└── Notifications
```

Customer dapat memiliki banyak alamat dan banyak order.

---

# 5. Corporate Domain

```text
Company
│
├── Branches
├── Users
├── Orders
├── Contracts
└── Invoices
```

Satu perusahaan dapat memiliki banyak cabang.

Setiap cabang dapat memiliki banyak order.

---

# 6. Partner Domain

```text
Partner
│
├── Skills
├── Documents
├── Coverage Areas
├── Ratings
├── Penalties
├── Assignments
└── Earnings
```

Partner adalah tenaga profesional yang menerima assignment.

---

# 7. Service Domain

```text
Category
│
└── Service
        │
        ├── FAQ
        ├── Gallery
        ├── SEO
        ├── Base Price
        └── Warranty
```

Service bersifat dinamis.

Admin dapat menambah service baru tanpa deploy ulang.

---

# 8. Order Domain

```text
Order
│
├── Customer
├── Address
├── Order Items
├── Assignment
├── Payment
├── Timeline
├── Review
├── Complaint
└── Warranty
```

Order menjadi pusat seluruh transaksi.

---

# 9. Assignment Domain

```text
Assignment
│
├── Order
└── Partner
```

Satu Order dapat memiliki banyak histori Assignment.

Contoh.

Partner A Reject.

↓

Partner B Accept.

Histori tetap tersimpan.

---

# 10. Payment Domain

```text
Payment
│
├── Order
├── Method
├── Amount
├── Status
└── Evidence
```

MVP:

Manual Payment.

Future:

Payment Gateway.

---

# 11. Review Domain

```text
Review
│
├── Customer
├── Order
└── Rating
```

Satu Order maksimal memiliki satu Review.

---

# 12. Complaint Domain

```text
Complaint
│
├── Order
├── Customer
├── Status
└── Resolution
```

Complaint memiliki lifecycle sendiri.

---

# 13. Notification Domain

```text
Notification
│
├── Customer
├── Partner
├── Corporate
└── Admin
```

Notification bersifat generic.

Channel:

- Email
- WhatsApp
- Push
- In App

---

# 14. CMS Domain

```text
Article
│
├── Category
├── Author
├── SEO
├── Media
└── Tags
```

CMS sepenuhnya dikelola melalui Directus.

---

# 15. Media Domain

```text
Media
│
├── Images
├── Documents
├── Videos
└── Attachments
```

Semua file menggunakan Media Library.

Entity lain hanya menyimpan media_id.

---

# 16. Aggregate Roots

Aggregate utama platform:

- User
- Company
- Partner
- Service
- Order
- Article

Semua transaksi utama dimulai dari Aggregate tersebut.

---

# 17. Relationships Summary

```text
User
│
├── Customer
│       │
│       ├── Orders
│       ├── Reviews
│       └── Addresses
│
├── Partner
│       │
│       ├── Skills
│       ├── Assignments
│       └── Ratings
│
└── Company
        │
        ├── Branches
        ├── Users
        └── Orders
```

---

# 18. Future Domains

- Mobile
- AI Dispatcher
- Loyalty
- Subscription
- Referral
- Dynamic Pricing
- Marketplace

---

# 19. Engineering Notes

Domain Model menjadi acuan utama untuk:

- Database Design
- REST API
- Directus Collections
- Frontend State
- AI Agent Development

Perubahan Domain Model harus dilakukan sebelum perubahan Database Schema.
