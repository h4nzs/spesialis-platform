# Manual Test Checklist — Specialist Platform

**Project:** Specialist Platform  
**Tanggal:** {{tanggal}}  
**Tester:** {{nama}}  
**Lingkungan:** {{dev/staging/production}}

---

## 1. Autentikasi & Akses

### 1.1 Registrasi

- [ ] **Guest → Customer convert** — Booking tanpa akun → registrasi jadi customer → histori tetap ada
- [ ] **Register customer** — Email, password, nama, no HP → sukses
- [ ] **Register customer** — Email duplikat → 409
- [ ] **Register partner** — Isi form registrasi mitra → sukses, status `Waiting Verification`
- [ ] **Register partner** — Email duplikat → 409
- [ ] **Forgot password** — Kirim email reset → email terkirim (cek Mailpit)
- [ ] **Reset password** — Token valid → password berubah → bisa login
- [ ] **Reset password** — Token expired/invalid → error

### 1.2 Login/Logout

- [ ] **Login customer** — Email + password benar → masuk dashboard customer
- [ ] **Login partner** — Email + password benar → masuk dashboard partner
- [ ] **Login admin** — Email + password benar → masuk dashboard admin
- [ ] **Login** — Password salah → 401
- [ ] **Login** — User suspended → 403
- [ ] **Logout** — Clear cookie → redirect ke home, dashboard tidak bisa diakses

### 1.3 Role-based Access

- [ ] **/dashboard/admin** — Hanya admin/super_admin/finance/dispatcher/content_manager
- [ ] **/dashboard/partner** — Hanya partner
- [ ] **/dashboard/customer** — Hanya customer
- [ ] **/dashboard/corporate** — Hanya corporate
- [ ] **User tanpa role** — Redirect ke /401
- [ ] **Salah role** — Redirect ke /403

---

## 2. Booking Flow — Customer

### 2.1 Guest Booking

- [ ] **Guest booking** — Isi nama, no HP, alamat, pilih layanan → sukses (booking number muncul)
- [ ] **Guest booking** — Field wajib kosong → error validasi
- [ ] **Guest tracking** — Masukkan booking number di halaman tracking → detail booking tampil
- [ ] **Guest tracking** — Booking number salah → "tidak ditemukan"

### 2.2 Customer Booking (Logged In)

- [ ] **Customer booking** — Pilih layanan, pilih alamat simpanan, pilih tanggal/jam → sukses
- [ ] **Customer booking** — Pilih alamat baru saat booking → tersimpan
- [ ] **Booking history** — Halaman histori menampilkan semua booking milik customer
- [ ] **Detail booking** — Lihat detail status, partner, harga
- [ ] **Cancel booking** — Sebelum dikonfirmasi → sukses
- [ ] **Cancel booking** — Setelah pekerjaan mulai → error (tidak bisa)

### 2.3 Customer Address Management

- [ ] **Tambah alamat** — Simpan alamat baru
- [ ] **Edit alamat** — Update alamat
- [ ] **Hapus alamat** — Soft delete
- [ ] **Set default** — Tandai alamat sebagai default
- [ ] **Multiple address** — 2+ alamat tersimpan

### 2.4 Customer Reviews

- [ ] **Buat review** — Setelah order completed → rating + komentar
- [ ] **Duplicate review** — Review 2x untuk order sama → error
- [ ] **Review sebelum completed** — Tombol review tidak muncul

### 2.5 Customer Complaints

- [ ] **Buat complaint** — Setelah order completed → judul + deskripsi
- [ ] **Lihat complaint** — Status complaint (Open → Investigating → Resolved → Closed)
- [ ] **Order belum completed** — Tidak bisa buat complaint

---

## 3. Booking Flow — Admin

### 3.1 Booking Management

- [ ] **List booking** — Semua booking terdaftar di dashboard admin
- [ ] **Filter status** — Filter by status (Pending, Confirmed, Working, dll)
- [ ] **Detail booking** — Lihat informasi lengkap + history status

### 3.2 Admin Actions on Booking

- [ ] **Confirm booking** — Pending Confirmation → Confirmed
- [ ] **Assign partner** — Pilih partner dari daftar available
- [ ] **Assign partner** — Partner yang sedang Busy/Vacation tidak muncul
- [ ] **Update price** — Ubah final price → tercatat di audit log
- [ ] **Cancel booking** — Admin cancel kapan saja → sukses
- [ ] **Set on-the-way** — Status → On The Way (manual)

---

## 4. Booking Flow — Partner

### 4.1 Partner Dashboard

