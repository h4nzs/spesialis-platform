# Database Documentation

# Table: assignments

Version: 1.0

---

# Purpose

Menyimpan histori seluruh Assignment Partner.

Satu Order dapat memiliki banyak Assignment.

Contoh.

Partner A Reject.

↓

Partner B Reject.

↓

Partner C Accept.

Semua histori tetap tersimpan.

---

# Columns

id

order_id

partner_id

status

assigned_at

accepted_at

rejected_at

started_at

completed_at

rejection_reason

notes

created_at

updated_at

---

# Status

Assigned

Accepted

Rejected

Completed

Cancelled

---

# Relationships

orders

↓

assignments

1:N

---

partner_profiles

↓

assignments

1:N

---

# Business Rules

Assignment tidak boleh dihapus.

Partner hanya memiliki satu Assignment aktif pada Order yang sama.

Reject wajib menyimpan alasan.

---

# Index

order_id

partner_id

status
