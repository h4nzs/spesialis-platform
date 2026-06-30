# Frontend Specification

# UX Guidelines

Project: Specialist Platform

Version: 1.0

Status: LOCKED

---

# Purpose

Dokumen ini mendefinisikan standar User Experience (UX) untuk seluruh Specialist Platform.

Platform dirancang agar pengguna dapat memesan jasa profesional secepat mungkin, terutama dalam kondisi mendesak.

Seluruh keputusan desain harus mengutamakan kemudahan penggunaan dibanding kompleksitas visual.

---

# UX Principles

Semua fitur harus mengikuti prinsip berikut.

- Fast
- Simple
- Clear
- Trustworthy
- Mobile First
- Conversion Oriented

Target utama bukan membuat website yang "cantik", tetapi website yang menghasilkan booking.

---

# Primary User Goals

Customer

- Mencari layanan
- Memesan jasa
- Melihat status order
- Menghubungi admin

---

Partner

- Melihat pekerjaan
- Menerima pekerjaan
- Mengatur ketersediaan
- Melihat riwayat pekerjaan

---

Corporate

- Mengirim inquiry
- Mengelola cabang
- Melihat invoice
- Melihat histori maintenance

---

Admin

- Mengelola order
- Mengelola partner
- Mengelola customer
- Mengelola konten

---

# Homepage Strategy

Homepage harus menjawab pertanyaan pengguna dalam waktu kurang dari 5 detik.

Urutan informasi:

1.

Hero

↓

2.

Kategori Layanan

↓

3.

Kenapa Memilih Kami

↓

4.

Cara Kerja

↓

5.

Testimoni

↓

6.

Coverage Area

↓

7.

FAQ

↓

8.

CTA Booking

---

Hero tidak boleh dipenuhi teks.

Maksimal:

- 1 Heading
- 1 Paragraph
- 2 CTA

---

# CTA Strategy

CTA utama

Booking Sekarang

---

CTA sekunder

Hubungi Admin

---

CTA ketiga

Daftar Mitra

---

CTA harus selalu terlihat pada halaman utama.

---

# Booking Experience

Target:

Booking selesai dalam kurang dari 3 menit.

---

Booking Flow

Pilih Layanan

↓

Isi Lokasi

↓

Isi Detail

↓

Konfirmasi

↓

Terhubung ke WhatsApp Admin

---

Jangan meminta data yang belum diperlukan.

---

# Progressive Disclosure

Informasi ditampilkan secara bertahap.

Contoh:

Customer tidak perlu mengisi data invoice apabila hanya ingin booking jasa rumah tangga.

---

# Form UX

Label selalu berada di atas input.

---

Error muncul secara langsung setelah field selesai diisi.

---

Field wajib diberi tanda.

---

Gunakan placeholder sebagai contoh, bukan pengganti label.

---

# Search Experience

Search harus toleran terhadap typo ringan.

---

Search menampilkan:

Layanan

Kategori

Artikel

---

Jika tidak ada hasil.

Berikan rekomendasi layanan lain.

---

# Service Discovery

Kategori layanan harus mudah dipindai.

Gunakan:

Icon

-

Judul

-

Deskripsi singkat

---

Maksimal 2 baris deskripsi.

---

# Pricing Experience

Untuk saat ini.

Harga bersifat estimasi.

Final harga dikonfirmasi oleh Admin melalui WhatsApp.

Tampilkan informasi ini secara jelas agar ekspektasi pelanggan sesuai.

---

# Trust Building

Homepage wajib memiliki:

Jumlah order selesai

↓

Rating

↓

Teknisi terverifikasi

↓

Area layanan

↓

Logo partner (jika ada)

↓

Testimoni

↓

FAQ

---

# Emergency Experience

Apabila pengguna membutuhkan layanan cepat.

CTA Booking harus tetap mudah ditemukan.

Jangan memaksa login sebelum booking.

---

# Authentication UX

Booking dapat dilakukan tanpa login.

---

Login hanya diperlukan apabila pengguna ingin:

Melihat histori

Memberikan review

Mengelola profil

---

# Dashboard UX

Dashboard harus menjawab:

Apa yang perlu saya lakukan sekarang?

Bukan:

Semua data sekaligus.

---

Widget prioritas.

Customer

↓

Order Aktif

↓

Status

↓

Riwayat

---

Partner

↓

Assignment Baru

↓

Pendapatan

↓

Jadwal

---

Corporate

↓

Order Aktif

