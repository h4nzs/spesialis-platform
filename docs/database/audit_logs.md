# Database Documentation

# Table: audit_logs

Version: 1.0

---

# Purpose

Mencatat seluruh aktivitas penting.

Audit Log bersifat Immutable.

---

# Columns

id

user_id

action

entity

entity_id

old_value

new_value

ip_address

user_agent

created_at

---

# Example Actions

CREATE_ORDER

UPDATE_PRICE

ASSIGN_PARTNER

LOGIN

LOGOUT

DELETE_SERVICE

VERIFY_PARTNER

VERIFY_COMPANY

---

# Business Rules

Audit Log tidak boleh diedit.

Audit Log tidak boleh dihapus.

Hanya Super Admin yang dapat melihat seluruh Audit Log.
