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

users.id (nullable)

---

# Columns

id UUID

user_id UUID (nullable — null untuk Guest booking)

full_name VARCHAR(255)

avatar TEXT

birth_date DATE

gender VARCHAR(20)

default_address_id UUID

guest_phone VARCHAR(30) (nullable — untuk Guest booking tanpa akun)

created_at TIMESTAMP

updated_at TIMESTAMP

deleted_at TIMESTAMP

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

Guest Booking membuat Customer Profile langsung saat booking (user_id = null).

Guest Phone digunakan untuk tracking Guest Booking.

Saat Guest register, user_id diisi dan guest_phone dikosongkan.

Customer Profile tanpa user_id dianggap Guest.

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
