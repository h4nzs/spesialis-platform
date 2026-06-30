# Database Documentation

# Table: users

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Menyimpan seluruh akun yang dapat melakukan autentikasi ke dalam sistem.

Seluruh Role menggunakan tabel ini.

- Customer
- Partner
- Corporate
- Admin

Profile masing-masing dipisahkan ke tabel lain.

---

# Primary Key

id UUID PRIMARY KEY

---

# Columns

| Column            | Type         | Nullable | Description        |
| ----------------- | ------------ | -------- | ------------------ |
| id                | UUID         | No       | Primary Key        |
| email             | VARCHAR(255) | No       | Email Login        |
| phone             | VARCHAR(30)  | No       | Nomor HP           |
| password_hash     | TEXT         | No       | Argon2 Hash        |
| role              | VARCHAR(50)  | No       | User Role          |
| status            | VARCHAR(30)  | No       | Account Status     |
| email_verified_at | TIMESTAMP    | Yes      | Email Verification |
| last_login_at     | TIMESTAMP    | Yes      | Login terakhir     |
| created_at        | TIMESTAMP    | No       | Created            |
| updated_at        | TIMESTAMP    | No       | Updated            |
| deleted_at        | TIMESTAMP    | Yes      | Soft Delete        |

---

# Constraints

email UNIQUE

phone UNIQUE

role CHECK

status CHECK

---

# Allowed Role

customer

partner

corporate

dispatcher

finance

content_manager

admin

super_admin

---

# Allowed Status

pending

active

blocked

suspended

deleted

---

# Relationships

users

↓

customer_profiles

1 : 1

---

users

↓

partner_profiles

1 : 1

---

users

↓

company_users

1 : N

---

# Index

email

phone

role

status

---

# Business Rules

Email unik.

Phone unik.

Password wajib menggunakan Argon2id.

Soft Delete digunakan.

---

# Example

{
"id":"UUID",
"email":"user@email.com",
"phone":"08123456789",
"role":"customer",
"status":"active"
}
