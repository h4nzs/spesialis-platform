# Functional Specification

# Module: Admin Dashboard

**Module ID:** FS-ADMIN-001

**Version:** 1.0

**Priority:** ⭐⭐⭐⭐⭐ (Critical)

---

# 1. Purpose

Admin Dashboard merupakan pusat kontrol seluruh platform.

---

# 2. Widgets

Dashboard menampilkan.

- Total Booking Hari Ini
- Active Orders
- Waiting Assignment
- Partner Available
- Revenue
- Corporate Inquiry
- Complaint
- Pending Verification

---

# 3. Quick Actions

- Create Booking
- Assign Partner
- Add Service
- Publish Article
- Verify Partner
- Verify Corporate

---

# 4. Charts

- Booking Trend
- Revenue Trend
- Top Services
- Top Areas
- Top Partners

---

# 5. Recent Activity

- Booking Baru
- Partner Reject
- Payment
- Complaint

---

# 6. Notification Center

Admin menerima.

- Booking Baru
- Inquiry Baru
- Complaint
- Assignment Reject
- Partner Registration

---

# 7. Permission

Dashboard mengikuti Role.

Dispatcher melihat Widget Assignment.

Finance melihat Revenue.

Content Manager melihat CMS.

Super Admin melihat seluruh Widget.

---

# 8. Acceptance Criteria

Dashboard memuat data kurang dari 3 detik.

Widget dapat diperbarui tanpa Refresh penuh.

Semua statistik berasal dari data real-time atau cache yang tervalidasi.
