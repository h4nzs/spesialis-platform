# Testing

# Test Cases

Project: Specialist Platform

Version: 1.0

Part: 1

Status: LOCKED

---

# Purpose

Dokumen ini berisi seluruh Test Case yang harus lulus sebelum fitur dianggap selesai.

Format:

ID

Module

Scenario

Steps

Expected Result

Priority

Status

---

# Priority

P0

Critical

---

P1

High

---

P2

Medium

---

P3

Low

---

# Authentication

---

## AUTH-001

Priority

P0

Scenario

Login menggunakan email dan password valid.

Expected

User berhasil login dan diarahkan ke Dashboard.

---

## AUTH-002

Priority

P0

Login dengan password salah.

Expected

Pesan error muncul.

Tidak membuat Session.

---

## AUTH-003

Priority

P0

Login menggunakan email yang tidak terdaftar.

Expected

Login gagal.

---

## AUTH-004

Priority

P1

Field Email kosong.

Expected

Validation muncul.

---

## AUTH-005

Priority

P1

Password kosong.

Expected

Validation muncul.

---

## AUTH-006

Priority

P2

Email tidak valid.

Expected

Validation format email.

---

## AUTH-007

Priority

P0

Logout.

Expected

Session dihapus.

Redirect ke Homepage.

---

## AUTH-008

Priority

P1

Session expired.

Expected

Redirect Login.

---

## AUTH-009

Priority

P0

Unauthorized Dashboard Access.

Expected

Redirect Login.

---

## AUTH-010

Priority

P0

Role Customer membuka Admin Dashboard.

Expected

403 Forbidden.

---

# Guest

---

## GUEST-001

Homepage terbuka.

Expected

200 OK.

---

## GUEST-002

Semua Service tampil.

Expected

Data sesuai CMS.

---

## GUEST-003

Klik Service.

Expected

Masuk Detail Service.

---

## GUEST-004

Cari layanan.

Expected

Result sesuai Keyword.

---

## GUEST-005

Keyword kosong.

Expected

Semua layanan tampil.

---

## GUEST-006

Keyword tidak ditemukan.

Expected

Empty State.

---

## GUEST-007

Klik CTA Booking.

Expected

Masuk halaman Booking.

---

## GUEST-008

Klik WhatsApp.

Expected

Redirect WA dengan template.

---

## GUEST-009

Tracking tanpa Login.

Expected

Boleh.

---

## GUEST-010

Nomor Booking salah.

Expected

Order tidak ditemukan.

---

# Booking

---

## BOOK-001

Booking berhasil.

Expected

Booking Number dibuat.

Status

Submitted.

---

## BOOK-002

Nama kosong.

Expected

Validation.

---

## BOOK-003

Nomor HP kosong.

Expected

Validation.

---

## BOOK-004

Alamat kosong.

Expected

Validation.

---

## BOOK-005

Service kosong.

Expected

Validation.

---

## BOOK-006

Tanggal sebelum hari ini.

Expected

Validation.

---

## BOOK-007

Jam kosong.

Expected

Validation.

---

## BOOK-008

Booking tanpa Login.

Expected

Berhasil.

---

## BOOK-009

Booking dengan Login.

Expected

Order masuk Dashboard Customer.

---

## BOOK-010

Submit dua kali cepat.

Expected

Order hanya dibuat satu.

---

## BOOK-011

Internet terputus saat Submit.

Expected

Pesan gagal.

Retry tersedia.

---

## BOOK-012

Booking berhasil.

Expected

Redirect WhatsApp.

---

## BOOK-013

Booking berhasil.

Expected

Dashboard Admin menerima Order baru.

---

## BOOK-014

Booking Number unik.

Expected

Tidak ada duplikasi.

---

## BOOK-015

Nomor HP Indonesia valid.

Expected

Booking berhasil.

---

## BOOK-016

Nomor HP invalid.

Expected

Validation.

---

## BOOK-017

Alamat sangat panjang.

Expected

Tetap tersimpan.

---

## BOOK-018

Catatan kosong.

Expected

Booking tetap berhasil.

---

## BOOK-019

Catatan sangat panjang.

Expected

Disimpan.

---

## BOOK-020

Refresh halaman Success.

Expected

Tidak membuat Order baru.

---

# Order Tracking

---

## TRACK-001

Nomor Booking valid.

Expected

Status tampil.

---

## TRACK-002

Nomor Booking invalid.

Expected

Order tidak ditemukan.

---

## TRACK-003

Status berubah.

Expected

Tracking ikut berubah.

---

## TRACK-004

Booking selesai.

Expected

Timeline Completed.

---

## TRACK-005

Booking Cancel.

Expected

Status Cancelled.

---

# Search

---

## SEARCH-001

Cari AC.

Expected

Service AC tampil.

---

## SEARCH-002

Cari typo.

Expected

Suggestion muncul.

Future.

---

## SEARCH-003

Search kosong.

Expected

Default List.

---

## SEARCH-004

Search Case Sensitive.

Expected

Tidak Case Sensitive.

---

# Performance

---

## PERF-001

Homepage.

Expected

LCP <2.5 detik.

---

## PERF-002

Booking.

Expected

TTI <2 detik.

---

## PERF-003

CLS.

Expected

<0.1

---

## PERF-004

Lighthouse.

Expected

90+

---

# Accessibility

---

## A11Y-001

Keyboard Navigation.

Expected

Semua bisa diakses.

---

## A11Y-002

Focus Ring.

Expected

Selalu terlihat.

---

## A11Y-003

ARIA.

Expected

Semua Button memiliki label.

---

## A11Y-004

Contrast.

Expected

WCAG AA.

---

## A11Y-005

Zoom 200%.

Expected

Tetap usable.

---

# Exit Criteria

Semua P0 wajib PASS.

Minimal 95% seluruh Test Case PASS.

Tidak ada Bug Critical.

Status:

Draft