- [ ] **Lihat assignment baru** — Booking yang ditugaskan muncul
- [ ] **Accept assignment** — Terima pekerjaan → status Partner Accepted
- [ ] **Reject assignment** — Tolak dengan alasan → status Waiting Assignment, admin dapat notifikasi
- [ ] **Start job** — Setelah On The Way → klik Mulai → status Working
- [ ] **Complete job** — Setelah Working → klik Selesai → status Completed

### 4.2 Availability

- [ ] **Ubah availability** — Available / Busy / Vacation / Offline
- [ ] **Availability effect** — Saat Busy → tidak muncul di daftar assign

---

## 5. Payment Flow

### 5.1 Customer Payment

- [ ] **Upload payment proof** — Setelah order completed → upload bukti transfer
- [ ] **Payment method** — Pilih metode (Transfer Bank, dll)
- [ ] **Amount** — Otomatis sesuai final price
- [ ] **Duplicate payment** — Upload 2x untuk order sama → error

### 5.2 Admin Payment Verification

- [ ] **Lihat payment pending** — Daftar payment Waiting muncul
- [ ] **Verify payment** — Setuju → status Paid, order → Closed
- [ ] **Reject payment** — Tolak dengan catatan → status Failed, customer dapat notifikasi

---

## 6. Notification System

- [ ] **Customer notif** — Booking dibuat, dikonfirmasi, partner on-the-way, pekerjaan dimulai, selesai, dibatalkan, pembayaran diterima
- [ ] **Partner notif** — Assignment baru, verifikasi akun
- [ ] **Admin notif** — Booking baru, partner reject, partner mulai kerja, partner selesai, booking dibatalkan, complaint baru, payment baru, partner daftar
- [ ] **Unread count** — Badge notifikasi tidak terbaca
- [ ] **Mark as read** — Klik notifikasi → mark read
- [ ] **Mark all read** — Tandai semua sudah dibaca

---

## 7. Partner Management — Admin

### 7.1 Partner Verification

- [ ] **List partner** — Semua partner dengan status verifikasi
- [ ] **Filter** — By verification status, availability
- [ ] **Verify partner** — Approve → status Approved, partner dapat notifikasi + email
- [ ] **Reject partner** — Tolak dengan alasan → status Rejected

### 7.2 Partner Document

- [ ] **Upload dokumen** — KTP, foto profil oleh partner (via API)
- [ ] **Lihat dokumen** — Admin bisa lihat dokumen partner

---

## 8. Corporate Flow

### 8.1 Public Inquiry

- [ ] **Submit inquiry** — Isi form inquiry perusahaan → sukses, admin dapat notifikasi
- [ ] **Submit inquiry** — Field wajib kosong → error

### 8.2 Admin Inquiry Management

- [ ] **List inquiries** — Semua inquiry masuk
- [ ] **Filter by status** — Pending / Contacted / Negotiation / Converted / Closed
- [ ] **Update status** — Ubah sepanjang flow
- [ ] **Convert to company** — Setelah Converted, daftarkan sebagai akun corporate

### 8.3 Company Management

- [ ] **Verify company** — Admin setujui perusahaan
- [ ] **Add branch** — Tambah cabang perusahaan
- [ ] **Contract management** — Buat kontrak dengan diskon nominal/persentase

---

## 9. Content Management — Admin/Content Manager

### 9.1 Articles

- [ ] **CRUD article** — Buat, baca, edit, hapus artikel
- [ ] **Article status** — Draft / Published
- [ ] **Article categories** — CRUD kategori
- [ ] **Public view** — Artikel published tampil di halaman publik

### 9.2 FAQ

- [ ] **CRUD FAQ** — Buat, baca, edit, hapus FAQ
- [ ] **Category filter** — Booking, Akun, Pembayaran, Mitra, Layanan, Umum
- [ ] **Display order** — Urutan tampilan
- [ ] **Active/inactive** — FAQ non-active tidak tampil di publik
- [ ] **Public view** — FAQ tampil di halaman publik

---

## 10. Service Management — Admin

### 10.1 Service Categories

- [ ] **CRUD category** — Buat, edit, hapus kategori layanan

### 10.2 Services

- [ ] **CRUD service** — Buat, baca, edit, hapus layanan
- [ ] **Category assignment** — Setiap service memiliki kategori
- [ ] **Soft delete** — Hapus tidak hilang dari histori

---

## 11. User Management — Admin

### 11.1 User List

- [ ] **List users** — Semua user dengan filter role, status, search email
- [ ] **Pagination** — Halaman berfungsi

### 11.2 User Status

- [ ] **Suspend user** — Ubah status → suspended
- [ ] **Suspend effect** — User suspended tidak bisa login
- [ ] **Activate user** — Kembalikan ke active
- [ ] **Ban user** — Status banned

---

## 12. System Settings — Admin

- [ ] **View settings** — Lihat konfigurasi sistem
- [ ] **Update settings** — Ubah pengaturan
- [ ] **Validation** — Format/value invalid → error

