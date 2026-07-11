# Frontend Specification

# Components

Project: Specialist Platform

Version: 1.1

Status: Locked

---

# Purpose

Dokumen ini mendefinisikan seluruh komponen UI yang digunakan pada platform.

Semua halaman wajib menggunakan komponen dari package:

@ahlipanggilan/ui

Tidak diperbolehkan membuat UI baru apabila komponen serupa sudah tersedia.

---

# Component Principles

Semua component harus:

- Reusable
- Accessible
- Responsive
- Typed
- Theme Ready
- Composition First
- Headless Friendly

---

# Component Hierarchy

Primitive

↓

Base Component

↓

Business Component

↓

Page Section

---

# Primitive Components

Button

Input

Textarea

Checkbox

Radio

Switch

Badge

Avatar

Spinner

Skeleton

Divider

Icon

Tooltip

Chip

Progress

Link

---

# Layout Components

Container

Section

Stack

Grid

Flex

Spacer

Card

Panel

Surface

---

# Navigation Components

Navbar

Sidebar

Mobile Navigation

Breadcrumb

Pagination

Tabs

Dropdown

Menu

Command Palette (Future)

---

# Form Components

Form

Form Field

Input

Textarea

Number Input

Phone Input

Email Input

Password Input

OTP Input

Date Picker

Time Picker

Select

Multi Select

Autocomplete

Address Search

File Upload

Image Upload

KTP Upload

Search Input

---

# Feedback Components

Alert

Toast

Modal

Drawer

Confirm Dialog

Loading Overlay

Skeleton

Progress Bar

Empty State

Error State

Success State

---

# Data Display

Table

Data Grid

Statistic Card

Timeline

Accordion

Description List

List

Tag

Badge

Key Value

Price

Rating

Review

---

# Media Components

Image

Gallery

Carousel

Video

PDF Preview

Lightbox

---

# Business Components

Service Card

Service Category

Booking Card

Booking Timeline

Booking Summary

Booking Status

Partner Card

Partner Rating

Partner Availability

Review Card

Invoice Card

Company Card

Article Card

FAQ Item

Notification Item

Complaint Card

Dashboard Widget

Activity Timeline

Order Status Badge

---

# Dashboard Components

Summary Card

Chart Card

Quick Action

Recent Activity

Revenue Widget

Order Widget

Partner Widget

Customer Widget

Statistic Widget

---

# Homepage Components

Hero

Hero Search

Service Grid

Featured Services

Why Choose Us

Statistics

Working Process

Testimonials

Coverage Area

Partner CTA

Corporate CTA

Latest Articles

FAQ

Final CTA

Footer

---

# Authentication Components

Login Form

Register Form

Forgot Password

Reset Password

OTP Verification

Email Verification

---

# Customer Components

Profile Card

Address Card

Address Form

Order History

Review Form

Complaint Form

Favorite Services

---

# Partner Components

Partner Profile

Availability Toggle

Assignment List

Job Detail

Income Summary

Performance Card

Verification Status

Document Upload

---

# Corporate Components

Company Profile

Branch List

Branch Form

Contract Card

Invoice Table

Maintenance History

Corporate Dashboard

---

# CMS Components

Article Editor (full page — ArticleEditor.tsx)

Page Editor (full page — PageEditor.tsx, menggantikan PageFormModal yang berbasis modal)

SEO Editor (SEOEditor.tsx — shared antara ArticleEditor & PageEditor)

Media Picker

Category Selector

Rich Text Editor (TipTap)

Slug Generator

Status Badge

Publish Action

---

# SEO Components

SEO Editor (packages/ui/src/components/SEOEditor.tsx)

- Meta title & description with character count
- Real-time preview (Google snippet)
- Shared between ArticleEditor and PageEditor

Schema Builder (packages/ui/src/components/SchemaBuilder.tsx)

- Visual JSON-LD Structured Data builder
- 6 template types: Article, FAQ, Service, LocalBusiness, BreadcrumbList, Organization
- Template selector dropdown
- Interactive field editor
- JSON preview pane
- Copy to clipboard
- Data disimpan di `schema_json` kolom `seo_metadata`

