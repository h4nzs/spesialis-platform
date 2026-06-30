# Database Documentation

# Table: notifications

Version: 1.0

---

# Purpose

Menyimpan seluruh Notification.

---

# Columns

id

user_id

type

channel

title

message

is_read

sent_at

created_at

---

# Channel

Email

WhatsApp

Push

In App

---

# Relationships

users

↓

notifications

1:N

---

# Business Rules

Notification tidak boleh dihapus.

User dapat menandai Read.
