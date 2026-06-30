# Frontend Wireframe

# Customer Dashboard

Project: Specialist Platform

Version: 1.0

Status: LOCKED

---

# Goals

Dashboard Customer berfungsi sebagai pusat aktivitas pelanggan setelah melakukan booking.

Customer harus dapat:

- Melihat status order
- Melakukan booking baru
- Melacak pekerjaan
- Mengelola profil
- Mengelola alamat
- Menghubungi Admin
- Memberikan review

Dashboard tidak boleh terasa rumit.

Semua informasi penting harus terlihat dalam 5 detik pertama.

---

# Dashboard Layout

Desktop

┌───────────────────────────────────────────────────────────────────────┐
│ Navbar │
├───────────────┬───────────────────────────────────────────────────────┤
│ Sidebar │ Dashboard Content │
│ │ │
│ │ │
└───────────────┴───────────────────────────────────────────────────────┘

---

Mobile

┌───────────────────────────────┐
│ Navbar │
├───────────────────────────────┤
│ Dashboard Content │
├───────────────────────────────┤
│ Bottom Navigation │
└───────────────────────────────┘

---

# Sidebar

Dashboard

Booking Saya

Lacak Pesanan

Alamat

Profil

Bantuan

Logout

---

Menu aktif memiliki indikator warna Primary.

---

# Dashboard Overview

┌────────────────────────────────────────────┐

Halo,

Nama Customer

↓

Order Aktif

↓

Booking Terakhir

↓

Quick Action

↓

Riwayat Terbaru

└────────────────────────────────────────────┘

---

# Welcome Card

Menampilkan

Nama

↓

Foto

↓

Greeting berdasarkan waktu.

Contoh

Selamat Pagi

Selamat Siang

Selamat Sore

Selamat Malam

---

# Quick Action

Booking Baru

↓

Lacak Pesanan

↓

Hubungi Admin

↓

Lihat Semua Order

---

Desktop

4 Card

---

Mobile

2 x 2 Grid

---

# Active Order

Jika ada order aktif.

Tampilkan paling atas.

┌──────────────────────────────┐

Booking Number

↓

Status

↓

Layanan

↓

Alamat

↓

Tanggal

↓

Partner

↓

CTA

Lacak

└──────────────────────────────┘

---

Status menggunakan Badge.

---

# Order Timeline

Submitted

↓

Confirmed

↓

Partner Assigned

↓

On The Way

↓

Working

↓

Completed

---

Status aktif memiliki warna Primary.

---

# Recent Orders

Desktop

Table

---

Mobile

Card List

---

Kolom

Booking Number

Layanan

Tanggal

Status

Aksi

---

# Empty State

Belum ada order.

↓

Illustration

↓

Text

↓

CTA Booking Sekarang

---

# Address Management

Alamat Utama

↓

Alamat Lain

↓

Tambah Alamat

↓

Edit

↓

Hapus

---

Default Address

Memiliki Badge.

---

# Profile

Foto

Nama

Email

Nomor HP

Password

---

Customer dapat mengubah:

Nama

Nomor HP

Alamat

Password

Foto

---

Email tidak dapat diubah.

---

# Notification Center

Booking Baru

↓

Status berubah

↓

Pembayaran

↓

Promo

↓

Artikel Baru

---

Belum dibaca

Badge.

---

# Review

Order selesai.

↓

Button

Tulis Review

---

Review

Rating

↓

Komentar

↓

Foto (Future)

---

# Complaint

Order selesai.

↓

Laporkan Masalah

↓

Admin menerima Complaint.

---

# Tracking

Button

↓

Halaman Tracking

↓

Timeline

↓

Status

↓

Partner

---

# WhatsApp

Semua Order memiliki

Button

Hubungi Admin

---

Floating WhatsApp

Selalu tersedia.

---

# Dashboard Widget

Desktop

┌────────┐

Order Aktif

└────────┘

┌────────┐

Order Selesai

└────────┘

┌────────┐

Review

└────────┘

┌────────┐

Alamat

└────────┘

---

# Search

Customer dapat mencari:

Booking Number

↓

Nama Layanan

↓

Status

---

# Filter

Semua

↓

Aktif

↓

Selesai

↓

Dibatalkan

---

# Pagination

Desktop

Bottom Table

---

Mobile

Load More

---

# Loading

Skeleton Widget

↓

Skeleton Table

↓

Skeleton Card

---

# Error State

Tidak dapat mengambil data.

↓

Coba Lagi

↓

Hubungi Admin

---

# Empty Dashboard

Illustration

↓

Belum ada aktivitas.

↓

Booking Sekarang

---

# Mobile Layout

Urutan

Welcome

↓

Quick Action

↓

Order Aktif

↓

Riwayat

↓

Notification

↓

Profile

---

Bottom Navigation

Dashboard

Booking

Tracking

Notification

Profile

---

# Accessibility

Keyboard Navigation

↓

Screen Reader

↓

Focus Ring

↓

ARIA Label

---

# Performance

SSR

↓

Dashboard Data

---

Hydration

Hanya

Quick Action

Filter

Search

Notification

---

# Analytics

Track

Dashboard Open

↓

Booking Click

↓

Tracking Click

↓

Review Submitted

↓

Complaint Submitted

---

# Success Criteria

Customer dapat:

Melihat status order

<5 detik

↓

Booking ulang

<30 detik

↓

Tracking

<10 detik

↓

Menghubungi Admin

1 klik

↓

Menulis Review

<2 menit

---

# Future

Realtime Status

↓

Push Notification

↓

Live Partner Tracking

↓

Payment Gateway

↓

Invoice Download

↓

Loyalty Program

↓

Favorite Services

↓

Referral Program

↓

AI Customer Assistant
