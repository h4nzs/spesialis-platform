# Testing

# End-to-End Flows

Project: Specialist Platform

Version: 1.1

Status: LOCKED

---

# Purpose

Dokumen ini mendefinisikan seluruh End-to-End (E2E) Flow yang wajib diuji menggunakan Playwright sebelum aplikasi dirilis.

Seluruh flow mensimulasikan perilaku pengguna nyata.

Apabila salah satu flow gagal.

Release diblokir.

---

# Test Environment

Environment

Staging

---

Browser

Chrome

Firefox

Safari

Edge

---

Viewport

Desktop

Tablet

Mobile

---

Data

Seed Database

---

# Flow Convention

ID

Title

Actor

Steps

Expected Result

Priority

---

# E2E-001

Guest Booking

Actor

Guest

Priority

P0

Flow

Homepage

↓

Klik Booking

↓

Pilih Service

↓

Isi Data

↓

Submit

↓

Redirect WhatsApp

↓

Booking berhasil dibuat

Expected

Booking muncul di Dashboard Admin.

---

# E2E-002

Guest Tracking

Actor

Guest

Priority

P0

Flow

Homepage

↓

Tracking

↓

Masukkan Booking Number

↓

Lihat Timeline

Expected

Timeline benar.

---

# E2E-003

Customer Login

Actor

Customer

Priority

P0

Flow

Login

↓

Dashboard

↓

Order History

↓

Profile

↓

Logout

Expected

Semua halaman berhasil diakses.

---

# E2E-004

Customer Repeat Booking

Actor

Customer

Priority

P1

Flow

Dashboard

↓

History

↓

Booking Again

↓

Edit Jadwal

↓

Submit

Expected

Order baru dibuat.

---

# E2E-005

Customer Review

Actor

Customer

Priority

P1

Flow

Dashboard

↓

Completed Order

↓

Review

↓

Submit

Expected

Review tersimpan.

---

# E2E-006

Partner Login

Actor

Partner

Priority

P0

Flow

Login

↓

Dashboard

↓

Assignment

↓

Logout

Expected

Dashboard tampil.

---

# E2E-007

Partner Accept Assignment

Actor

Partner

Priority

P0

Flow

Notification

↓

Assignment

↓

Accept

↓

Dashboard

Expected

Status

Accepted.

---

# E2E-008

Partner Reject Assignment

Actor

Partner

Priority

P1

Flow

Assignment

↓

Reject

↓

Pilih Alasan

↓

Submit

Expected

Admin menerima status Reject.

---

# E2E-009

Partner Complete Job

Actor

Partner

Priority

P0

Flow

Assignment

↓

Working

↓

Completed

Expected

Order Waiting Confirmation.

---

# E2E-010

Corporate Login

Actor

Corporate

Priority

P0

Flow

Login

↓

Dashboard

↓

Branch

↓

Invoice

↓

Logout

Expected

Semua data tampil.

---

# E2E-011

Corporate Create Maintenance

Actor

Corporate

Priority

P0

Flow

Dashboard

↓

Maintenance

↓

New Request

↓

Submit

Expected

Order dibuat.

---

# E2E-012

Corporate Download Invoice

Actor

Corporate

Priority

P1

Flow

Dashboard

↓

Invoice

↓

Download PDF

Expected

PDF berhasil.

---

# E2E-013

Corporate Export Report

Actor

Corporate

Priority

P2

Flow

Reports

↓

Export Excel

Expected

File berhasil.

---

# E2E-014

Admin Login

Actor

Admin

Priority

P0

Flow

Login

↓

Dashboard

Expected

Dashboard tampil.

---

# E2E-015

Admin Assign Partner

Actor

Admin

Priority

P0

Flow

Booking

↓

Assign Partner

↓

Save

Expected

Partner mendapat Assignment.

---

# E2E-016

Admin Approve Partner

Actor

Admin

Priority

P1

Flow

Partner

↓

Approve

↓

Save

Expected

Status Verified.

---

# E2E-017

Admin Verify Payment

Actor

Finance

Priority

P1

Flow

Payment

↓

Verify

