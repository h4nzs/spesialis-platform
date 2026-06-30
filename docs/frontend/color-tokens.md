# Frontend Specification

# Color Tokens

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Dokumen ini mendefinisikan seluruh Design Tokens warna yang digunakan pada platform.

Seluruh warna wajib berasal dari file ini.

Developer tidak diperbolehkan menggunakan warna random.

---

# Design Philosophy

Warna harus memberikan kesan:

- Profesional
- Bersih
- Modern
- Terpercaya
- Premium
- Aman

Platform ini bukan Marketplace.

Platform ini adalah Professional Service Platform.

---

# Brand Colors

## Primary

Deep Blue

Digunakan untuk:

- CTA
- Link
- Active Navigation
- Primary Button
- Hero Highlight
- Icon Active

Tailwind

primary-50
primary-100
primary-200
primary-300
primary-400
primary-500
primary-600
primary-700
primary-800
primary-900
primary-950

---

## Secondary

Sky Blue

Digunakan untuk:

- Hover
- Badge
- Small Highlight
- Information Card

secondary-50

↓

secondary-950

---

## Accent

Cyan

Digunakan hanya sebagai aksen visual.

Contoh

Hero

Gradient

Statistic

CTA Background

---

# Semantic Colors

## Success

Green

Digunakan pada

Success Alert

Completed Booking

Paid

Approved

Verified

Partner Available

---

Token

success-50

↓

success-950

---

## Warning

Orange

Digunakan pada

Pending

Waiting Payment

Reminder

Attention

---

warning-50

↓

warning-950

---

## Danger

Red

Digunakan pada

Delete

Blocked

Cancelled

Complaint

Validation Error

---

danger-50

↓

danger-950

---

## Info

Blue

Digunakan pada

Information

Notification

Help

Tooltip

---

info-50

↓

info-950

---

# Neutral Palette

Neutral digunakan paling banyak.

neutral-0

White

---

neutral-50

Background

---

neutral-100

Section

---

neutral-200

Border

---

neutral-300

Divider

---

neutral-400

Placeholder

---

neutral-500

Disabled Text

---

neutral-600

Secondary Text

---

neutral-700

Primary Text

---

neutral-800

Heading

---

neutral-900

Title

---

neutral-950

Dark Surface

---

# Background Tokens

bg-page

Default Background

---

bg-section

Alternate Section

---

bg-card

Card

---

bg-sidebar

Dashboard Sidebar

---

bg-navbar

Navbar

---

bg-footer

Footer

---

bg-modal

Modal

---

bg-overlay

Overlay

---

# Surface Tokens

surface-primary

White

---

surface-secondary

Gray

---

surface-brand

Blue

---

surface-success

Green

---

surface-warning

Orange

---

surface-danger

Red

---

# Text Tokens

text-primary

Heading

---

text-secondary

Paragraph

---

text-muted

Description

---

text-disabled

Disabled

---

text-white

Dark Background

---

text-link

Hyperlink

---

text-error

Danger

---

text-success

Success

---

# Border Tokens

border-default

Default Border

---

border-light

Card

---

border-strong

Input Focus

---

border-brand

Primary

---

border-danger

Validation

---

border-success

Success

---

# Button Tokens

Primary

Blue Background

White Text

---

Secondary

White Background

Blue Border

---

Outline

Transparent

Border

---

Ghost

Transparent

No Border

---

Danger

Red

---

Success

Green

---

Link

Text Only

---

Disabled

Gray

---

# Status Tokens

Booking Pending

Warning

---

Booking Confirmed

Info

---

Partner Assigned

Primary

---

Working

Primary Dark

---

Completed

Success

---

Cancelled

Danger

---

Expired

Neutral

---

# Dashboard Colors

Revenue

Green

---

Booking

Blue

---

Partner

Cyan

---

Customer

Purple

---

Complaint

Red

---

Pending

Orange

---

# Chart Palette

Primary

Secondary

Success

Warning

Danger

Purple

Teal

Amber

Slate

Chart tidak boleh menggunakan lebih dari 8 warna utama.

---

# Gradient

Hero Gradient

Primary

↓

Secondary

---

CTA Gradient

Primary

↓

Accent

---

Statistic Gradient

Primary

↓

Sky

---

# Shadow Color

Menggunakan Black dengan opacity rendah.

Tidak menggunakan Shadow berwarna.

---

# Dark Mode

Reserved.

Belum diimplementasikan.

Semua token harus mendukung Dark Mode di masa depan.

---

# Accessibility

Semua kombinasi warna wajib memenuhi:

WCAG AA

Minimum Contrast Ratio

4.5 : 1

---

# Tailwind Mapping

Seluruh token harus didefinisikan pada:

tailwind.config.ts

Tidak boleh menggunakan hex color secara langsung pada Component.

---

# CSS Variable

Semua token juga harus tersedia sebagai CSS Variable.

Contoh

--color-primary

--color-success

--color-danger

--color-text-primary

--color-background

---

# Rules

❌ Jangan gunakan warna langsung.

Contoh

style="color:#2563eb"

---

❌ Jangan menggunakan warna random.

---

✅ Gunakan Design Token.

Contoh

text-primary

bg-primary

border-primary

---

# Future

Dark Mode

White Label Theme

Corporate Theme

Seasonal Theme

Accessibility Theme
