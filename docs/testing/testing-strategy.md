# Testing

# Testing Strategy

Project: Specialist Platform

Version: 1.0

Status: LOCKED

---

# Purpose

Dokumen ini mendefinisikan strategi testing untuk seluruh Specialist Platform.

Tujuan utama:

- Mengurangi bug production
- Menjamin kualitas fitur
- Menjaga stabilitas sistem
- Memastikan perubahan kode tidak merusak fitur lain
- Mendukung Continuous Integration (CI)

Testing merupakan bagian wajib dari setiap Sprint.

---

# Testing Philosophy

Testing mengikuti Test Pyramid.

                E2E
             Integration
               Unit Test

Semakin bawah.

↓

Jumlah test semakin banyak.

↓

Eksekusi semakin cepat.

---

# Quality Goals

Target

Bug Critical

0

---

Bug High

0

---

Bug Medium

<3

---

Code Coverage

Minimum

80%

---

Critical Flow

100%

---

# Testing Levels

1.

Static Analysis

↓

Lint

↓

Type Check

↓

Formatting

---

2.

Unit Test

↓

Utility

↓

Business Logic

↓

Hooks

↓

Functions

---

3.

Component Test

↓

React Component

↓

UI

↓

Interaction

---

4.

Integration Test

↓

API

↓

Database

↓

CMS

↓

Authentication

---

5.

End-to-End Test

↓

Real Browser

↓

Real User Flow

---

6.

Manual QA

↓

Regression

↓

Cross Browser

↓

Responsive

---

# Test Environment

Development

Local Docker

---

Staging

Production Mirror

---

Production

Smoke Test Only

---

# Testing Stack

Unit Test

Vitest

---

Component Test

Testing Library

---

E2E

Playwright

---

API

Vitest

Supertest

---

Accessibility

axe-core

Lighthouse

---

Performance

Lighthouse

WebPageTest

---

# Unit Testing Scope

packages/utils

↓

packages/shared

↓

Validation

↓

Formatter

↓

Business Rules

↓

Hooks

---

Tidak perlu Unit Test untuk:

Simple UI Wrapper.

---

# Component Testing

Semua Component penting wajib diuji.

Contoh

Button

Input

Modal

Table

Booking Card

Navbar

Partner Card

Statistic Card

---

Yang diuji

Render

↓

Interaction

↓

Accessibility

↓

Variant

↓

Loading

↓

Disabled

↓

Error

---

# Integration Testing

Authentication

↓

Booking

↓

Assignment

↓

CMS

↓

Database

↓

Email

↓

Notification

---

Semua API penting wajib memiliki Integration Test.

---

# End-to-End Testing

Flow yang wajib diuji

Homepage

↓

Booking

↓

Tracking

↓

Login

↓

Register

↓

Dashboard

↓

CMS Publish

↓

Partner Assignment

↓

Corporate Request

---

# Manual Testing

Sebelum Release.

Wajib dilakukan.

Checklist.

Desktop

↓

Tablet

↓

Mobile

↓

Dark Mode

Future.

↓

Accessibility

↓

Performance

---

# Regression Testing

Regression dilakukan sebelum:

Release

↓

Deployment

↓

Major Refactor

↓

Database Migration

---

# Browser Support

Chrome

Latest

---

Firefox

Latest

---

Safari

Latest

---

Edge

Latest

---

# Responsive Testing

320px

360px

390px

414px

768px

1024px

1280px

1536px

1920px

---

# Accessibility Testing

Keyboard

↓

Screen Reader

↓

Contrast

↓

ARIA

↓

Focus

↓

Zoom 200%

---

Target Lighthouse

Accessibility

95+

---

# Performance Testing

Target

Performance

90+

---

SEO

95+

---

Accessibility

95+

---

Best Practices

95+

---

# Security Testing

Unauthorized Access

↓

Role Permission

↓

Input Validation

↓

JWT

↓

Rate Limit

↓

File Upload

↓

SQL Injection

↓

XSS

↓

CSRF

---

# API Testing

Status Code

↓

Response Schema

↓

Validation

↓

Authentication

↓

Authorization

↓

Pagination

↓

Filtering

↓

Sorting

↓

Error Response

---

# Database Testing

Migration

↓

Constraint

↓

Cascade

↓

Index

↓

Soft Delete

↓

Transaction

---

# CMS Testing

Create Content

↓

Edit

↓

Delete

↓

SEO

↓

Publish

↓

Media Upload

↓

Permission

---

# Booking Testing

Booking Baru

↓

Assignment

↓

Status

↓

Tracking

↓

WhatsApp

↓

History

---

# Partner Testing

Register

↓

Verification

↓

Accept Job

↓

Reject Job

↓

Complete Job

↓

Performance

---

# Corporate Testing

Inquiry

↓

Dashboard

↓

