# User Journey

# Admin User

Project: Specialist Platform

Version: 1.0

Status: LOCKED

---

# Persona

Admin merupakan pusat operasional seluruh bisnis.

Seluruh aktivitas Customer, Partner, Corporate, dan CMS dikendalikan melalui Dashboard Admin.

Admin dibagi menjadi beberapa Role.

- Super Admin
- Admin
- Dispatcher
- Finance
- Customer Service
- Content Manager
- SEO Specialist

---

# Goals

Admin ingin:

- Mengelola seluruh Order
- Menugaskan Partner
- Memverifikasi Partner
- Mengelola Customer
- Mengelola Corporate
- Mengelola CMS
- Mengelola Payment
- Mengelola Invoice
- Memastikan operasional berjalan lancar

---

# Success Criteria

Admin berhasil apabila:

✓ Semua Booking diproses

↓

✓ Semua Partner mendapat Assignment

↓

✓ Customer puas

↓

✓ Payment terverifikasi

↓

✓ Tidak ada Order yang terlewat

↓

✓ Website selalu up-to-date

---

# Daily Workflow

Login

↓

Dashboard

↓

Pending Actions

↓

New Booking

↓

Assign Partner

↓

Customer Follow Up

↓

Payment Verification

↓

Complaint Handling

↓

Content Management

↓

Reports

↓

Logout

---

# Login Journey

Admin Login

↓

OTP (Future)

↓

Dashboard

↓

Permission Loaded

↓

Ready

---

# Dashboard Journey

Dashboard menampilkan:

Today's Orders

↓

Pending Orders

↓

Partner Availability

↓

Pending Payment

↓

Complaint

↓

Corporate Lead

↓

Recent Activities

↓

System Health

---

Dashboard harus memberikan gambaran kondisi bisnis dalam waktu kurang dari 5 detik.

---

# New Booking Journey

Customer Submit Booking

↓

Dashboard mendapat notifikasi

↓

Booking masuk Queue

↓

Admin membuka Detail

↓

Verifikasi Data

↓

Hubungi Customer

↓

Konfirmasi Harga

↓

Konfirmasi Jadwal

↓

Siap Assign

---

# Assignment Journey

Admin membuka Order

↓

Melihat Area

↓

Melihat Skill

↓

Melihat Partner Available

↓

Pilih Partner

↓

Assign

↓

Partner menerima notifikasi

---

Jika Partner Reject

↓

Admin memilih Partner lain

↓

Assignment berhasil

---

# Customer Communication

Admin menghubungi Customer

↓

WhatsApp

↓

Telepon

↓

Konfirmasi

↓

Update Status

---

Semua komunikasi dicatat pada Activity Log.

---

# Partner Verification

Partner Register

↓

Upload Dokumen

↓

Admin Review

↓

Approve

atau

Reject

↓

Partner mendapat notifikasi

---

Jika Reject

↓

Admin memberikan alasan.

↓

Partner Upload ulang.

---

# Corporate Journey

Lead Baru

↓

Admin Review

↓

Hubungi PIC

↓

Meeting

↓

Negosiasi

↓

Buat Corporate Account

↓

Aktif

---

# Payment Verification

Customer Transfer

↓

Upload Bukti

Future

↓

Admin Verifikasi

↓

Paid

↓

Invoice

↓

Assignment

---

Saat ini pembayaran dilakukan manual melalui WhatsApp.

Status pembayaran tetap dicatat di sistem.

---

# Invoice Journey

Generate Invoice

↓

Review

↓

Download PDF

↓

Kirim ke Corporate

↓

Waiting Payment

↓

Paid

---

# Complaint Journey

Customer membuat Complaint

↓

Dashboard

↓

Assign Admin

↓

Investigasi

↓

Follow Up

↓

Resolved

↓

Closed

---

# Review Moderation

Review Baru

↓

Admin Review

↓

Publish

↓

Hide

↓

Delete

(Admin/Super Admin)

---

# CMS Journey

Content Manager Login

↓

Create Article

↓

SEO

↓

Preview

↓

Publish

↓

Homepage Update

---

# Service Management

Tambah Service

↓

Tambah SEO

↓

Thumbnail

↓

Publish

↓

Muncul di Homepage

↓

Booking siap digunakan

---

# Area Management

Tambah Kota

↓

Tambah Area

↓

Publish

↓

