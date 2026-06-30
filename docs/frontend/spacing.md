# Frontend Specification

# Spacing

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Dokumen ini mendefinisikan seluruh sistem spacing yang digunakan pada aplikasi.

Spacing yang konsisten membuat UI terasa lebih profesional, mudah dipelihara, dan mudah dikembangkan.

Seluruh margin, padding, gap, container, dan layout wajib menggunakan token dari dokumen ini.

Tidak diperbolehkan menggunakan nilai spacing random.

---

# Design Philosophy

Spacing harus memberikan kesan:

- Bersih
- Luas
- Modern
- Premium
- Mudah dibaca

Whitespace adalah bagian dari desain.

Lebih baik memiliki whitespace lebih banyak daripada tampilan yang padat.

---

# Base Unit

Base Unit

4px

Semua spacing merupakan kelipatan dari 4.

---

# Spacing Scale

| Token | Value |
| ----- | ----: |
| 0     |   0px |
| 1     |   4px |
| 2     |   8px |
| 3     |  12px |
| 4     |  16px |
| 5     |  20px |
| 6     |  24px |
| 8     |  32px |
| 10    |  40px |
| 12    |  48px |
| 14    |  56px |
| 16    |  64px |
| 20    |  80px |
| 24    |  96px |
| 32    | 128px |

---

# Border Radius

| Token | Value |
| ----- | ----: |
| xs    |   4px |
| sm    |   8px |
| md    |  12px |
| lg    |  16px |
| xl    |  20px |
| 2xl   |  24px |
| full  | 999px |

---

# Container Width

Mobile

100%

---

Tablet

768px

---

Laptop

1024px

---

Desktop

1280px

---

Wide

1440px

---

Maximum Container

1280px

---

Content Width

Artikel

720px

---

Dashboard

100%

---

Booking Form

720px

---

FAQ

900px

---

# Section Spacing

Hero

96px

---

Section

80px

---

Sub Section

48px

---

Footer

64px

---

Dashboard Section

32px

---

# Card Padding

Small Card

16px

---

Default Card

24px

---

Large Card

32px

---

Dashboard Card

24px

---

Modal

32px

---

Drawer

24px

---

# Form Spacing

Label

↓

Input

8px

---

Input

↓

Helper Text

8px

---

Field

↓

Field

24px

---

Section

↓

Section

40px

---

Button

↓

Button

12px

---

# Button Size

Small

Height

36px

Padding

12px 16px

---

Medium

Height

44px

Padding

16px 20px

---

Large

Height

48px

Padding

20px 24px

---

CTA

Height

56px

Padding

24px 32px

---

# Input Size

Small

40px

---

Medium

48px

---

Large

56px

---

Textarea

Minimum

120px

---

# Navbar

Desktop Height

72px

---

Mobile Height

64px

---

Navbar Padding

24px

---

# Sidebar

Desktop Width

280px

---

Collapsed

88px

---

Mobile

Drawer

---

# Hero Section

Top Padding

96px

---

Bottom Padding

96px

---

Gap

48px

---

CTA Gap

16px

---

# Grid Gap

Small

12px

---

Medium

24px

---

Large

32px

---

Extra Large

48px

---

# Card Grid

Desktop

4 Columns

Gap

24px

---

Tablet

2 Columns

Gap

20px

---

Mobile

1 Column

Gap

16px

---

# Dashboard Grid

Desktop

4 Widgets

Gap

24px

---

Tablet

2 Widgets

Gap

20px

---

Mobile

1 Widget

Gap

16px

---

# Table

Cell Padding

16px

---

Header Padding

20px

---

Row Height

56px

---

# List

Vertical Gap

12px

---

Horizontal Gap

16px

---

# Icon Spacing

Icon

↓

Text

8px

---

Icon

↓

Card Edge

16px

---

# Badge Padding

Horizontal

12px

---

Vertical

6px

---

# Modal

Content Padding

32px

---

Button Gap

16px

---

Header Gap

24px

---

# Empty State

Icon

↓

Title

24px

---

Title

↓

Description

16px

---

Description

↓

Button

32px

---

# Loading Skeleton

Card Height

220px

---

Avatar

48px

---

Text Line

16px

---

Gap

12px

---

# Dashboard Widget

Title

↓

Value

8px

---

Value

↓

Description

12px

---

# Mobile Rules

Minimum Horizontal Padding

16px

---

Preferred

20px

---

Maximum

24px

---

Section Gap

48px

---

Card Gap

16px

---

# Desktop Rules

Horizontal Padding

32px

---

Section Gap

80px

---

Card Gap

24px

---

# Responsive Rules

Tidak boleh menggunakan nilai spacing berbeda yang tidak berasal dari Design Token.

Contoh

❌

17px

29px

41px

53px

---

Gunakan

16

20

24

32

40

48

64

80

96

128

---

# Tailwind Mapping

Seluruh spacing wajib menggunakan utility Tailwind.

Contoh

p-4

px-6

py-8

gap-6

space-y-6

rounded-xl

max-w-7xl

container

---

# Accessibility

Touch Target

Minimal

44px

---

Jarak antar tombol

Minimal

8px

---

Input

Minimal

48px

---

# Future

Adaptive Spacing

Compact Mode

Comfortable Mode

Large Touch Mode

White Label Layout
