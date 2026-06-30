# Frontend Wireframe

# Admin Dashboard

Project: Specialist Platform

Version: 1.0

Status: LOCKED

---

# Goals

Admin Dashboard merupakan pusat operasional seluruh platform.

Semua aktivitas bisnis dikelola dari dashboard ini.

Dashboard harus memungkinkan Admin mengelola platform tanpa membutuhkan akses database secara langsung.

---

# Target User

Admin

Dispatcher

Finance

Content Manager

Super Admin

---

# Dashboard Overview

Desktop

┌──────────────────────────────────────────────────────────────────────────────┐
│ Top Navbar │
├────────────────┬─────────────────────────────────────────────────────────────┤
│ Sidebar │ Dashboard │
│ │ │
└────────────────┴─────────────────────────────────────────────────────────────┘

---

Mobile

Sidebar berubah menjadi Drawer.

---

# Sidebar

Dashboard

Orders

Assignments

Customers

Partners

Corporate

Services

Invoices

Payments

Articles

Media

Notifications

Reports

Users

System Settings

Audit Log

Logout

---

# Dashboard Homepage

┌────────────────────────────────────────────────────┐

Good Morning Admin

↓

Today's Statistics

↓

Pending Actions

↓

Latest Orders

↓

Partner Availability

↓

Recent Activities

↓

System Health

└────────────────────────────────────────────────────┘

---

# Statistics Widget

Desktop

6 Widget

---

Today's Orders

↓

Orders In Progress

↓

Completed Orders

↓

Available Partners

↓

Pending Payments

↓

Revenue

---

# Pending Actions

Verifikasi Partner

↓

Corporate Approval

↓

Pending Payment

↓

Pending Complaint

↓

Draft Article

↓

Contract Renewal

---

Widget selalu berada di atas.

---

# Orders

Desktop

Table

Booking Number

Customer

Service

Area

Status

Assigned Partner

Created At

Action

---

Action

View

Assign

Edit

Cancel

---

Quick Search tersedia.

---

# Order Detail

Customer

↓

Address

↓

Service

↓

Notes

↓

Timeline

↓

Assignment

↓

Payment

↓

Internal Note

↓

Activity Log

---

Admin dapat:

Assign Partner

Edit Jadwal

Cancel

Update Status

Tambah Catatan

---

# Assignment Dashboard

Waiting Assignment

↓

Assigned

↓

Accepted

↓

Rejected

↓

Working

↓

Completed

---

Partner Rejected

↓

Quick Assign Partner Lain

---

Partner Busy

↓

Suggest Partner Terdekat

(Future)

---

# Customer Management

Table

Customer

↓

Phone

↓

Email

↓

Orders

↓

Last Booking

↓

Status

↓

Action

---

Detail

Profile

↓

Addresses

↓

Order History

↓

Review

↓

Complaint

↓

Activity

---

# Partner Management

Table

Partner

↓

Skill

↓

Coverage Area

↓

Rating

↓

Availability

↓

Verification

↓

Status

---

Detail

Personal Information

↓

KTP

↓

Certificates

↓

Performance

↓

Assignment History

↓

Earnings

↓

Documents

↓

Internal Notes

---

Action

Approve

Reject

Suspend

Deactivate

---

# Corporate Management

Company

↓

PIC

↓

Branch

↓

Contract

↓

Invoice

↓

Outstanding Payment

↓

Status

---

Detail

Branches

↓

Orders

↓

Maintenance

↓

Invoice

↓

Contract

↓

History

---

# Service Management

Category

↓

Service

↓

SEO

↓

Status

↓

Published

↓

Action

---

Admin dapat:

Tambah Service

Edit

Archive

Delete

---

# Invoice Management

Invoice Number

↓

Company

↓

Customer

↓

Amount

↓

Status

↓

Due Date

↓

Action

---

Action

Generate

Verify

Send

Download

---

# Payment Management

Payment ID

↓

Booking