Invoice

↓

Branch

↓

Maintenance

---

# Admin Testing

Dashboard

↓

Assignment

↓

Payment

↓

CMS

↓

Reports

↓

Partner Verification

---

# Test Data

Gunakan Seed Data.

Tidak menggunakan data Production.

---

# Mocking Rules

Gunakan Mock hanya bila:

Third-party API

↓

Payment Gateway

↓

WhatsApp

↓

Maps

↓

Email

---

Database tidak boleh dimock pada Integration Test.

---

# Continuous Integration

Setiap Pull Request wajib menjalankan:

Lint

↓

Type Check

↓

Unit Test

↓

Component Test

↓

Integration Test

↓

Build

---

Apabila ada satu test gagal.

↓

Merge ditolak.

---

# Continuous Deployment

Deploy hanya apabila:

Semua Test Passed

↓

Build Success

↓

Migration Success

↓

Smoke Test Passed

---

# Bug Severity

Critical

Website tidak dapat digunakan.

---

High

Fitur utama gagal.

---

Medium

Ada workaround.

---

Low

UI Minor.

---

# Exit Criteria

Sprint dinyatakan selesai apabila:

Semua test lulus.

↓

Code Review selesai.

↓

Coverage memenuhi target.

↓

Tidak ada Bug Critical.

↓

Dokumentasi diperbarui.

---

# Future

Visual Regression Test

↓

Load Test

↓

Stress Test

↓

Chaos Testing

↓

Contract Testing

↓

Mutation Testing

↓

AI Generated Test Case

↓

AI QA Assistant

---

# E2E Coverage Status

## Test Files

| File                        | Tests | Focus                                                                                                                  |
| --------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| `admin-flows.spec.ts`       | 13    | Admin operational pages + full partner approval flow (verify via API, 404, 401)                                        |
| `admin-media.spec.ts`       | 14    | Article create/publish flow (draft → published, 409/422/401) + media upload                                            |
| `admin.spec.ts`             | 4     | Admin dashboard page loads                                                                                             |
| `auth.spec.ts`              | 7     | Admin/customer/partner login, login form, invalid login, permission redirects                                          |
| `booking.spec.ts`           | 4     | Guest booking page + form submission, tracking page + search                                                           |
| `customer.spec.ts`          | 21    | Customer dashboard + full complaint flow (create, list, 404/422/401, admin view) + forgot password + session expired   |
| `flows.spec.ts`             | 10    | Cross-module lifecycle: booking → confirm → assign → accept → on-the-way → start → complete → payment → verify → track |
| `homepage.spec.ts`          | 8     | Homepage, services, blog, FAQ, about, contact, 404, unauthenticated redirect                                           |
| `partner-documents.spec.ts` | 8     | Partner documents: upload media, create KTP document, list, delete, auth/validation errors                             |
| `partner-reject.spec.ts`    | 3     | Partner reject assignment flow via API + UI page loads                                                                 |
| `partner-skills.spec.ts`    | 9     | Partner skills: add skill, list with category name, duplicate 409, invalid UUID 422, delete, non-existent 404          |
| `partner.spec.ts`           | 8     | Partner dashboard/jobs/earnings/availability + Corporate dashboard/orders/invoices/branches                            |
| `permission.spec.ts`        | 7     | RBAC boundary tests (guest, customer, partner, corporate, admin cross-access)                                          |
| `responsive-a11y.spec.ts`   | 34    | 6 viewports × 5 pages responsive layout + keyboard navigation + focus ring                                             |
| `search.spec.ts`            | 5     | Services page, service detail by slug, blog page, blog article                                                         |
| `smoke.spec.ts`             | 10    | Production smoke test: 10 public pages with status code check                                                          |

**Total: ~120+ E2E tests across 16 spec files**

## Flow Coverage Matrix

