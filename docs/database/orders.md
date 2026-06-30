# Database Documentation

# Table: orders

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Tabel `orders` merupakan Aggregate Root utama dalam sistem.

Seluruh proses bisnis berpusat pada tabel ini.

Order menyimpan hubungan antara:

- Customer
- Service
- Partner
- Payment
- Review
- Complaint
- Timeline

Semua modul lain bergantung pada tabel ini.

---

# Primary Key

id UUID PRIMARY KEY

---

# Foreign Keys

customer_id

↓

customer_profiles.id

address_id

↓

addresses.id

partner_id

↓

partner_profiles.id

company_id

↓

companies.id (nullable)

created_by

↓

users.id

updated_by

↓

users.id

---

# Columns

| Column          | Type          | Nullable | Description      |
| --------------- | ------------- | -------- | ---------------- |
| id              | UUID          | No       | Primary Key      |
| booking_number  | VARCHAR(30)   | No       | Booking Number   |
| customer_id     | UUID          | No       | Customer         |
| company_id      | UUID          | Yes      | Corporate        |
| address_id      | UUID          | No       | Service Address  |
| partner_id      | UUID          | Yes      | Assigned Partner |
| status          | VARCHAR(40)   | No       | Current Status   |
| booking_date    | DATE          | No       | Requested Date   |
| booking_time    | VARCHAR(20)   | No       | Requested Time   |
| base_price      | NUMERIC(12,2) | No       | Estimation       |
| final_price     | NUMERIC(12,2) | Yes      | Final Price      |
| discount_amount | NUMERIC(12,2) | No       | Discount         |
| notes           | TEXT          | Yes      | Customer Note    |
| internal_notes  | TEXT          | Yes      | Admin Only       |
| completed_at    | TIMESTAMP     | Yes      | Finish Time      |
| closed_at       | TIMESTAMP     | Yes      | Closed Time      |
| created_at      | TIMESTAMP     | No       | Created          |
| updated_at      | TIMESTAMP     | No       | Updated          |
| deleted_at      | TIMESTAMP     | Yes      | Soft Delete      |

---

# Status

Draft

Pending Confirmation

Confirmed

Waiting Assignment

Partner Assigned

Partner Accepted

On The Way

Working

Completed

Waiting Payment

Paid

Closed

Cancelled

Rejected

Expired

---

# Status Flow

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

---

# Relationships

orders

↓

customer_profiles

N : 1

---

orders

↓

partner_profiles

N : 1

---

orders

↓

addresses

N : 1

---

orders

↓

order_items

1 : N

---

orders

↓

payments

1 : N

---

orders

↓

assignments

1 : N

---

orders

↓

reviews

1 : 1

---

orders

↓

complaints

1 : N

---

orders

↓

order_status_history

1 : N

---

orders

↓

audit_logs

1 : N

---

# Constraints

booking_number UNIQUE

status NOT NULL

customer_id NOT NULL

address_id NOT NULL

booking_date NOT NULL

booking_time NOT NULL

---

# Business Rules

Booking Number bersifat unik.

Order tidak boleh dihapus permanen.

Harga Final hanya dapat diubah Admin.

Partner hanya boleh melihat Order miliknya.

Customer hanya boleh melihat Order miliknya.

Corporate hanya boleh melihat Order perusahaan miliknya.

---

# Validation Rules

Booking Date tidak boleh di masa lalu.

Booking Time wajib dipilih.

Final Price tidak boleh negatif.

Discount tidak boleh lebih besar dari Final Price.

---

# Searchable Columns

booking_number

customer_name

phone

partner_name

service_name

status

---

# Index

booking_number

customer_id

partner_id

status

booking_date

company_id

created_at

---

# Soft Delete Policy

Menggunakan deleted_at.

Order tidak pernah dihapus permanen.

---

# Audit Policy

Semua perubahan wajib menghasilkan Audit Log.

Perubahan yang dicatat.

- Status
- Harga
- Assignment
- Payment
- Complaint

---

# Timeline Policy

Setiap perubahan Status menghasilkan record baru pada:

order_status_history

Timeline tidak boleh diedit.

Timeline tidak boleh dihapus.

---

# Example Record

Booking Number

SP-2026-000001

Customer

John Doe

Service

Cleaning AC

Status

Working

Partner

Budi Santoso

Final Price

150000

---

# API Dependencies

GET /orders

GET /orders/:id

POST /orders

PATCH /orders/:id

PATCH /orders/:id/status

POST /orders/:id/assign

POST /orders/:id/payment

---

# UI Dependencies

Customer Dashboard

Admin Dashboard

Partner Dashboard

Corporate Dashboard

Order Tracking

---

# Future Enhancements

AI Dispatcher

Dynamic Pricing

ETA

GPS Tracking

Route Optimization

Repeat Booking

Subscription

Warranty Management