Landing Page otomatis tersedia

Future

---

# Notification Journey

Admin menerima:

New Booking

↓

Partner Reject

↓

Payment

↓

Complaint

↓

Corporate Lead

↓

Article Review

↓

System Alert

---

Prioritas

Critical

↓

High

↓

Medium

↓

Low

---

# Report Journey

Dashboard

↓

Revenue

↓

Orders

↓

Partner

↓

Corporate

↓

Customer

↓

Export

↓

PDF

↓

Excel

↓

CSV

---

# Search Journey

Global Search

Booking

↓

Customer

↓

Partner

↓

Corporate

↓

Invoice

↓

Article

↓

Service

↓

Media

---

Target pencarian

<2 detik

---

# Filter Journey

Status

↓

Area

↓

Partner

↓

Service

↓

Corporate

↓

Payment

↓

Priority

↓

Date

---

# Activity Log

Semua perubahan dicatat.

Contoh

Order Assigned

↓

Payment Verified

↓

Status Changed

↓

Content Published

↓

Partner Approved

↓

User Login

↓

Settings Changed

---

Audit Log tidak dapat diedit.

---

# System Monitoring

Admin melihat

API

↓

Database

↓

CMS

↓

Mail

↓

Storage

↓

Disk

↓

CPU

↓

RAM

↓

Redis

↓

Queue

---

Future

Realtime Monitoring.

---

# Empty State

Tidak ada Booking

↓

Tidak ada Complaint

↓

Tidak ada Payment

↓

Tidak ada Notification

↓

Dashboard tetap informatif.

---

# Error State

API Error

↓

Retry

↓

Activity Log

↓

Hubungi Super Admin

---

Partner gagal diassign

↓

Cari Partner lain

↓

Hubungi Customer

---

# Mobile Journey

Dashboard

↓

Pending Action

↓

Orders

↓

Notification

↓

Quick Action

↓

Logout

---

Admin tidak disarankan mengelola CMS melalui Mobile.

Dashboard Mobile hanya untuk monitoring.

---

# Pain Points

Order terlalu banyak.

↓

Solusi

Priority Queue.

---

Partner tidak tersedia.

↓

Solusi

Availability Dashboard.

---

Payment terlambat.

↓

Solusi

Reminder.

---

Customer marah.

↓

Solusi

Complaint Workflow.

---

Admin lupa Follow Up.

↓

Solusi

Reminder & Activity Queue.

---

# Analytics

Track

Admin Login

↓

Order Assigned

↓

Partner Approved

↓

Invoice Generated

↓

Payment Verified

↓

Complaint Resolved

↓

Article Published

↓

Service Created

↓

User Created

↓

Settings Updated

---

# KPI

Average Assignment Time

↓

Average Response Time

↓

Complaint Resolution Time

↓

Payment Verification Time

↓

Partner Approval Time

↓

Daily Completed Orders

↓

Daily Revenue

↓

Customer Satisfaction

---

# UX Rules

Pending Action selalu berada paling atas.

↓

Order terbaru selalu muncul real-time.

↓

Assignment maksimal 3 klik.

↓

Partner Search maksimal 2 detik.

↓

Payment Verification maksimal 1 menit.

↓

Complaint mudah ditemukan.

↓

Search tersedia di semua halaman.

↓

Dashboard dapat digunakan tanpa mouse.

---

# Future

AI Dispatcher

↓

Auto Assignment

↓

AI Complaint Analysis

↓

AI Fraud Detection

↓

WhatsApp Automation

↓

Realtime GPS Tracking

↓

Predictive Revenue Dashboard

↓

Business Intelligence

↓

Workflow Automation

↓

Multi Company Support

↓

Multi Region Management

↓

AI Operational Assistant

---

# Definition of Success

Admin mampu:

Melihat kondisi bisnis

<5 detik

↓

Memproses Booking

<3 menit

↓

Assign Partner

<1 menit

↓

Verifikasi Payment

<1 menit

↓

Menangani Complaint

<10 menit

↓

Mengelola Content

<5 menit

Apabila target tersebut tidak tercapai, maka alur operasional perlu dievaluasi.

---

# Source of Truth

Seluruh workflow operasional platform harus mengacu pada dokumen ini.

Apabila terdapat konflik antara kemudahan operasional dan kompleksitas sistem, maka kemudahan operasional harus diprioritaskan.
