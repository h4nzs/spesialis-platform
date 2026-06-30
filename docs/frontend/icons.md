# Frontend Specification

# Icons

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Dokumen ini mendefinisikan standar penggunaan Icon pada seluruh platform.

Seluruh Icon harus konsisten agar mudah dikenali, mudah dipelajari, dan memberikan pengalaman pengguna yang profesional.

---

# Design Principles

Icon harus:

- Simple
- Minimal
- Modern
- Mudah dikenali
- Konsisten
- Tidak dekoratif berlebihan

Icon membantu pengguna memahami interface.

Icon bukan pengganti teks.

---

# Icon Library

Primary

Lucide React

---

Secondary

Tabler Icons

Hanya apabila icon tidak tersedia pada Lucide.

---

Forbidden

❌ Font Awesome

❌ Bootstrap Icons

❌ Heroicons bercampur

❌ Material Icons bercampur

Platform hanya menggunakan SATU icon system.

---

# Icon Style

Outline

Stroke Width

2px

Rounded Join

Rounded Cap

Tidak menggunakan icon Filled.

---

# Icon Size

XS

14px

---

SM

16px

---

MD

20px

(Default)

---

LG

24px

---

XL

32px

---

2XL

40px

---

Hero

48px

64px

---

# Icon Color

Default

text-muted

---

Primary

text-primary

---

Success

text-success

---

Danger

text-danger

---

Warning

text-warning

---

Info

text-info

---

Disabled

text-disabled

---

# Icon Spacing

Icon

↓

Text

8px

---

Icon

↓

Button Edge

12px

---

Icon

↓

Card Edge

16px

---

# Navigation Icons

Home

House

---

Services

Wrench

---

Booking

ClipboardList

---

Tracking

MapPinned

---

Partner

UserCog

---

Corporate

Building2

---

Dashboard

LayoutDashboard

---

Settings

Settings

---

Profile

CircleUserRound

---

Notification

Bell

---

Logout

LogOut

---

# Booking Icons

Calendar

CalendarDays

---

Clock

Clock3

---

Address

MapPinned

---

Location

MapPin

---

Price

BadgeDollarSign

---

Payment

Wallet

---

Status

CircleCheck

CircleAlert

LoaderCircle

---

Partner Assigned

UserCheck

---

Completed

BadgeCheck

---

Cancelled

CircleX

---

# Service Icons

AC Service

AirVent

---

Cleaning

Sparkles

---

Electrical

Zap

---

Plumbing

Droplets

---

Painting

Paintbrush

---

Pest Control

Bug

---

CCTV

Camera

---

Internet

Wifi

---

Moving

Truck

---

Home Service

House

---

Corporate Service

Building2

---

Outsourcing

Users

---

# Dashboard Icons

Revenue

WalletCards

---

Orders

ClipboardList

---

Partners

UserRoundCog

---

Customers

UsersRound

---

Statistics

ChartColumn

---

Growth

TrendingUp

---

Complaint

TriangleAlert

---

Invoice

ReceiptText

---

Review

Star

---

# Form Icons

Search

Search

---

Email

Mail

---

Password

LockKeyhole

---

Phone

Phone

---

Address

MapPinned

---

Upload

UploadCloud

---

Attachment

Paperclip

---

Camera

Camera

---

Calendar

Calendar

---

Time

Clock3

---

# Action Icons

Create

Plus

---

Edit

Pencil

---

Delete

Trash2

---

Save

Save

---

Download

Download

---

Upload

Upload

---

Refresh

RefreshCcw

---

Filter

Filter

---

Sort

ArrowUpDown

---

More

Ellipsis

---

Close

X

---

Back

ArrowLeft

---

Next

ArrowRight

---

Expand

ChevronDown

---

Collapse

ChevronUp

---

# Feedback Icons

Success

CircleCheckBig

---

Error

CircleX

---

Warning

TriangleAlert

---

Info

CircleHelp

---

Loading

LoaderCircle

Animated.

---

# Animation

Loading

Rotate

---

Notification

Bounce

Maximum

1 cycle

---

Success

Fade

Scale

---

Tidak menggunakan animasi berlebihan.

---

# Accessibility

Decorative Icon

aria-hidden="true"

---

Interactive Icon

Harus memiliki:

aria-label

---

Icon Button

Harus memiliki Tooltip.

---

# Icon Button

Minimal Size

44px

---

Shape

Circle

atau

Rounded

---

Hover

Background berubah.

---

Focus

Visible Focus Ring.

---

# Performance

Tree Shaking wajib aktif.

Import individual icon.

Contoh

import { Search } from "lucide-react"

---

Jangan

import * as Icons

---

# Custom Icons

Logo perusahaan.

Logo partner.

Logo pembayaran.

Disimpan sebagai SVG.

---

# Illustration

Tidak termasuk Icon.

Menggunakan file SVG terpisah.

---

# Future

Animated SVG

Lottie

Corporate Custom Icon Pack

White Label Icon Theme

---

# Source of Truth

Seluruh icon harus berasal dari:

Lucide React

Tidak diperbolehkan mencampur library icon lain tanpa persetujuan Tech Lead.