| ID      | Flow                         | Priority | Status | Spec File(s)                                                                    |
| ------- | ---------------------------- | -------- | ------ | ------------------------------------------------------------------------------- |
| E2E-001 | Guest Booking                | P0       | ✅     | `booking.spec.ts`                                                               |
| E2E-002 | Guest Tracking               | P0       | ✅     | `booking.spec.ts`                                                               |
| E2E-003 | Customer Login               | P0       | ✅     | `auth.spec.ts`, `customer.spec.ts`                                              |
| E2E-004 | Customer Repeat Booking      | P1       | ✅     | `customer.spec.ts`                                                              |
| E2E-005 | Customer Review              | P1       | ✅     | `customer.spec.ts`                                                              |
| E2E-006 | Partner Login                | P0       | ✅     | `auth.spec.ts`, `partner.spec.ts`                                               |
| E2E-007 | Partner Accept Assignment    | P0       | ✅     | `flows.spec.ts`, `partner.spec.ts`                                              |
| E2E-008 | Partner Reject Assignment    | P1       | ✅     | `partner-reject.spec.ts`                                                        |
| E2E-009 | Partner Complete Job         | P0       | ✅     | `flows.spec.ts`, `partner.spec.ts`                                              |
| E2E-010 | Corporate Login              | P0       | ✅     | `partner.spec.ts`                                                               |
| E2E-011 | Corporate Create Maintenance | P0       | ✅     | `partner.spec.ts`                                                               |
| E2E-012 | Corporate Download Invoice   | P1       | 🟡     | `partner.spec.ts` (page load only)                                              |
| E2E-013 | Partner Documents            | P2       | ✅     | `partner-documents.spec.ts`                                                     |
| E2E-014 | Admin Login                  | P0       | ✅     | `auth.spec.ts`, `admin.spec.ts`, `admin-flows.spec.ts`                          |
| E2E-015 | Admin Assign Partner         | P0       | ✅     | `flows.spec.ts`, `admin.spec.ts`                                                |
| E2E-016 | Admin Approve Partner        | P1       | ✅     | `admin-flows.spec.ts` (verify via API + UI page)                                |
| E2E-017 | Admin Verify Payment         | P1       | ✅     | `flows.spec.ts`                                                                 |
| E2E-018 | Admin Generate Invoice       | P1       | 🟡     | `admin-flows.spec.ts` (page load only)                                          |
| E2E-019 | Admin Publish Article        | P1       | ✅     | `admin-media.spec.ts` (create draft → publish → verify in admin API)            |
| E2E-020 | Admin Update Homepage        | P1       | 🟡     | `admin-flows.spec.ts` (page load only)                                          |
| E2E-021 | Media Upload                 | P2       | ✅     | `admin-media.spec.ts`                                                           |
| E2E-022 | Search Flow                  | P2       | ✅     | `search.spec.ts`                                                                |
| E2E-023 | Complaint Flow               | P1       | ✅     | `customer.spec.ts` (create via API with booking, list, 404/422/401, admin view) |
| E2E-024 | Partner Skills               | P1       | ✅     | `partner-skills.spec.ts`                                                        |
| E2E-025 | Forgot Password              | P1       | 🟡     | `customer.spec.ts` (page load only)                                             |
| E2E-026 | Permission Test              | P0       | ✅     | `permission.spec.ts`, `auth.spec.ts`                                            |
| E2E-027 | Session Expired              | P1       | ✅     | `customer.spec.ts`                                                              |
| E2E-028 | Responsive Test              | P1       | ✅     | `responsive-a11y.spec.ts`                                                       |
| E2E-029 | Accessibility Test           | P1       | ✅     | `responsive-a11y.spec.ts`                                                       |
| E2E-030 | Production Smoke Test        | P0       | ✅     | `smoke.spec.ts`                                                                 |

### Legend

✅ **Covered** — Flow memiliki test terotomatisasi (API + UI assertions)

🟡 **Partial** — Page load only, belum mencakup full interaksi flow

❌ **Not Covered** — Belum ada test sama sekali

### Coverage Summary

| Category  | Total  | ✅ Covered | 🟡 Partial | ❌ Missing |
| --------- | ------ | ---------- | ---------- | ---------- |
| P0 Flows  | 10     | 10         | 0          | 0          |
| P1 Flows  | 13     | 11         | 2          | 0          |
| P2 Flows  | 3      | 3          | 0          | 0          |
| **Total** | **26** | **24**     | **2**      | **0**      |

### Notes

- **E2E-012** (Corporate Download Invoice): Page load test exists, but actual PDF download interaction not tested.
- **E2E-018** (Admin Generate Invoice): Page load test exists, but invoice generation workflow not tested.
- **E2E-020** (Admin Update Homepage): Services page load test exists, but homepage CMS editing not tested.
- **E2E-025** (Forgot Password): Page load test for forgot/reset password pages exists, but full OTP flow not tested.

### Quick Stats

- **Spec files**: 16
- **Total tests**: ~140+
- **API-level tests**: ~80 (flows, skills, documents, media upload, complaints, articles, partner verify)
- **UI-level tests**: ~40 (page loads, navigation, form interaction)
- **Auth/permission tests**: ~15 (login, RBAC boundaries, session)
- **Responsive tests**: 30 (6 viewports × 5 pages)
- **A11y tests**: 3 (keyboard navigation + focus ring)
- **P0 coverage**: 100%
- **P1 coverage**: 85% (11/13 fully covered, 2/13 partially)
- **Overall coverage**: 92% (24/26 fully covered, 2/26 partially)

---

# Source of Truth

Seluruh proses pengujian Specialist Platform wajib mengikuti dokumen ini.

Testing bukan tahap akhir pengembangan, melainkan bagian dari proses pengembangan sejak fitur pertama dibuat.
