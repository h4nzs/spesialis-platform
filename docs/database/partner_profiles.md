# Database Documentation

# Table: partner_profiles

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Menyimpan seluruh informasi Partner (Mitra).

Authentication berada pada tabel users.

Data profesional berada pada partner_profiles.

---

# Primary Key

id UUID PRIMARY KEY

---

# Foreign Key

user_id

↓

users.id

---

# Columns

| Column              | Type         | Nullable | Description  |
| ------------------- | ------------ | -------- | ------------ |
| id                  | UUID         | No       | Primary Key  |
| user_id             | UUID         | No       | User         |
| full_name           | VARCHAR(255) | No       | Nama Lengkap |
| phone               | VARCHAR(30)  | No       | Nomor HP     |
| avatar              | TEXT         | Yes      | Foto Profil  |
| ktp_number          | VARCHAR(30)  | No       | Nomor KTP    |
| ktp_media_id        | UUID         | Yes      | Foto KTP     |
| profile_photo_id    | UUID         | Yes      | Foto Profil  |
| experience_year     | INTEGER      | Yes      | Pengalaman   |
| bio                 | TEXT         | Yes      | Deskripsi    |
| rating_average      | NUMERIC(2,1) | No       | Rating       |
| completed_jobs      | INTEGER      | No       | Total Job    |
| availability        | VARCHAR(30)  | No       | Status       |
| verification_status | VARCHAR(30)  | No       | Verifikasi   |
| created_at          | TIMESTAMP    | No       | Created      |
| updated_at          | TIMESTAMP    | No       | Updated      |
| deleted_at          | TIMESTAMP    | Yes      | Soft Delete  |

---

# Availability

Available

Busy

Vacation

Offline

---

# Verification Status

Pending

Approved

Rejected

Suspended

---

# Relationships

partner_profiles

↓

partner_skills

1:N

---

partner_profiles

↓

assignments

1:N

---

partner_profiles

↓

reviews

1:N

---

partner_profiles

↓

earnings

1:N

---

# Business Rules

Partner wajib diverifikasi.

Partner dapat memiliki banyak Skill.

Partner dapat mengubah Availability.

Partner hanya dapat melihat Assignment miliknya.

---

# Index

user_id

availability

verification_status

rating_average

---

# Future

GPS Position

Live Location

AI Score

Priority Level

Service Radius
