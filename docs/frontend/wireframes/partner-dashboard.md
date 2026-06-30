# Frontend Wireframe

# Partner Dashboard

Project: Specialist Platform

Version: 1.0

Status: LOCKED

---

# Goals

Dashboard Partner merupakan pusat operasional Mitra.

Partner harus dapat:

- Melihat pekerjaan baru
- Menerima atau menolak assignment
- Melihat jadwal
- Mengatur ketersediaan
- Menghubungi Admin
- Melihat penghasilan
- Mengelola profil
- Mengunggah dokumen
- Melihat performa

Dashboard harus membantu Partner bekerja lebih cepat.

---

# Dashboard Layout

Desktop

┌───────────────────────────────────────────────────────────────────────────────┐
│ Navbar │
├────────────────┬──────────────────────────────────────────────────────────────┤
│ Sidebar │ Dashboard Content │
│ │ │
└────────────────┴──────────────────────────────────────────────────────────────┘

---

Mobile

┌─────────────────────────────┐
│ Navbar │
├─────────────────────────────┤
│ Dashboard │
├─────────────────────────────┤
│ Bottom Navigation │
└─────────────────────────────┘

---

# Sidebar

Dashboard

Assignment

Jadwal

Riwayat

Pendapatan

Performa

Profil

Dokumen

Bantuan

Logout

---

# Dashboard Overview

┌────────────────────────────────────────────┐

Selamat Datang

↓

Status Availability

↓

Assignment Baru

↓

Pekerjaan Hari Ini

↓

Pendapatan Hari Ini

↓

Quick Action

↓

Riwayat Aktivitas

└────────────────────────────────────────────┘

---

# Availability Card

Partner dapat mengubah status.

Available

Busy

Offline

Vacation (Future)

---

Warna

Available

Success

Busy

Warning

Offline

Neutral

---

Status tampil juga pada Dashboard Admin.

---

# Quick Actions

Lihat Assignment

↓

Atur Availability

↓

Hubungi Admin

↓

Lihat Pendapatan

---

Desktop

4 Card

---

Mobile

2x2

---

# Assignment Section

Assignment Baru selalu berada paling atas.

Card

┌─────────────────────────────┐

Booking Number

↓

Nama Customer

↓

Layanan

↓

Alamat

↓

Jadwal

↓

Estimasi Durasi

↓

Accept

Reject

└─────────────────────────────┘

---

Accept

↓

Status

Accepted

↓

Admin mendapat notifikasi.

---

Reject

↓

Wajib memilih alasan.

↓

Admin mencari Partner lain.

---

# Assignment Detail

Menampilkan

Booking Number

Customer

Nomor HP

Alamat

Maps

Layanan

Catatan Customer

Jadwal

Status

---

CTA

Navigasi

↓

Hubungi Admin

↓

Mulai Pekerjaan

---

# Job Status

Waiting Assignment

↓

Accepted

↓

On The Way

↓

Working

↓

Completed

---

Partner hanya dapat mengubah status tertentu.

---

# Today's Schedule

Timeline

08.00

↓

10.00

↓

13.00

↓

16.00

↓

18.00

---

Jika kosong.

Tampilkan Empty State.

---

# Earnings

Widget

Hari Ini

↓

Minggu Ini

↓

Bulan Ini

↓

Total

---

Riwayat Pendapatan

Tanggal

Booking

Potongan

Pendapatan Bersih

Status Pembayaran

---

# Performance

Average Rating

↓

Total Job

↓

Completion Rate

↓

Acceptance Rate

↓

Cancellation Rate

↓

Review Terbaru

---

# Customer Review

Avatar

↓

Nama Customer

↓

Rating

↓

Komentar

↓

Tanggal

---

Partner tidak dapat menghapus Review.

---

# Documents

Status

KTP

↓

Foto Profil

↓

Sertifikat

↓

Dokumen Pendukung

---

Status

Pending

Verified

Rejected

---

Jika ditolak.

Admin memberikan alasan.

---

# Profile

Foto

Nama

Email

Nomor HP

Alamat

Keahlian

Area Layanan

---

Partner hanya dapat mengubah:

Foto

Nomor HP

Alamat

Area Layanan

Keahlian

---

Email hanya Admin.

---

# Skills

AC

Cleaning

Electrical

Plumbing

Painting

CCTV

Internet

Pest Control

dst.

---

Partner dapat memiliki lebih dari satu skill.

---

# Service Area

Partner memilih area.

Jakarta

Bogor

Depok

Tangerang

Bekasi

Bandung

---

Future

Radius berdasarkan GPS.

---

# Notifications

Assignment Baru

↓

Status Dokumen

↓

Pembayaran

↓

Pengumuman

↓

Sistem

---

Unread menggunakan Badge.

---

# Search

Cari Assignment

↓

Booking Number

↓

Nama Customer

↓

Alamat

---

# Filter

Hari Ini

↓

Minggu Ini

↓

Completed

↓

Pending

↓

Cancelled

---

# Empty State

Belum ada Assignment.

↓

Illustration

↓

Text

↓

Status tetap Available.

---

# Loading

Skeleton Widget

↓

Skeleton Assignment

↓

Skeleton Table

---

# Error State

Data gagal dimuat.

↓

Coba Lagi

↓

Hubungi Admin

---

# WhatsApp

Setiap Assignment memiliki tombol.

Hubungi Admin.

---

Customer tidak dapat dihubungi langsung.

Semua komunikasi melalui Admin apabila diperlukan.

---

# Mobile Layout

Urutan

Availability

↓

Assignment Baru

↓

Quick Action

↓

Today's Job

↓

Pendapatan

↓

Performa

↓

Profil

---

Bottom Navigation

Dashboard

Assignment

Pendapatan

Notifikasi

Profil

---

# Accessibility

Keyboard Navigation

↓

Visible Focus

↓

Screen Reader

↓

ARIA

---

# Performance

SSR

Dashboard

---

Hydration

Availability Toggle

Assignment Action

Search

Filter

Notification

---

# Analytics

Track

Partner Login

↓

Availability Changed

↓

Assignment Accepted

↓

Assignment Rejected

↓

Job Started

↓

Job Completed

↓

Profile Updated

---

# Security

Partner hanya dapat melihat Assignment miliknya.

---

Pendapatan hanya dapat dilihat oleh Partner terkait.

---

Dokumen hanya dapat diakses oleh:

Partner

Admin

---

# Success Criteria

Partner mampu:

Melihat Assignment Baru

<5 detik

↓

Menerima Assignment

<10 detik

↓

Mengubah Availability

1 klik

↓

Melihat Pendapatan

<5 detik

↓

Menghubungi Admin

1 klik

---

# Future

Live Tracking

↓

GPS Verification

↓

Check In

↓

Check Out

↓

Digital Signature

↓

Photo Before/After

↓

Expense Claim

↓

AI Route Recommendation

↓

AI Job Recommendation

↓

Gamification

↓

Achievement

↓

Leaderboard

↓

Wallet

↓

Withdrawal Request