RoleManager (apps/web/src/components/dashboard/admin/RoleManager.tsx)

- Permission matrix: 8 SEO features × 8 roles
- Loading skeleton
- Interactive checkboxes for configurable roles
- Admin/Super Admin columns always disabled (always have access)
- Reset to defaults button
- Save permissions button
- Menyimpan di `system_settings` (category: `seo_permissions`)

SitemapSettings (apps/web/src/components/dashboard/admin/SitemapSettings.tsx)

- Konfigurasi prioritas & changefreq untuk 5 page types
- Page types: Static Pages, Services, Articles, Blog Listing, CMS Pages
- IndexNow key display
- Auto-ping IndexNow toggle
- Menyimpan di `system_settings` (category: `sitemap`)

RedirectManager (admin dashboard page — belum sebagai component standalone)

- CRUD redirect dengan source path, target path, status code (301/302)
- Duplicate source validation
- Active/inactive toggle

PageErrorsMonitor (admin dashboard page)

- 404 error monitoring table
- Top paths (sorted by count)
- Last 24h stats
- Delete individual / clear all actions

---

# Component Variants

Button

Primary

Secondary

Outline

Ghost

Danger

Success

Link

---

Card

Default

Outlined

Elevated

Interactive

Dashboard

---

Alert

Success

Info

Warning

Danger

---

Badge

Primary

Secondary

Success

Danger

Warning

Neutral

---

# Component Sizes

XS

SM

MD

LG

XL

---

# Component States

Default

Hover

Focus

Pressed

Loading

Disabled

Success

Warning

Danger

Selected

Active

Visited

Read Only

---

# Component Behavior

Hover

↓

Feedback

---

Focus

↓

Visible Focus Ring

---

Loading

↓

Skeleton atau Spinner

---

Disabled

↓

Tidak menerima Interaction

---

Error

↓

Validation Message

---

# Empty States

No Orders

No Services

No Partners

No Articles

No Notifications

No Reviews

No Search Result

No Internet

Server Error

Maintenance

---

# Loading States

Skeleton Card

Skeleton Table

Skeleton Form

Skeleton Dashboard

Skeleton Hero

---

# Error States

404

500

403

401

Offline

Timeout

API Error

Validation Error

---

# Accessibility Rules

Semua Button

↓

Keyboard Accessible

---

Semua Form

↓

Label

↓

Helper Text

↓

Validation

---

Semua Modal

↓

Focus Trap

↓

ESC Close

↓

ARIA

---

Semua Icon Button

↓

ARIA Label

---

Semua Table

↓

Responsive

↓

Keyboard Accessible

---

# Performance Rules

Lazy Load

Image

Gallery

Chart

Video

Map

---

Code Split

Dashboard

Editor

Map

Chart

---

Hydration

Hanya Component Interactive.

---

# Component Folder Structure

packages/ui/

components/

layout/

navigation/

forms/

feedback/

data-display/

business/

dashboard/

homepage/

icons/

hooks/

utils/

styles/

---

# Naming Convention

Button.tsx

BookingCard.tsx

PartnerCard.tsx

CompanyCard.tsx

InvoiceTable.tsx

HeroSection.tsx

ServiceGrid.tsx

---

# File Rules

Satu Component

↓

Satu Folder

Contoh

Button/

Button.tsx

Button.test.tsx

Button.types.ts

Button.stories.tsx

index.ts

---

# Styling Rules

Menggunakan Tailwind CSS v4.

Tidak menggunakan inline style.

Tidak menggunakan CSS Module kecuali benar-benar diperlukan.

Gunakan class-variance-authority (CVA) untuk variant component.

Gunakan tailwind-merge untuk menggabungkan className.

---

# Documentation Rules

Semua component wajib memiliki:

Purpose

Props

Variant

State

Accessibility

Example Usage

---

# Future Components

Command Palette

Calendar

Chat Widget

Realtime Notification

Interactive Map

Partner Live Tracking

Dark Mode Toggle

AI Assistant Widget

White Label Theme

---

# Source of Truth

Seluruh UI Platform harus berasal dari package:

@ahlipanggilan/ui

Tidak diperbolehkan membuat duplicate component pada apps/web.
