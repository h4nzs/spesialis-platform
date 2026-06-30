# Functional Specification

# Module: Partner Management

**Module ID:** FS-PARTNER-001

**Version:** 1.0

**Priority:** ⭐⭐⭐⭐⭐

---

# 1. Purpose

Partner Management mengelola seluruh Mitra yang bekerja sama dengan platform.

---

# 2. Objectives

- Registrasi Partner.
- Verifikasi.
- Assignment.
- Earnings.
- Rating.
- Availability.
- Coverage Area.

---

# 3. Partner Lifecycle

```text
Register

↓

Upload Documents

↓

Waiting Verification

↓

Approved

↓

Available

↓

Assigned

↓

Working

↓

Completed
```

---

# 4. Partner Profile

Field.

- Full Name
- Phone
- Email
- Avatar
- KTP
- Profile Photo
- Bio
- Experience
- Skills

---

# 5. Skills

Partner dapat memiliki banyak Skill.

Contoh.

- AC
- Plumbing
- Cleaning
- Electrical

---

# 6. Coverage Area

Partner dapat memilih Area Kerja.

Contoh.

- Jakarta Selatan
- Bandung Barat
- Bekasi

---

# 7. Availability

Status.

Available

Busy

Vacation

Offline

---

# 8. Assignment

Partner menerima:

- Job Detail
- Customer
- Address
- Schedule

Partner dapat.

Accept

Reject

---

# 9. Earnings

Partner dapat melihat.

- Total Income
- Pending Income
- Completed Jobs

---

# 10. Ratings

Partner dapat melihat.

- Average Rating
- Review List

---

# 11. Documents

Admin dapat memverifikasi.

- KTP
- Sertifikat
- SIM (Opsional)

---

# 12. Penalty

Admin dapat memberikan Penalty.

Contoh.

- Late
- No Show
- Fake Report

---

# 13. API

```http
GET /api/v1/partners

PATCH /api/v1/partners/:id

POST /api/v1/partners/:id/availability

POST /api/v1/partners/:id/jobs/:assignment_id/accept

POST /api/v1/partners/:id/jobs/:assignment_id/reject
```

---

# 14. Database Dependencies

partner_profiles

partner_skills

assignments

earnings

reviews

documents

---

# 15. Acceptance Criteria

- Partner dapat Register.
- Admin dapat Verifikasi.
- Partner dapat menerima Assignment.
- Partner dapat melihat Earnings.
- Partner dapat mengubah Availability.
