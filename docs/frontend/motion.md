# Frontend Specification

# Motion

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Dokumen ini mendefinisikan seluruh aturan Motion Design pada Specialist Platform.

Motion digunakan untuk:

- Memberikan feedback
- Membantu pengguna memahami perubahan UI
- Meningkatkan perceived performance
- Membuat aplikasi terasa modern

Motion bukan digunakan untuk dekorasi.

---

# Design Principles

Motion harus:

- Cepat
- Halus
- Konsisten
- Bermakna
- Tidak mengganggu
- Mendukung produktivitas

---

# Philosophy

Less is More.

Animasi hanya digunakan apabila membantu User Experience.

Apabila animasi tidak memberikan nilai tambah.

Jangan digunakan.

---

# Animation Library

Primary

CSS Transition

---

Secondary

Motion (Framer Motion)

Digunakan hanya untuk:

- Modal
- Drawer
- Complex Animation
- Shared Layout Animation

---

Forbidden

GSAP

AnimeJS

Custom Animation Library

Kecuali ada kebutuhan khusus.

---

# Duration Tokens

Instant

75ms

---

Fast

150ms

---

Normal

200ms

(Default)

---

Medium

250ms

---

Slow

300ms

---

Extra Slow

500ms

Hanya digunakan pada:

Page Transition

---

# Easing

Default

ease-out

---

Enter

ease-out

---

Exit

ease-in

---

Bounce

Tidak digunakan.

---

Elastic

Tidak digunakan.

---

# Hover Animation

Button

Brightness

-

Scale

1.02

---

Card

TranslateY

-2px

-

Soft Shadow

---

Image

Scale

1.03

---

Link

Underline Fade

---

Navigation

Background Fade

---

Icon Button

Background Fade

---

# Focus Animation

Input

Border Color

↓

Primary

---

Button

Visible Focus Ring

---

Card

Outline

Primary

---

# Click Animation

Button

Scale

0.98

---

Card

Tidak berubah ukuran.

---

Switch

Slide

---

Checkbox

Scale

↓

Fade

---

# Loading Animation

Spinner

Rotate

Linear

Infinite

---

Skeleton

Shimmer

Left

↓

Right

---

Progress Bar

Linear

---

Booking Status

Pulse

Maximum

2 Cycle

---

# Modal Animation

Enter

Fade

↓

Scale

95%

↓

100%

Duration

200ms

---

Exit

Fade

↓

Scale

100%

↓

95%

Duration

150ms

---

Overlay

Fade

150ms

---

# Drawer Animation

Desktop

Fade

-

Slide

---

Mobile

Bottom Sheet

Slide Up

---

Duration

250ms

---

# Toast Animation

Enter

Slide Up

-

Fade

---

Exit

Fade

↓

Slide Down

---

Duration

200ms

---

# Dropdown Animation

Fade

↓

Scale

98%

↓

100%

Duration

150ms

---

# Tooltip Animation

Fade

-

TranslateY

4px

↓

0

Duration

150ms

---

# Accordion

Expand

Height Auto

---

Collapse

Height Auto

---

Duration

250ms

---

# Tabs

Indicator

Slide

---

Content

Fade

Duration

200ms

---

# Page Transition

Default

Fade

---

Dashboard

No Transition

Performance lebih penting.

---

Booking Flow

Cross Fade

---

Tidak menggunakan:

Flip

Rotate

Zoom

---

# Navigation

Desktop

Fade

---

Mobile Menu

Slide Left

---

Sidebar

Collapse Width

250ms

---

# Hero Animation

Headline

Fade Up

---

CTA

Fade Up

Delay

50ms

---

Illustration

Fade

---

Statistic

Counter Animation

Satu kali.

---

# Card Animation

Saat muncul.

Fade

↓

TranslateY

8px

↓

0

---

Hover

Lift

2px

---

Selected

Border

Primary

---

# Form Animation

Validation Error

Shake

Ringan

Maximum

1 kali.

---

Success

Border Fade

Green

---

Loading

Spinner

---

OTP Input

Focus otomatis.

---

# Table Animation

Loading

Skeleton

---

Sorting

Fade

---

Pagination

Cross Fade

---

Tidak menggunakan animasi per row.

---

# Dashboard Animation

Counter

Count Up

---

Chart

Animate On First Render

---

Realtime Update

Highlight Background

↓

Fade

---

# Notification Animation

Badge

Pulse

Maximum

2 kali.

---

Realtime Notification

Slide Right

↓

Fade

---

# Empty State

Illustration

Fade

---

Button

Fade Up

---

# Error State

Icon

Fade

---

Text

Fade

---

CTA

Fade

---

# Success State

Check Icon

Scale

0.9

↓

1

Duration

200ms

---

# Image

Lazy Load

Fade

---

Gallery

Cross Fade

---

Lightbox

Fade

-

Scale

---

# Scroll Animation

Intersection Observer

---

Fade Up

Digunakan hanya pada:

Homepage

Landing Page

Marketing Section

---

Tidak digunakan pada:

Dashboard

Table

CMS

---

# Accessibility

Mengikuti preferensi browser:

prefers-reduced-motion

Jika aktif.

↓

Semua animasi non-esensial dimatikan.

---

Loading tetap ditampilkan.

Namun tanpa animasi kompleks.

---

# Performance Rules

Gunakan:

transform

opacity

---

Hindari:

width

height

left

top

Sebagai properti animasi.

---

Gunakan GPU Acceleration.

---

Durasi total animasi

Maksimal

300ms

Kecuali Hero.

---

# Mobile Rules

Animasi lebih sedikit.

---

Tidak menggunakan Parallax.

---

Tidak menggunakan Scroll Hijacking.

---

Touch Feedback

Harus instan.

---

# Dashboard Rules

Prioritaskan kecepatan.

Animasi diminimalkan.

Realtime update tidak boleh mengganggu pengguna.

---

# Future

Shared Layout Animation

Dark Mode Transition

Realtime Dashboard Highlight

AI Notification Animation

White Label Motion Theme

---

# Source of Truth

Seluruh Motion Design harus mengikuti dokumen ini.

Tidak diperbolehkan membuat animasi baru tanpa alasan UX yang jelas.
