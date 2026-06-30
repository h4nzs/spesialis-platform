# API Specification

Project: Specialist Platform

Version: 1.0

---

# Base URL

/api/v1

---

# Response Format

Success

{
"success": true,
"data": {}
}

Error

{
"success": false,
"message": "",
"errors": []
}

---

# Authentication

Authorization:

Bearer <token>

---

# Modules

Authentication

/auth/*

Customer

/customers/*

Partner

/partners/*

Company

/companies/*

Booking

/bookings/*

Orders

/orders/*

Assignment

/assignments/*

Payment

/payments/*

Review

/reviews/*

Complaint

/complaints/*

CMS

/articles

/services

/pages

/faqs

---

# HTTP Status

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

# Pagination

?page=1

&limit=20

---

# Sorting

?sort=-created_at

---

# Filtering

?status=completed

---

# Search

?q=ac

---

# Versioning

/api/v1

Future.

/api/v2

---

# Security

JWT

Rate Limiter

RBAC

HTTPS

CORS

---

# Documentation

OpenAPI 3.1

Swagger UI

Scalar API Reference
