# Frontend Specification

# Responsive Design

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Dokumen ini mendefinisikan standar Responsive Design untuk seluruh halaman Specialist Platform.

Target utama:

- Mobile First
- SEO Friendly
- Fast Loading
- Consistent Experience
- Touch Friendly

Seluruh halaman wajib mengikuti dokumen ini.

---

# Design Philosophy

Platform dirancang dengan pendekatan:

Mobile First.

Kemudian berkembang ke:

Tablet

↓

Laptop

↓

Desktop

↓

Wide Screen

Tidak diperbolehkan mendesain Desktop terlebih dahulu.

---

# Supported Screen Width

Small Mobile

320px

---

Standard Mobile

360px

---

Large Mobile

390px

---

Plus Mobile

414px

---

Tablet Portrait

768px

---

Tablet Landscape

834px

---

Laptop

1024px

---

Desktop

1280px

---

Wide

1536px

---

Ultra Wide

1920px

---

# Breakpoints

| Breakpoint | Width  |
| ---------- | ------ |
| xs         | 320px  |
| sm         | 640px  |
| md         | 768px  |
| lg         | 1024px |
| xl         | 1280px |
| 2xl        | 1536px |

---

# Container Width

Mobile

100%

Padding

16px

---

Tablet

100%

Padding

24px

---

Laptop

1024px

Centered

---

Desktop

1280px

Centered

---

Wide

1440px

Centered

---

# Navigation

Desktop

Navbar Horizontal

---

Tablet

Navbar Horizontal

---

Mobile

Logo

↓

Hamburger Menu

↓

Drawer Navigation

---

CTA Booking

Tetap terlihat.

---

Sticky Navbar

Ya.

---

# Homepage Layout

Desktop

Hero

2 Column

---

Tablet

2 Column

Ukuran lebih kecil.

---

Mobile

1 Column

Hero Image berada di bawah teks.

---

# Hero Section

Desktop

Text

↓

Image

---

Mobile

Text

↓

CTA

↓

Statistic

↓

Image

---

CTA selalu berada di atas Fold.

---

# Service Grid

Desktop

4 Kolom

---

Laptop

3 Kolom

---

Tablet

2 Kolom

---

Mobile

1 Kolom

---

# Why Choose Us

Desktop

4 Card

---

Tablet

2 Card

---

Mobile

1 Card

---

# Statistic Section

Desktop

4 Statistik

---

Tablet

2x2

---

Mobile

2x2

---

# Testimonial

Desktop

3 Card

---

Tablet

2 Card

---

Mobile

1 Card

Swipe diperbolehkan.

---

# FAQ

Desktop

2 Column

---

Mobile

1 Column

---

# Footer

Desktop

4 Column

---

Tablet

2 Column

---

Mobile

1 Column

---

# Booking Form

Desktop

2 Column

---

Tablet

1 Column

---

Mobile

1 Column

---

Step Indicator

Selalu berada di atas.

---

Button

Full Width

Pada Mobile.

---

# Dashboard

Desktop

Sidebar

-

Content

---

Laptop

Sidebar Collapse

---

Tablet

Drawer Sidebar

---

Mobile

Bottom Navigation

atau

Drawer

---

# Dashboard Widget

Desktop

4 Widget

---

Tablet

2 Widget

---

Mobile

1 Widget

---

# Table

Desktop

Table

---

Tablet

Responsive Table

---

Mobile

Horizontal Scroll

atau

Card Layout

Jika data sedikit.

---

# Card

Desktop

Fixed Width

---

Mobile

100%

---

Padding

Menyesuaikan token spacing.

---

# Modal

Desktop

Centered

---

Mobile

Bottom Sheet

---

Maximum Width

640px

---

# Drawer

Desktop

Side Drawer

---

Mobile

Bottom Sheet

---

# Form

Desktop

2 Column

Apabila memungkinkan.

---

Mobile

Selalu

1 Column.

---

Input

Minimum Height

48px

---

Upload

Full Width.

---

# Images

Desktop

Original Ratio

---

Mobile

Responsive

---

Gunakan

object-cover

atau

object-contain

sesuai kebutuhan.

---

# Typography

Desktop

Menggunakan Typography Scale.

---

Mobile

Heading otomatis turun 1 level.

Contoh

H1

↓

H2 Size

---

Body

Tetap

16px

---

# Buttons

Desktop

Auto Width

---

Mobile

Primary CTA

Full Width

---

Secondary Button

Boleh Auto Width.

---

# Search

Desktop

Inline

---

Mobile

Full Width

---

Filter

Desktop

Sidebar

---

Mobile

Bottom Sheet

---

# Empty State

Desktop

Centered

---

Mobile

Centered

Tetap memenuhi layar.

---

# Loading

Skeleton mengikuti ukuran layar.

---

Spinner tetap berada di tengah.

---

# Images Optimization

Gunakan:

Responsive Image

---

Lazy Loading

Default.

---

Gunakan format:

WebP

AVIF

---

Fallback

JPEG

PNG

---

# Responsive Utilities

Gunakan Utility Tailwind.

Contoh

hidden

block

flex

grid

md:

lg:

xl:

2xl:

---

Tidak diperbolehkan menggunakan media query manual kecuali benar-benar diperlukan.

---

# Orientation

Landscape

Harus tetap usable.

---

Portrait

Default.

---

# Touch Target

Button

Minimal

44px

---

Input

48px

---

Spacing antar Action

Minimal

8px

---

# Accessibility

Zoom

200%

Tetap usable.

---

Tidak ada horizontal scroll.

Kecuali:

Data Table.

---

# Performance

Prioritas:

Content

↓

Image

↓

Animation

↓

Decoration

---

Hydration hanya pada komponen yang membutuhkan interaksi.

---

# Testing Checklist

Semua halaman wajib diuji pada:

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

Browser

Chrome

Firefox

Safari

Edge

---

Device

Android

iPhone

iPad

Laptop

Desktop

---

# Future

Foldable Device

Desktop App

PWA

Native Mobile App

TV Dashboard

---

# Source of Truth

Seluruh implementasi Responsive Layout wajib mengikuti dokumen ini.

Tidak diperbolehkan membuat breakpoint baru tanpa persetujuan Tech Lead.
