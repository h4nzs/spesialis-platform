# Frontend Specification

# Accessibility

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Dokumen ini mendefinisikan standar Accessibility (A11Y) untuk seluruh Specialist Platform.

Tujuan utama:

- Mudah digunakan semua pengguna.
- Mendukung keyboard navigation.
- Mendukung screen reader.
- Memenuhi WCAG 2.2 AA.
- Mengurangi hambatan penggunaan pada perangkat apa pun.

Accessibility bukan fitur tambahan.

Accessibility adalah bagian dari Definition of Done.

---

# Accessibility Goals

Target minimum:

WCAG 2.2 AA

Semua halaman wajib memenuhi standar ini.

---

# Principles

Mengikuti empat prinsip WCAG.

Perceivable

Operable

Understandable

Robust

---

# Semantic HTML

Gunakan elemen HTML sesuai fungsinya.

Contoh

header

nav

main

section

article

aside

footer

button

form

label

table

ul

ol

li

figure

figcaption

---

Jangan menggunakan

div

untuk menggantikan elemen semantik.

---

# Heading Structure

Setiap halaman wajib memiliki:

1 H1

---

Heading tidak boleh melompat.

Benar

H1

↓

H2

↓

H3

↓

H4

---

Salah

H1

↓

H4

---

# Landmarks

Setiap halaman minimal memiliki:

Header

Navigation

Main

Footer

---

Dashboard

Tambahkan

Aside

---

# Keyboard Navigation

Seluruh fitur harus dapat digunakan hanya dengan keyboard.

---

Shortcut

Tab

↓

Komponen berikutnya.

---

Shift + Tab

↓

Komponen sebelumnya.

---

Enter

↓

Submit

---

Space

↓

Toggle

---

Esc

↓

Tutup Modal

↓

Tutup Drawer

↓

Tutup Dropdown

---

Arrow Keys

↓

Tabs

↓

Radio Group

↓

Menu

---

# Focus Management

Semua elemen interaktif harus memiliki Focus Ring.

---

Modal

↓

Focus otomatis pada elemen pertama.

---

Modal ditutup

↓

Focus kembali ke tombol pembuka.

---

Drawer

↓

Focus Trap.

---

Dropdown

↓

Focus berpindah ke item pertama.

---

# Focus Indicator

Tidak boleh menghilangkan outline browser.

Gunakan custom focus ring.

Minimal:

2px

Primary Color

---

# Button Rules

Semua button:

Menggunakan

<button>

Bukan

<div>

---

Button wajib memiliki:

Accessible Name.

---

Icon Button

Harus memiliki:

aria-label

---

Disabled Button

Menggunakan:

disabled

Attribute.

---

# Link Rules

Gunakan

<a>

untuk navigasi.

---

Gunakan

<button>

untuk Action.

---

External Link

Memiliki indikator.

Membuka tab baru hanya bila diperlukan.

---

# Form Accessibility

Semua Input wajib memiliki:

Label

---

Placeholder

Bukan pengganti Label.

---

Helper Text

Opsional.

---

Validation Message

Harus terbaca Screen Reader.

---

Required Field

Ditandai.

---

Autocomplete

Gunakan atribut HTML yang sesuai.

Contoh

email

name

tel

street-address

postal-code

---

# Validation

Kesalahan harus dijelaskan.

Jangan hanya menggunakan warna merah.

Contoh

❌

Input merah.

---

✅

Input merah.

-

Icon.

-

Pesan error.

---

# Error Message

Bahasa sederhana.

Contoh

Email wajib diisi.

---

Password minimal 8 karakter.

---

Nomor telepon tidak valid.

---

# Color Accessibility

Informasi tidak boleh hanya bergantung pada warna.

Contoh

❌

Hijau = Benar.

Merah = Salah.

---

✅

Hijau + Icon + Teks.

Merah + Icon + Teks.

---

# Contrast Ratio

Body Text

Minimal

4.5 : 1

---

Large Text

Minimal

3 : 1

---

Icon

Mengikuti standar WCAG.

---

# Images

Decorative Image

aria-hidden

atau

alt=""

---

Content Image

Memiliki Alt Text.

---

Logo

Memiliki Alt.

---

Partner Photo

Alt menjelaskan isi gambar.

---

# Icons

Decorative

aria-hidden="true"

---

Interactive

aria-label

---

# Tables

Gunakan

thead

tbody

th

scope

caption

---

Responsive Table tetap dapat dibaca Screen Reader.

---

# Modal

Role

dialog

---

aria-modal

true

---

Title

aria-labelledby

---

Description

aria-describedby

---

Focus Trap

Ya.

---

Esc

Menutup Modal.

---

# Toast

Gunakan

aria-live

polite

---

Error

Gunakan

assertive

Hanya bila penting.

---

# Loading

Spinner harus memiliki:

Loading...

untuk Screen Reader.

---

Skeleton

Tidak boleh menjadi satu-satunya indikator loading.

---

# Notification

Realtime Notification

Menggunakan

aria-live

polite.

---

# Dashboard

Chart wajib memiliki:

Summary Text.

---

Table wajib dapat dinavigasi keyboard.

---

# Drag and Drop

Selalu memiliki alternatif.

Contoh

Upload Button.

---

# File Upload

Mendukung:

Keyboard

Mouse

Touch

---

# Responsive Accessibility

Touch Target

Minimal

44x44px

---

Spacing antar tombol

Minimal

8px

---

Input

Minimal

48px

---

# Motion Accessibility

Mengikuti

prefers-reduced-motion

---

Apabila aktif.

↓

Nonaktifkan animasi non-esensial.

---

# Screen Reader

Diuji minimal dengan:

NVDA

Windows

---

VoiceOver

macOS

iOS

---

TalkBack

Android

---

# Browser Zoom

200%

Tetap usable.

---

Tidak boleh ada konten yang terpotong.

---

# Language

Gunakan

lang="id"

Pada halaman Bahasa Indonesia.

---

Jika nanti Multi Language.

Gunakan lang sesuai bahasa.

---

# Accessible Components

Semua komponen @specialist/ui wajib memiliki:

Keyboard Support

Screen Reader Support

Visible Focus

Semantic HTML

ARIA bila diperlukan

---

# Testing Checklist

Semua halaman diuji menggunakan:

Lighthouse Accessibility

≥95

---

Keyboard Only

Lulus

---

Screen Reader

Lulus

---

Color Contrast

Lulus

---

Focus Visible

Lulus

---

Zoom 200%

Lulus

---

Touch Device

Lulus

---

# Future

Voice Navigation

High Contrast Mode

Accessibility Preferences

Font Size Preference

Reduced Motion Preference

Keyboard Shortcut Customization

---

# Source of Truth

Accessibility bukan tahap akhir.

Accessibility harus dipertimbangkan sejak proses desain, implementasi, code review, dan testing.

Seluruh fitur baru wajib memenuhi dokumen ini sebelum dianggap selesai.
