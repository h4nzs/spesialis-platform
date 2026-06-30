# docs/api/booking-api.md

# Booking API

Base URL

/api/v1/bookings

---

GET /

List Booking.

---

POST /

Create Booking.

---

GET /:id

Detail Booking.

---

PATCH /:id

Update Booking.

---

DELETE /:id

Cancel Booking.

---

POST /:id/confirm

Admin Confirmation.

---

POST /:id/assign

Assign Partner.

---

POST /:id/accept

Partner menerima assignment.

Otomatis mengubah status order menjadi Partner Accepted.

---

POST /:id/reject

Partner menolak assignment.

Body: { "reason": "string (wajib)" }

Status order kembali ke Waiting Assignment.

---

POST /:id/start

Start Job.

---

POST /:id/complete

Complete Job.

---

POST /:id/payment

Confirm Payment.

---

GET /tracking/:booking_number

Public Tracking.

Full path: `/api/v1/bookings/tracking/:booking_number`

Endpoint publik — tidak memerlukan authentication.
