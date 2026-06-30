# Database Documentation

# Table: customer_profiles

Version: 1.0

---

# Purpose

Menyimpan data Customer.

Dipisahkan dari users agar Authentication dan Profile tidak bercampur.

---

# Primary Key

id UUID

---

# Foreign Key

user_id

↓

users.id

---

# Columns

id

user_id

full_name

avatar

birth_date

gender

default_address_id

created_at

updated_at

deleted_at

---

# Relationships

customer_profiles

↓

addresses

1 : N

---

customer_profiles

↓

orders

1 : N

---

customer_profiles

↓

reviews

1 : N

---

customer_profiles

↓

complaints

1 : N

---

# Business Rules

Satu User hanya memiliki satu Customer Profile.

Guest Booking akan dibuatkan Customer Profile setelah registrasi.

---

# Index

user_id

full_name

---

# Example

John Doe

↓

3 Address

↓

25 Orders

↓

12 Reviews

↓

2 Complaint
