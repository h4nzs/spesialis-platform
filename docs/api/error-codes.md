# docs/api/error-codes.md

# Error Codes

Project: Specialist Platform

Version: 1.0

---

# Response Format

Success

{
"success": true,
"message": "Success",
"data": {}
}

---

Validation Error

{
"success": false,
"code": "VALIDATION_ERROR",
"message": "Validation failed",
"errors": []
}

---

Server Error

{
"success": false,
"code": "SERVER_ERROR",
"message": "Unexpected server error"
}

---

# HTTP Status

200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

429 Too Many Requests

500 Internal Server Error

---

# Business Error Codes

AUTH_INVALID_CREDENTIAL

AUTH_ACCOUNT_BLOCKED

AUTH_EMAIL_NOT_VERIFIED

AUTH_TOKEN_EXPIRED

BOOKING_NOT_FOUND

BOOKING_ALREADY_CANCELLED

BOOKING_INVALID_STATUS

PARTNER_NOT_AVAILABLE

PARTNER_ALREADY_ASSIGNED

PAYMENT_NOT_FOUND

PAYMENT_ALREADY_VERIFIED

SERVICE_NOT_FOUND

CUSTOMER_NOT_FOUND

COMPANY_NOT_FOUND

FILE_TOO_LARGE

UPLOAD_FAILED

UNKNOWN_ERROR