↓

Paid

Expected

Payment berhasil.

---

# E2E-018

Admin Generate Invoice

Actor

Finance

Priority

P1

Flow

Invoice

↓

Generate

↓

Download

Expected

Invoice tersedia.

---

# E2E-019

Admin Publish Article

Actor

Content Manager

Priority

P1

Flow

CMS

↓

Draft

↓

Publish

Expected

Artikel muncul Public.

---

# E2E-020

Admin Manage CMS Pages

Actor

Content Manager

Priority

P1

Note

Homepage Section management telah dihapus. Digantikan dengan CMS Pages management.

Flow

CMS

↓

Halaman (Pages)

↓

Edit Halaman System (tentang-kami, syarat-ketentuan, kebijakan-privasi, kontak)

↓

Simpan

Expected

Perubahan konten tampil di halaman publik (fallback ke hardcoded jika CMS kosong).

---

# E2E-021

Admin Create CMS Page

Actor

Content Manager

Priority

P1

Flow

CMS

↓

Halaman

↓

Tambah Baru

↓

Isi Title, Slug, Content

↓

Simpan

↓

Buka halaman publik

Expected

Halaman baru tampil di URL sesuai slug.

---

# E2E-022

Media Upload

Actor

Admin

Priority

P2

Flow

Media

↓

Upload

↓

Preview

Expected

File berhasil.

---

# E2E-023

Search Flow

Actor

Guest

Priority

P2

Flow

Homepage

↓

Search

↓

Result

↓

Service Detail

Expected

Result sesuai.

---

# E2E-024

Complaint Flow

Actor

Customer

Priority

P1

Flow

Completed Order

↓

Complaint

↓

Submit

↓

Admin Dashboard

Expected

Complaint masuk Dashboard.

---

# E2E-025

Partner Verification

Actor

Partner + Admin

Priority

P1

Flow

Partner Upload Dokumen

↓

Admin Review

↓

Approve / Reject (dengan alasan)

Expected

Partner Verified.

---

# E2E-026

Forgot Password

Actor

Customer

Priority

P1

Flow

Forgot Password

↓

OTP

↓

New Password

↓

Login

Expected

Password berubah.

Future.

---

# E2E-027

Permission Test

Actor

Customer

Priority

P0

Flow

Customer membuka

/admin

Expected

403.

---

# E2E-028

Session Expired

Actor

Semua User

Priority

P1

Flow

Session Expired

↓

Refresh

Expected

Redirect Login.

---

# E2E-029

Responsive Test

Actor

Guest

Priority

P1

Flow

320px

↓

768px

↓

1024px

↓

1920px

Expected

Layout tetap benar.

---

# E2E-030

Accessibility Test

Actor

Automation

Priority

P1

Flow

Keyboard

↓

Tab

↓

Focus

↓

ARIA

Expected

Lulus axe-core.

---

# E2E-031

Production Smoke Test

Priority

P0

Flow

Homepage

↓

Booking

↓

Dashboard

↓

CMS

↓

Logout

Expected

Semua berjalan normal.

---

# Cross Module Flow

Booking

↓

Admin Assignment

↓

Partner Accept

↓

Partner Working

↓

Partner Complete

↓

Admin Confirmation

↓

Customer Review

↓

Repeat Booking

Expected

Seluruh lifecycle berhasil tanpa error.

---

# Release Checklist

Semua E2E P0

PASS

↓

Semua Smoke Test

PASS

↓

Regression

PASS

↓

Build

PASS

↓

Deployment

PASS

---

# Failure Policy

Apabila ada satu Flow P0 gagal.

↓

Deployment diblokir.

↓

Bug harus diperbaiki.

↓

Flow dijalankan ulang.

---

# Future

Visual Regression

↓

Performance Regression

↓

AI Generated E2E

↓

Multi Browser Parallel

↓

Load Testing Integration

↓

Chaos Testing

↓

Synthetic Monitoring

---

# Source of Truth

Seluruh End-to-End Automation wajib mengacu pada dokumen ini.

Flow baru wajib ditambahkan setiap kali terdapat fitur baru.