↓

Customer

↓

Amount

↓

Method

↓

Status

↓

Action

---

Admin melakukan verifikasi manual.

---

# Complaint Management

Complaint

↓

Customer

↓

Booking

↓

Priority

↓

Assigned Admin

↓

Status

---

# Review Moderation

Review

↓

Rating

↓

Customer

↓

Partner

↓

Status

↓

Publish

Hide

---

# Notification Center

Partner

↓

Customer

↓

Corporate

↓

System

↓

Announcement

---

# Reports

Revenue

↓

Orders

↓

Partners

↓

Customers

↓

Services

↓

Area

↓

Complaints

↓

Reviews

---

Export

CSV

Excel

PDF

---

# CMS

Landing Page

↓

Articles

↓

FAQ

↓

SEO

↓

Media

↓

Category

↓

Tags

↓

Author

---

# Media Library

Image

↓

Document

↓

PDF

↓

Video

↓

Folder

↓

Search

↓

Upload

---

# Analytics

Order Trend

↓

Revenue

↓

Conversion

↓

Popular Service

↓

Area

↓

Partner Performance

↓

Customer Growth

---

# Audit Log

Login

↓

Order Update

↓

Assignment

↓

Payment Verification

↓

Content Update

↓

System Changes

---

Tidak dapat dihapus.

---

# Search

Global Search

Customer

Partner

Booking

Invoice

Company

Article

---

# Filter

Status

↓

Area

↓

Service

↓

Partner

↓

Date

↓

Priority

↓

Payment

↓

Verification

---

# Notifications

Realtime.

Badge.

Priority.

Desktop Notification.

---

# System Health

Database

API

CMS

Mail

Redis

Storage

Disk

CPU

Memory

---

Hijau

↓

Normal

---

Kuning

↓

Warning

---

Merah

↓

Critical

---

# Quick Actions

Create Booking

↓

Assign Partner

↓

Approve Partner

↓

Publish Article

↓

Verify Payment

↓

Generate Invoice

---

# Mobile Layout

Summary

↓

Pending Action

↓

Orders

↓

Notification

↓

Quick Action

↓

Reports

---

Sidebar menjadi Drawer.

---

# Loading

Skeleton Widget

↓

Skeleton Table

↓

Skeleton Charts

↓

Skeleton Form

---

# Empty State

No Orders

↓

No Partner

↓

No Customer

↓

No Articles

↓

No Payment

↓

Illustration

↓

CTA

---

# Error State

Terjadi kesalahan.

↓

Refresh

↓

Retry

↓

Hubungi Super Admin

---

# Accessibility

Keyboard Navigation

↓

Screen Reader

↓

ARIA

↓

Visible Focus

↓

High Contrast

---

# Performance

SSR

↓

Dashboard

---

Hydration

Chart

Search

Filter

Table

Notification

---

# Security

Role Based Access Control.

---

Admin hanya melihat menu sesuai Role.

---

Finance

↓

Payment

Invoice

---

Dispatcher

↓

Orders

Assignments

---

Content Manager

↓

CMS

SEO

Articles

---

Super Admin

↓

Semua akses.

---

# Analytics

Track

Admin Login

↓

Order Assigned

↓

Payment Verified

↓

Partner Approved

↓

Article Published

↓

Invoice Generated

↓

User Created

---

# Success Criteria

Admin mampu:

Melihat seluruh Pending Action

<5 detik

↓

Assign Partner

<30 detik

↓

Verifikasi Payment

<30 detik

↓

Approve Partner

<1 menit

↓

Publish Artikel

<2 menit

↓

Menemukan Booking

<10 detik

---

# Future

Realtime Dashboard

↓

AI Dispatcher

↓

AI Fraud Detection

↓

Auto Assignment

↓

WhatsApp Automation

↓

Payment Gateway

↓

Multi Branch Admin

↓

BI Dashboard

↓

Predictive Analytics

↓

AI Operational Assistant