---

## 13. Audit Log — Admin

- [ ] **Audit log page** — `/dashboard/admin/audit-logs` menampilkan semua aktivitas
- [ ] **Filter by action** — Filter kolom aksi
- [ ] **Filter by entity** — Filter kolom entitas
- [ ] **Filter by date range** — Filter tanggal dari/sampai
- [ ] **Pagination** — Halaman berfungsi
- [ ] **Expand detail** — Klik "Detail" → tampilkan nilai lama/baru, IP, User Agent

---

## 14. Reports — Admin

- [ ] **Reports page** — `/dashboard/admin/reports` menampilkan laporan
- [ ] **Revenue tab** — Grafik pendapatan per bulan (12 bulan), bar chart
- [ ] **Orders tab** — Breakdown status pesanan + daily trend chart
- [ ] **Services tab** — Top 10 layanan terpopuler
- [ ] **Summary cards** — Total pesanan, partner, rating, pekerjaan selesai

---

## 15. SEO Management

- [ ] **SEO CRUD** — Kelola meta title, description, OG, canonical per halaman
- [ ] **JSON-LD** — BreadcrumbList, WebPage structured data di halaman publik
- [ ] **CMS Revalidation** — Update konten CMS → revalidate halaman Astro

---

## 16. WhatsApp Notification

- [ ] **WhatsApp channel** — Notifikasi dengan channel 'WhatsApp' diproses
- [ ] **Email fallback** — Notifikasi dengan channel 'Email' mengirim email
- [ ] **No API key** — Sistem berjalan normal jika `WHATSAPP_API_KEY` kosong

---

## 17. Dashboard & Statistics

- [ ] **Admin dashboard** — Total users, bookings, revenue, aktivitas terbaru
- [ ] **Activity log** — Riwayat aktivitas dari audit log
- [ ] **Partner dashboard** — Ringkasan job, rating, pendapatan

---

## 18. Error Pages

- [ ] **401 page** — Halaman "Tidak Terautentikasi" — `/401`
- [ ] **403 page** — Halaman "Akses Ditolak" — `/403`
- [ ] **404 page** — Halaman tidak ditemukan
- [ ] **Maintenance page** — Halaman pemeliharaan — `/maintenance`

---

## 19. E2E Skenario Lengkap

- [ ] **Flow #1 (Guest → Complete):** Guest booking → Admin confirm → Admin assign partner → Partner accept → Admin set on-the-way → Partner start → Partner complete → Customer upload payment → Admin verify → Closed
- [ ] **Flow #2 (Customer → Complaint):** Customer booking → Admin confirm → Admin assign partner → Partner reject → Admin reassign → Partner accept → Complete → Customer review → Customer complaint → Admin resolve complaint
- [ ] **Flow #3 (Cancel):** Customer booking → Admin confirm → Customer cancel (sebelum kerja mulai)
- [ ] **Flow #4 (Availability):** Partner submit availability Offline → Admin cannot assign
- [ ] **Flow #5 (Corporate):** Corporate inquiry → Admin contact → Negotiation → Convert → Create account → Login → Book → Contract discount applied

---

## Ringkasan Coverage

| Area                   | Test Case | Status |
| ---------------------- | --------- | ------ |
| 1. Autentikasi & Akses | 15        | ⬜     |
| 2. Booking — Customer  | 17        | ⬜     |
| 3. Booking — Admin     | 9         | ⬜     |
| 4. Booking — Partner   | 7         | ⬜     |
| 5. Payment             | 7         | ⬜     |
| 6. Notification        | 6         | ⬜     |
| 7. Partner Management  | 6         | ⬜     |
| 8. Corporate           | 10        | ⬜     |
| 9. Content Management  | 9         | ⬜     |
| 10. Service Management | 6         | ⬜     |
| 11. User Management    | 5         | ⬜     |
| 12. System Settings    | 3         | ⬜     |
| 13. Audit Log          | 5         | ⬜     |
| 14. Reports            | 5         | ⬜     |
| 15. SEO Management     | 3         | ⬜     |
| 16. WhatsApp           | 3         | ⬜     |
| 17. Dashboard          | 3         | ⬜     |
| 18. Error Pages        | 4         | ⬜     |
| 19. E2E Skenario       | 5         | ⬜     |
| **Total**              | **~128**  | ⬜     |

---

## Catatan

- Gunakan **Mailpit** (`http://localhost:8025`) untuk verifikasi email.
- Gunakan **dashboard admin** (`/dashboard/admin`) untuk workflow backend.
- Semua notifikasi real-time menggunakan polling (`GET /notifications/unread-count`).

---

_Checklist ini dibuat berdasarkan implementasi terkini. Update jika ada perubahan flow._