↓

Invoice

↓

Cabang

---

# Navigation Rules

Navigasi maksimal:

7 item utama.

---

Mobile menggunakan Drawer.

---

Dashboard menggunakan Sidebar.

---

Logo selalu kembali ke Homepage.

---

# Empty State

Setiap halaman wajib memiliki Empty State.

Contoh.

Belum ada order.

↓

Tampilkan CTA Booking.

---

Belum ada alamat.

↓

Tambah Alamat.

---

Belum ada review.

↓

Tulis Review.

---

# Loading Experience

Gunakan Skeleton.

Bukan Spinner penuh.

---

Spinner hanya digunakan pada:

Submit Form

↓

Upload

↓

Refresh

---

# Error Experience

Gunakan bahasa manusia.

Contoh.

❌ Error 500

---

✅

Terjadi kendala pada sistem.

Silakan coba beberapa saat lagi.

---

Selalu berikan tindakan berikutnya.

Contoh.

Coba Lagi

Hubungi Admin

Kembali ke Homepage

---

# Success Experience

Setelah booking berhasil.

Tampilkan:

Nomor Booking

↓

Status

↓

Estimasi proses

↓

Tombol WhatsApp

↓

Lacak Pesanan

---

# Feedback UX

Semua aksi penting harus memberikan feedback.

Contoh.

Loading

Success

Error

---

Tidak boleh ada tombol yang tidak memberikan respon.

---

# Notification UX

Notifikasi harus:

Ringkas

Jelas

Dapat ditindaklanjuti.

---

Prioritas.

Booking

↓

Payment

↓

Assignment

↓

Review

↓

Artikel

---

# Copywriting Guidelines

Gunakan bahasa Indonesia yang sederhana.

---

Gunakan kalimat aktif.

---

CTA menggunakan kata kerja.

Contoh.

Booking Sekarang

Lacak Pesanan

Hubungi Admin

Daftar Mitra

Ajukan Penawaran

---

Hindari istilah teknis.

---

# Mobile UX

Semua CTA utama Full Width.

---

Input minimal:

48px

---

Touch Target

44px

---

Bottom Sheet lebih disukai dibanding Modal penuh.

---

# Performance UX

Target.

First Contentful Paint

<2 detik

---

LCP

<2.5 detik

---

CLS

<0.1

---

Interaction harus terasa instan.

---

# SEO UX

Halaman layanan harus menjawab pertanyaan pengguna.

---

Gunakan FAQ.

---

Gunakan Breadcrumb.

---

Gunakan Internal Link.

---

# Accessibility UX

Jangan bergantung pada warna.

---

Gunakan Icon.

↓

Teks.

↓

Warna.

---

Keyboard Navigation wajib.

---

# WhatsApp Integration

Saat ini seluruh proses negosiasi harga dan pembayaran dilakukan melalui WhatsApp Admin.

Setelah booking dikirim.

↓

Customer diarahkan ke WhatsApp Admin dengan data booking yang telah terisi otomatis.

Admin bertanggung jawab melakukan:

- Konfirmasi harga
- Konfirmasi jadwal
- Konfirmasi pembayaran
- Penugasan Partner

---

# Future UX

Payment Gateway

↓

Realtime Tracking

↓

Live Chat

↓

AI Customer Assistant

↓

AI Dispatcher

↓

Push Notification

↓

Mobile App

---

# UX Anti Pattern

Jangan meminta login sebelum booking.

---

Jangan membuat form terlalu panjang.

---

Jangan menggunakan Popup berlebihan.

---

Jangan menyembunyikan CTA utama.

---

Jangan menggunakan Carousel untuk informasi penting.

---

Jangan menggunakan Auto Play Video.

---

Jangan menggunakan animasi berlebihan.

---

Jangan memaksa pengguna berpindah halaman apabila dapat diselesaikan dalam satu alur.

---

# Definition of Good UX

Pengguna baru harus dapat:

- Memahami layanan dalam <30 detik.
- Menemukan layanan dalam <20 detik.
- Mengirim booking dalam <3 menit.
- Melacak order tanpa bantuan.
- Menghubungi Admin dalam 1 klik.

Apabila target tersebut tidak tercapai, maka desain perlu dievaluasi kembali.

---

# Source of Truth

Semua keputusan UX harus mengacu pada dokumen ini.

Apabila terjadi konflik antara estetika dan kemudahan penggunaan, maka kemudahan penggunaan harus diprioritaskan.
