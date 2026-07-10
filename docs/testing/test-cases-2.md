# Testing

# Test Cases

Project: Specialist Platform

Version: 1.0

Part: 2

Status: LOCKED

---

# Customer Dashboard

---

## CUST-001

Customer membuka Dashboard.

Expected

Dashboard tampil.

---

## CUST-002

Belum memiliki Order.

Expected

Empty State.

---

## CUST-003

Riwayat Order tampil.

Expected

Urutan terbaru.

---

## CUST-004

Filter Status.

Expected

Data sesuai.

---

## CUST-005

Search Booking.

Expected

Order ditemukan.

---

## CUST-006

Tambah Alamat.

Expected

Alamat tersimpan.

---

## CUST-007

Edit Alamat.

Expected

Data berubah.

---

## CUST-008

Hapus Alamat.

Expected

Alamat hilang.

---

## CUST-009

Set Default Address.

Expected

Default berubah.

---

## CUST-010

Booking Lagi.

Expected

Form otomatis terisi.

---

## CUST-011

Update Profil.

Expected

Data berubah.

---

## CUST-012

Upload Foto.

Expected

Preview muncul.

---

## CUST-013

Review Order.

Expected

Review tersimpan.

---

## CUST-014

Complaint.

Expected

Ticket dibuat.

---

## CUST-015

Logout.

Expected

Session dihapus.

---

# Partner

---

## PARTNER-001

Partner Login.

Expected

Dashboard tampil.

---

## PARTNER-002

Availability Available.

Expected

Dashboard Admin berubah.

---

## PARTNER-003

Availability Busy.

Expected

Partner tidak muncul pada rekomendasi.

---

## PARTNER-004

Availability Offline.

Expected

Partner tidak dapat diassign.

---

## PARTNER-005

Assignment Baru.

Expected

Notification muncul.

---

## PARTNER-006

Accept Assignment.

Expected

Status Accepted.

---

## PARTNER-007

Reject Assignment.

Expected

Wajib alasan.

---

## PARTNER-008

Reject tanpa alasan.

Expected

Validation.

---

## PARTNER-009

Start Job.

Expected

Status Working.

---

## PARTNER-010

Complete Job.

Expected

Waiting Confirmation.

---

## PARTNER-011

Upload Sertifikat.

Expected

Pending Verification.

---

## PARTNER-012

Upload KTP.

Expected

Pending.

---

## PARTNER-013

Edit Skill.

Expected

Data berubah.

---

## PARTNER-014

Edit Coverage.

Expected

Data berubah.

---

## PARTNER-015

Lihat Pendapatan.

Expected

Nominal benar.

---

## PARTNER-016

Riwayat Job.

Expected

Urutan terbaru.

---

## PARTNER-017

Performance.

Expected

Rating sesuai.

---

## PARTNER-018

Logout.

Expected

Session dihapus.

---

# Corporate

---

## CORP-001

Login.

Expected

Dashboard.

---

## CORP-002

Tambah Cabang.

Expected

Cabang dibuat.

---

## CORP-003

Edit Cabang.

Expected

Berhasil.

---

## CORP-004

Nonaktifkan Cabang.

Expected

Tidak bisa dipakai Booking.

---

## CORP-005

Maintenance Request.

Expected

Order dibuat.

---

## CORP-006

Download Invoice.

Expected

PDF berhasil.

---

## CORP-007

Invoice belum tersedia.

Expected

Empty State.

---

## CORP-008

Export Report PDF.

Expected

File terdownload.

---

## CORP-009

Export Excel.

Expected

File benar.

---

## CORP-010

Search Branch.

Expected

Data sesuai.

---

## CORP-011

Filter Invoice.

Expected

Data sesuai.

---

## CORP-012

Lihat Contract.

Expected

Detail tampil.

---

## CORP-013

Hubungi Account Manager.

Expected

WhatsApp terbuka.

---

## CORP-014

Update Company Profile.

Expected

Pending Approval.

---

## CORP-015

Logout.

Expected

Session dihapus.

---

# Admin Dashboard

---

## ADMIN-001

Dashboard.

Expected

Semua Widget tampil.

---

## ADMIN-002

New Booking muncul.

Expected

Realtime.

---

## ADMIN-003

Assign Partner.

Expected

Assignment dibuat.

---

## ADMIN-004

Assign Partner Busy.

Expected

Warning.

---

## ADMIN-005

Assign Partner Offline.

Expected

Tidak bisa.

---

## ADMIN-006

Partner Reject.

Expected

Order kembali Waiting Assignment.

---

## ADMIN-007

Update Status.

Expected

Timeline berubah.

---

## ADMIN-008

Cancel Order.

Expected

Status Cancelled.

---

## ADMIN-009

Edit Booking.

Expected

Data berubah.

---

## ADMIN-010

Tambah Internal Note.

Expected

Note tersimpan.

---

## ADMIN-011

Approve Partner.

Expected

Status Verified.

---

## ADMIN-012

Reject Partner.

Expected

Reason wajib.

---

## ADMIN-013

