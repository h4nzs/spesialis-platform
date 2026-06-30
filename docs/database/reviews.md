# Database Documentation

# Table: reviews

Version: 1.0

---

# Purpose

Menyimpan penilaian Customer.

---

# Columns

id

order_id

customer_id

partner_id

rating

review

created_at

updated_at

---

# Rating

1

2

3

4

5

---

# Relationships

orders

↓

reviews

1:1

---

customer_profiles

↓

reviews

1:N

---

partner_profiles

↓

reviews

1:N

---

# Business Rules

Review hanya dapat dibuat apabila Order Completed.

Satu Order hanya memiliki satu Review.

Review tidak dapat diedit setelah Publish.

---

# Index

order_id

partner_id

rating
