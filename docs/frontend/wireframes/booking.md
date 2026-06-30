# Frontend Wireframe

# Booking

Project: Specialist Platform

Version: 1.0

Status: LOCKED

---

# Goals

Halaman Booking memiliki satu tujuan utama:

Mengubah Visitor menjadi Order.

Booking harus dapat diselesaikan dalam waktu kurang dari 3 menit.

Customer tidak diwajibkan login.

---

# UX Principles

Booking harus:

- Cepat
- Jelas
- Tidak membingungkan
- Mobile First
- Mudah digunakan saat kondisi darurat

---

# Booking Flow

Homepage

↓

Pilih Layanan

↓

Isi Informasi

↓

Konfirmasi

↓

WhatsApp Admin

↓

Admin Verifikasi

↓

Partner Ditugaskan

↓

Order Tracking

---

# Page Layout

┌────────────────────────────────────────────┐
│ Breadcrumb │
├────────────────────────────────────────────┤
│ Service Information │
├────────────────────────────────────────────┤
│ Booking Progress │
├────────────────────────────────────────────┤
│ Booking Form │
├────────────────────────────────────────────┤
│ Booking Summary │
├────────────────────────────────────────────┤
│ FAQ │
├────────────────────────────────────────────┤
│ CTA WhatsApp │
└────────────────────────────────────────────┘

---

# Step Indicator

Desktop

①

↓

②

↓

③

↓

④

---

Mobile

Progress Bar

↓

Step Number

---

Current Step selalu terlihat.

---

# Step 1

Pilih Layanan

┌───────────────────────────────┐

Kategori

↓

Service

↓

Short Description

↓

Estimasi Harga

↓

Estimasi Durasi

└───────────────────────────────┘

---

Field

Service Category

Service

---

Opsional

Catatan

---

CTA

Lanjut

---

# Step 2

Lokasi

┌───────────────────────────────┐

Nama

↓

Nomor HP

↓

Alamat

↓

Pin Lokasi

↓

Catatan Lokasi

└───────────────────────────────┘

---

Field

Nama

Nomor HP

Alamat

Google Maps URL (Opsional)

Share GPS (Opsional)

Catatan

---

Alamat wajib jelas.

---

# Step 3

Jadwal

┌───────────────────────────────┐

Tanggal

↓

Jam

↓

Prioritas

↓

Catatan Tambahan

└───────────────────────────────┘

---

Pilihan

Hari Ini

Besok

Pilih Tanggal

---

Jam

Pagi

Siang

Sore

Malam

---

Priority

Normal

Urgent

---

# Step 4

Konfirmasi

┌───────────────────────────────┐

Ringkasan

↓

Data Customer

↓

Alamat

↓

Layanan

↓

Jadwal

↓

Disclaimer

↓

Submit

└───────────────────────────────┘

---

Disclaimer

Harga akhir akan dikonfirmasi oleh Admin melalui WhatsApp setelah booking diterima.

---

CTA

Kirim Booking

---

# Booking Summary

Sticky pada Desktop.

Berada di bawah Form pada Mobile.

---

Berisi

Layanan

Alamat

Jadwal

Estimasi Harga

Status

---

# Success Page

┌───────────────────────────────┐

✅

Booking Berhasil

↓

Booking Number

↓

Status

↓

WhatsApp

↓

Lacak Pesanan

↓

Kembali ke Homepage

└───────────────────────────────┘

---

# Error State

Booking gagal.

↓

Pesan Error.

↓

Coba Lagi.

↓

Hubungi Admin.

---

# Loading State

Gunakan Skeleton.

Submit Button berubah menjadi Loading.

---

# Validation

Nama

Minimal 3 karakter.

---

Nomor HP

Format Indonesia.

---

Alamat

Minimal 20 karakter.

---

Tanggal

Tidak boleh sebelum hari ini.

---

Jam

Harus tersedia.

---

# Booking Status

Draft

↓

Submitted

↓

Waiting Confirmation

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

↓

Cancelled

---

# WhatsApp Integration

Setelah Booking berhasil.

↓

Generate pesan otomatis.

↓

Redirect ke WhatsApp Admin.

Template:

Halo Admin,

Saya ingin melakukan booking.

Nomor Booking:

SP-2026-000123

Layanan:

AC Cleaning

Tanggal:

30 Juni 2026

Alamat:

...

Terima kasih.

---

# Mobile Layout

Semua Input

100%

---

CTA

Full Width

---

Summary

Collapse

↓

Expand

---

# Desktop Layout

Form

8 Grid

Summary

4 Grid

---

# Accessibility

Label

Autocomplete

Keyboard Navigation

Visible Focus

Error dibacakan Screen Reader.

---

# Performance

Lazy Load FAQ.

Hydration hanya Form.

Summary menggunakan SSR.

---

# Analytics

Track Event

Booking Started

↓

Step Changed

↓

Booking Submitted

↓

WhatsApp Clicked

↓

Booking Success

↓

Booking Failed

---

# Success Criteria

User dapat:

Memilih layanan

<30 detik

↓

Mengisi form

<2 menit

↓

Submit Booking

<30 detik

↓

Masuk WhatsApp

<5 detik

---

# Future

Payment Gateway

Realtime Tracking

Live Chat

AI Booking Assistant

Location Picker

Photo Upload

Promo Code
