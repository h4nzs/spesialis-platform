# Frontend Specification

# Typography

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Typography menjadi salah satu identitas visual utama Specialist Platform.

Sistem tipografi harus memberikan kesan:

- Profesional
- Modern
- Bersih
- Mudah Dibaca
- Konsisten

Seluruh halaman wajib menggunakan skala typography yang sama.

---

# Design Principles

Typography harus:

- Mudah dibaca
- Memiliki hierarchy yang jelas
- Responsive
- Accessible
- Konsisten
- SEO Friendly

---

# Primary Font

Inter

---

# Fallback Font

system-ui

Segoe UI

Roboto

Helvetica Neue

Arial

sans-serif

---

# Monospace Font

JetBrains Mono

Fallback

ui-monospace

monospace

---

# Font Weight

Light

300

---

Regular

400

---

Medium

500

---

Semi Bold

600

---

Bold

700

---

Extra Bold

800

---

# Font Style

Normal

Italic

Digunakan hanya pada:

- Quote
- Highlight
- Catatan

---

# Typography Scale

Display XL

60px

Weight

700

Line Height

120%

Digunakan:

Hero Landing Page

---

Display

48px

Weight

700

Line Height

120%

Digunakan:

Landing Section

---

H1

40px

Weight

700

Line Height

125%

Digunakan:

Page Title

---

H2

32px

Weight

700

Line Height

130%

Digunakan:

Section

---

H3

28px

Weight

600

Line Height

135%

Digunakan:

Sub Section

---

H4

24px

Weight

600

Line Height

140%

Digunakan:

Card Title

---

H5

20px

Weight

600

Line Height

145%

Digunakan:

Dashboard Widget

---

H6

18px

Weight

600

Line Height

150%

Digunakan:

List Title

---

Body Large

18px

Weight

400

Line Height

170%

---

Body

16px

Weight

400

Line Height

170%

Digunakan:

Mayoritas Paragraph

---

Body Small

14px

Weight

400

Line Height

165%

Digunakan:

Description

---

Caption

12px

Weight

500

Line Height

160%

Digunakan:

Metadata

Timestamp

Badge

Helper Text

---

Overline

11px

Uppercase

Letter Spacing

8%

Digunakan:

Category

Label

Section Tag

---

# Letter Spacing

Display

-2%

---

Heading

-1%

---

Body

0%

---

Caption

1%

---

Overline

8%

---

# Paragraph Rules

Ideal Width

60–80 karakter

---

Maximum Width

720px

---

Paragraph Spacing

16px

---

Text Alignment

Default

Left

---

Center

Hanya:

Hero

CTA

Statistic

---

Justify

Tidak digunakan.

---

# Heading Rules

Satu halaman hanya boleh memiliki:

1 H1

---

H2

Digunakan untuk Section.

---

H3

Digunakan untuk Sub Section.

---

Jangan melompati hierarchy.

Contoh:

H1

↓

H2

↓

H3

↓

H4

---

# Text Color

Heading

text-primary

---

Paragraph

text-secondary

---

Description

text-muted

---

Disabled

text-disabled

---

Link

text-link

---

Success

text-success

---

Danger

text-danger

---

# Link Style

Underline

Saat Hover.

---

Visited Link

Tetap menggunakan warna Primary.

---

External Link

Memiliki Icon.

---

# Lists

Ordered List

Menggunakan angka.

---

Unordered List

Menggunakan Bullet.

---

Spacing

8px

---

# Quotes

Menggunakan Border Left.

Italic.

Background ringan.

---

# Code

Menggunakan:

JetBrains Mono

---

Background

Neutral

---

Radius

Medium

---

# Numbers

Gunakan:

Tabular Numbers

Untuk:

Harga

Invoice

Booking Number

Statistik

---

# Dashboard Typography

Widget Title

14px

Medium

---

Widget Value

32px

Bold

---

Widget Description

13px

Regular

---

# Card Typography

Card Title

20px

Semi Bold

---

Card Description

15px

Regular

---

Card Meta

13px

Medium

---

# Button Typography

Font Size

16px

---

Weight

600

---

Text Transform

None

---

Minimum Height

48px

---

# Form Typography

Input

16px

---

Label

14px

Medium

---

Helper Text

13px

---

Validation

13px

Medium

Danger Color

---

Placeholder

15px

Neutral

---

# Responsive Typography

Mobile

Display XL

48px

---

Desktop

60px

---

Body

Tetap 16px.

---

Caption

Tetap 12px.

---

# Accessibility

Minimum Body Size

16px

---

Contrast

WCAG AA

---

User Zoom

200%

Tetap terbaca.

---

Tidak menggunakan font di bawah 12px.

---

# SEO Rules

Heading wajib menggunakan semantic HTML.

h1

h2

h3

h4

h5

h6

---

Jangan menggunakan div sebagai Heading.

---

# Performance

Gunakan Variable Font.

---

Gunakan font-display:

swap

---

Preload Font.

---

Subset Latin.

---

# Tailwind Mapping

text-display-xl

text-display

text-h1

text-h2

text-h3

text-h4

text-h5

text-h6

text-body-lg

text-body

text-body-sm

text-caption

text-overline

---

# Component Rules

Button

↓

text-body

Semi Bold

---

Card Title

↓

text-h4

---

Hero

↓

text-display-xl

---

Dashboard Number

↓

text-display

---

Table Header

↓

text-body-sm

Medium

---

Table Cell

↓

text-body-sm

Regular

---

Badge

↓

text-caption

Medium

---

# Writing Guidelines

Gunakan Bahasa Indonesia yang formal namun mudah dipahami.

---

CTA menggunakan kata kerja.

Contoh:

Booking Sekarang

Hubungi Kami

Daftar Mitra

Ajukan Penawaran

---

Hindari kalimat terlalu panjang.

Maksimal:

20 kata per kalimat.

---

Gunakan Active Voice.

---

Prioritaskan kejelasan dibanding kreativitas.

---

# Future

Multi Language

Arabic RTL

Japanese

English

Chinese

Dynamic Font Loading