Suspend Partner.

Expected

Tidak bisa menerima Assignment.

---

## ADMIN-014

Generate Invoice.

Expected

Invoice dibuat.

---

## ADMIN-015

Verify Payment.

Expected

Status Paid.

---

## ADMIN-016

Publish Article.

Expected

Website berubah.

---

## ADMIN-017

Draft Article.

Expected

Tidak muncul Public.

---

## ADMIN-018

Delete Service.

Expected

Soft Delete.

---

## ADMIN-019

Audit Log.

Expected

Activity tercatat.

---

## ADMIN-020

Global Search.

Expected

Semua Entity ditemukan.

---

# CMS

---

## CMS-001

Create Article.

Expected

Draft dibuat.

---

## CMS-002

Edit Article.

Expected

Data berubah.

---

## CMS-003

Delete Draft.

Expected

Draft hilang.

---

## CMS-004

Publish Article.

Expected

Live.

---

## CMS-005

SEO Score.

Expected

Terupdate.

---

## CMS-006

Slug Duplicate.

Expected

Validation.

---

## CMS-007

Upload Thumbnail.

Expected

Image tersimpan.

---

## CMS-008

Upload PDF.

Expected

File muncul.

---

## CMS-009

Edit CMS Page (tentang-kami, syarat-ketentuan, kebijakan-privasi, kontak).

Expected

Perubahan konten tampil di halaman publik (fallback jika CMS kosong).

---

## CMS-010

Buat CMS Page baru.

Expected

Halaman dengan slug custom tampil di URL yang sesuai.

---

## CMS-011

Hapus CMS Page.

Expected

Halaman publik fallback ke konten hardcoded.

---

## CMS-012

Tambah FAQ.

Expected

FAQ tampil.

---

## CMS-011

Tambah Service.

Expected

Landing Page dibuat.

---

## CMS-012

Archive Service.

Expected

Tidak tampil Public.

---

## CMS-016

Media Delete.

Expected

Soft Delete.

---

## CMS-017

Restore Revision.

Expected

Konten kembali.

---

## CMS-018

SEO Preview.

Expected

Google Preview benar.

---

# Notification

---

## NOTIF-001

Booking Baru.

Expected

Admin menerima.

---

## NOTIF-002

Partner Assigned.

Expected

Customer menerima.

---

## NOTIF-003

Payment Verified.

Expected

Customer menerima.

---

## NOTIF-004

Complaint.

Expected

Admin menerima.

---

## NOTIF-005

Corporate Lead.

Expected

Sales menerima.

---

# Upload

---

## FILE-001

Upload JPG.

Expected

Success.

---

## FILE-002

Upload PNG.

Expected

Success.

---

## FILE-003

Upload PDF.

Expected

Success.

---

## FILE-004

Upload EXE.

Expected

Rejected.

---

## FILE-005

Upload terlalu besar.

Expected

Validation.

---

# Security

---

## SEC-001

SQL Injection.

Expected

Blocked.

---

## SEC-002

XSS.

Expected

Sanitized.

---

## SEC-003

CSRF.

Expected

Rejected.

---

## SEC-004

JWT Invalid.

Expected

401.

---

## SEC-005

Expired JWT.

Expected

401.

---

## SEC-006

Role Customer akses Admin API.

Expected

403.

---

## SEC-007

Partner akses Corporate.

Expected

403.

---

## SEC-008

Directory Traversal.

Expected

Blocked.

---

## SEC-009

File Upload Script.

Expected

Rejected.

---

## SEC-010

Rate Limit.

Expected

429.

---

# API

---

## API-001

GET Collection.

Expected

200.

---

## API-002

GET Invalid ID.

Expected

404.

---

## API-003

POST Invalid Body.

Expected

400.

---

## API-004

PATCH Success.

Expected

200.

---

## API-005

DELETE Success.

Expected

204.

---

## API-006

Unauthorized.

Expected

401.

---

## API-007

Forbidden.

Expected

403.

---

## API-008

Pagination.

Expected

Metadata benar.

---

## API-009

Sorting.

Expected

Data sesuai.

---

## API-010

Filtering.

Expected

Data sesuai.

---

# Database

---

## DB-001

Migration.

Expected

Success.

---

## DB-002

Rollback.

Expected

Success.

---

## DB-003

Unique Constraint.

Expected

Validation.

---

## DB-004

Foreign Key.

Expected

Integrity terjaga.

---

## DB-005

Soft Delete.

Expected

Data tidak hilang permanen.

---

# Smoke Test

---

## SMOKE-001

Homepage.

Expected

OK.

---

## SMOKE-002

Booking.

Expected

OK.

---

## SMOKE-003

Dashboard.

Expected

OK.

---

## SMOKE-004

CMS.

Expected

OK.

---

## SMOKE-005

API.

Expected

OK.

---

## Exit Criteria

Semua Test P0

PASS

↓

Minimal 95% seluruh Test

PASS

↓

Bug Critical

0

↓

Bug High

0

↓

Siap masuk Staging.

Status

Draft
