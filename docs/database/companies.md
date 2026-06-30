# Database Documentation

# Table: companies

Project: Specialist Platform

Version: 1.0

Status: Locked

---

# Purpose

Menyimpan data Corporate Customer.

---

# Columns

id

company_name

legal_name

tax_number

email

phone

website

industry

employee_count

logo_media_id

status

created_at

updated_at

deleted_at

---

# Status

Pending

Verified

Rejected

Suspended

---

# Relationships

companies

↓

company_users

1:N

---

companies

↓

branches

1:N

---

companies

↓

orders

1:N

---

companies

↓

contracts

1:N

---

companies

↓

invoices

1:N

---

# Business Rules

Satu Company dapat memiliki banyak User.

Satu Company dapat memiliki banyak Branch.

Verifikasi dilakukan Admin.

---

# Index

company_name

tax_number

status
