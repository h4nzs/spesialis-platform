# Frontend Wireframe

# Corporate Dashboard

Project: Specialist Platform

Version: 1.0

Status: LOCKED

---

# Goals

Corporate Dashboard merupakan pusat operasional seluruh pelanggan B2B.

Dashboard dirancang untuk perusahaan yang memiliki:

- Banyak cabang
- Banyak order
- Maintenance berkala
- Kontrak layanan
- Invoice bulanan

Tujuan utama:

Memberikan kontrol penuh terhadap seluruh aktivitas maintenance perusahaan.

---

# Target User

Facility Manager

Building Manager

Office Manager

Procurement

General Affair (GA)

Operation Manager

Owner

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

Orders

Branches

Maintenance

Invoices

Contracts

Reports

Company Profile

Notifications

Support

Logout

---

# Dashboard Overview

┌────────────────────────────────────────────┐

Company Greeting

↓

Company Summary

↓

Active Contract

↓

Active Maintenance

↓

Outstanding Invoice

↓

Quick Actions

↓

Recent Activity

└────────────────────────────────────────────┘

---

# Company Summary

Widget

Active Branches

↓

Active Orders

↓

Monthly Maintenance

↓

Completed Orders

↓

Outstanding Invoice

↓

Average Response Time

---

Desktop

6 Widget

---

Tablet

3 x 2

---

Mobile

1 Column

---

# Quick Actions

Create Service Request

↓

Request Outsourcing

↓

Download Invoice

↓

Contact Account Manager

---

Desktop

4 Card

---

Mobile

2 x 2

---

# Active Maintenance

Card

┌──────────────────────────────┐

Branch

↓

Service

↓

Schedule

↓

Status

↓

Assigned Partner

↓

View Detail

└──────────────────────────────┘

---

Status

Scheduled

Confirmed

Partner Assigned

On Site

Working

Completed

Cancelled

---

# Branch Management

Table

Branch Name

↓

Address

↓

PIC

↓

Total Orders

↓

Last Maintenance

↓

Status

↓

Action

---

Branch Detail

Address

↓

PIC

↓

Phone

↓

Service History

↓

Invoice History

↓

Maintenance Schedule

---

# Create Branch

Fields

Branch Name

Address

PIC Name

PIC Phone

Email

Notes

---

Branch dapat dinonaktifkan tanpa dihapus.

---

# Maintenance Schedule

Calendar View

↓

List View

↓

Timeline View

---

Status

Upcoming

↓

Today

↓

Completed

↓

Overdue

---

# Service History

Filter

Branch

↓

Date

↓

Service

↓

Status

↓

Partner

↓

Invoice

---

Desktop

Table

---

Mobile

Card List

---

# Invoice

Table

Invoice Number

↓

Period

↓

Amount

↓

Status

↓

Due Date

↓

Download PDF

---

Status

Draft

Issued

Paid

Overdue

Cancelled

---

Invoice Detail

Company

↓

Billing Address

↓

Order List

↓

Tax

↓

Total

↓

Payment Status

---

# Contract

Active Contract

↓

Contract Period

↓

Coverage

↓

Service Level

↓

Renewal Date

↓

Status

---

CTA

Renew Contract

Contact Admin

---

# Reports

Monthly Report

↓

Maintenance Report

↓

Service Report

↓

Invoice Report

↓

Branch Report

---

Export

PDF

Excel

---

# Notifications

New Maintenance

↓

Invoice Issued

↓

Maintenance Completed

↓

Contract Expiring

↓

Announcement

---

Unread

Badge

---

# Company Profile

Company Name

NPWP

NIB

Email

Phone

Billing Address

PIC

Logo

---

Perubahan penting memerlukan verifikasi Admin.

---

# Search

Cari

Invoice

↓

Branch

↓

Order

↓

Service

↓

Partner

---

# Filter

Branch

↓

Service

↓

Date

↓

Status

↓

Invoice

---

# Empty State

Belum ada Maintenance.

↓

Illustration

↓

Ajukan Layanan

---

Belum ada Branch.

↓

Tambah Cabang

---

Belum ada Invoice.

↓

Hubungi Admin

---

# Loading

Skeleton Widget

↓

Skeleton Table

↓

Skeleton Calendar

---

# Error State

Terjadi kesalahan.

↓

Refresh

↓

Hubungi Account Manager

---

# WhatsApp Integration

Floating Button

Hubungi Account Manager

---

Invoice

↓

Konfirmasi Pembayaran

↓

WhatsApp

---

Maintenance

↓

Hubungi Admin

---

# Mobile Layout

Company Summary

↓

Quick Action

↓

Maintenance

↓

Invoice

↓

Branch

↓

Notification

↓

Profile

---

Bottom Navigation

Dashboard

Orders

Invoices

Notification

Profile

---

# Accessibility

Keyboard Navigation

↓

ARIA

↓

Screen Reader

↓

Visible Focus

---

# Performance

SSR

↓

Dashboard Data

---

Hydration

Search

Filter

Calendar

Notification

Export

---

# Security

Perusahaan hanya dapat melihat data miliknya.

---

Setiap User Corporate memiliki Role.

Contoh

Owner

Manager

Finance

GA

Viewer

---

Permission dapat diatur oleh Admin.

---

# Analytics

Track

Dashboard Open

↓

Invoice Download

↓

Maintenance Request

↓

Branch Created

↓

Report Export

↓

Contact Account Manager

---

# Success Criteria

Corporate User mampu:

Melihat seluruh cabang

<10 detik

↓

Melihat Invoice

<5 detik

↓

Membuat Service Request

<2 menit

↓

Menghubungi Account Manager

1 klik

↓

Mengunduh Invoice

<10 detik

---

# Future

Approval Workflow

↓

Purchase Order

↓

Budget Tracking

↓

Asset Management

↓

SLA Dashboard

↓

Realtime Partner Tracking

↓

Recurring Maintenance Automation

↓

ERP Integration

↓

SAP Integration

↓

API Integration

↓

AI Maintenance Recommendation

↓

Predictive Maintenance Dashboard
