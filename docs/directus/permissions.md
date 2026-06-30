# docs/directus/permissions.md

# Permission Strategy

---

Permission menggunakan RBAC.

Rule.

Default Deny.

Semua Permission harus diberikan secara eksplisit.

---

Customer

READ

Own Orders

Own Profile

Own Address

---

Partner

READ

Own Assignment

Own Profile

---

Corporate

READ

Own Company

Own Invoice

Own Orders

---

Dispatcher

READ

Orders

Partner

Assignment

UPDATE

Assignment

Order Status

---

Finance

READ

Payment

UPDATE

Payment

Invoice

---

Content Manager

CRUD

Article

FAQ

Service

SEO

---

Admin

CRUD

Semua Collection.

---

Super Admin

ALL
