# Functional Specification

# Module: Authentication

**Module ID:** FS-AUTH-001

**Version:** 1.0

**Priority:** ⭐⭐⭐⭐⭐ (Critical)

---

# 1. Overview

Authentication Module bertanggung jawab mengelola seluruh proses autentikasi dan otorisasi pengguna pada platform Specialist.

Seluruh jenis akun menggunakan modul ini.

Role didukung:

- Customer
- Partner
- Corporate
- Admin
- Dispatcher
- Finance
- Content Manager
- Super Admin

---

# 2. Objectives

- Menyediakan autentikasi yang aman.
- Mendukung RBAC (Role Based Access Control).
- Mendukung Guest Booking.
- Mendukung registrasi Partner.
- Mendukung registrasi Corporate.
- Menyediakan Session Management.
- Menyediakan Audit Login.

---

# 3. Actors

Guest

Customer

Partner

Corporate

Admin

---

# 4. Functional Requirements

## AUTH-001

Guest dapat melakukan Booking tanpa Login.

---

## AUTH-002

Guest dapat melakukan Registrasi setelah Booking.

Histori Order tetap dipertahankan.

---

## AUTH-003

Customer dapat Registrasi menggunakan:

- Email
- Password

Future:

- Google
- OTP

---

## AUTH-004

Partner melakukan Registrasi melalui Form Mitra.

Data wajib:

- Nama
- Email
- Nomor HP
- Password
- KTP
- Foto Profil
- Area Kerja
- Skill

Status:

Waiting Verification

---

## AUTH-005

Corporate Registration.

Status awal:

Pending Verification

Admin melakukan verifikasi sebelum akun aktif.

---

## AUTH-006

Login menggunakan:

Email + Password

Future:

OTP

Passkey

Google Login

---

## AUTH-007

Forgot Password.

Flow.

```text
Forgot Password

↓

Email Link

↓

Reset Password

↓

Login
```

---

## AUTH-008

Logout menghapus Session aktif.

---

# 5. User Roles

| Role            | Description             |
| --------------- | ----------------------- |
| customer        | Pelanggan               |
| partner         | Mitra                   |
| corporate       | User perusahaan         |
| dispatcher      | Operator Assignment     |
| finance         | Keuangan                |
| content_manager | CMS                     |
| admin           | Administrator           |
| super_admin     | Administrator tertinggi |

---

# 6. Account Status

Status tersedia.

Pending

Active

Suspended

Blocked

Deleted

---

# 7. Authentication Flow

```text
Register

↓

Email Verification

↓

Login

↓

JWT

↓

Dashboard
```

---

# 8. Authorization

Menggunakan RBAC.

Flow.

```text
User

↓

Roles

↓

Permissions

↓

Allowed Action
```

Satu User dapat memiliki banyak Role.

---

# 9. Session Management

MVP.

JWT Access Token.

Refresh Token.

Logout menghapus Refresh Token.

Future.

Multi Device Login.

---

# 10. Password Policy

Minimal.

- 8 karakter
- 1 huruf besar
- 1 huruf kecil
- 1 angka

Future.

Konfigurasi melalui System Settings.

---

# 11. Validation Rules

Email:

Harus unik.

Phone Number:

Harus unik.

Password:

Minimal 8 karakter.

Role:

Harus valid.

Status:

Harus valid.

---

# 12. Permission Matrix

| Feature        | Guest | Customer | Partner | Corporate | Admin |
| -------------- | ----- | -------- | ------- | --------- | ----- |
| Register       | ✅    | -        | ✅      | ✅        | -     |
| Login          | ❌    | ✅       | ✅      | ✅        | ✅    |
| Logout         | ❌    | ✅       | ✅      | ✅        | ✅    |
| Reset Password | ❌    | ✅       | ✅      | ✅        | ✅    |
| Booking        | ✅    | ✅       | ❌      | ❌        | ✅    |

---

# 13. Notifications

Saat Register.

Email Verification.

Saat Reset Password.

Email Reset.

Saat Partner Disetujui.

Email.

WhatsApp (Future).

---

# 14. Security

Password menggunakan:

Argon2id.

HTTPS wajib.

JWT.

Refresh Token.

Rate Limit.

Audit Login.

Soft Delete.

---

# 15. Error Handling

Contoh.

Email sudah digunakan.

↓

409 Conflict

Password salah.

↓

401 Unauthorized

Token kadaluarsa.

↓

401 Unauthorized

Tidak memiliki Permission.

↓

403 Forbidden

---

# 16. Edge Cases

Guest melakukan Booking lalu Register.

Histori Order otomatis digabung.

---

Partner ditolak.

Partner dapat memperbaiki data lalu Submit ulang.

---

Corporate belum diverifikasi.

Tidak dapat Login.

---

# 17. Acceptance Criteria

Module dianggap selesai apabila.

- Register berjalan.
- Login berjalan.
- Logout berjalan.
- Reset Password berjalan.
- Guest Booking berjalan.
- RBAC berjalan.
- JWT berjalan.
- Audit Login berjalan.

---

# 18. Dependencies

Database:

users

roles

permissions

user_roles

password_resets

sessions

API:

POST /auth/register

POST /auth/login

POST /auth/logout

POST /auth/forgot-password

POST /auth/reset-password

GET /auth/me

---

# 19. Future Enhancements

- Google OAuth

- Passkey

- OTP Login

- Magic Link

- MFA

---

# 20. Engineering Notes

Seluruh Business Logic Authentication berada pada Backend.

Frontend hanya bertanggung jawab terhadap UI dan penyimpanan Access Token sesuai strategi keamanan yang disepakati.

Authentication menjadi modul dasar seluruh platform.
