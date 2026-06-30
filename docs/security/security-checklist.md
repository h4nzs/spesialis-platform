# Security Checklist

## Authentication

- JWT
- Refresh Token
- Password Hash Argon2id
- HTTPS

---

## Authorization

- RBAC

- Route Guard

- API Permission

---

## Database

- Foreign Key

- Transaction

- Prepared Statement

- Soft Delete

---

## API

- Rate Limit: 100 request/menit per IP (publik)
- Auth endpoints: 10 request/menit per IP (login, register, forgot-password)
- Booking creation: 30 request/jam per customer
- Input Validation
- Output Sanitization

---

## Frontend

- CSP

- XSS Protection

- CSRF Protection

- Secure Cookie

---

## Infrastructure

- Docker Secret

- Firewall

- SSL

- Backup

- Monitoring
