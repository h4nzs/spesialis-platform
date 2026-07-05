# Corporate API

## Companies

Base URL: `/api/v1/companies`

`GET /` — List companies (admin).

`POST /` — Register company (public — creates company + admin user).

`PATCH /:id` — Update company.

`POST /:id/verify` — Verify company (admin).

`GET /:id/branches` — List branches.

`POST /:id/branches` — Add branch.

`PATCH /:id/branches/:branch_id` — Update branch.

`DELETE /:id/branches/:branch_id` — Delete branch.

---

## Corporate Inquiries

Base URL: `/api/v1/corporate-inquiries`

### Public

`POST /` — Submit inquiry (no auth required).

Body:

```json
{
  "companyName": "PT Maju Jaya",
  "legalName": "PT Maju Jaya Tbk",
  "email": "info@majujaya.com",
  "phone": "08123456789",
  "industry": "Hospitality",
  "employeeCount": 500,
  "notes": "Tertarik dengan layanan kebersihan"
}
```

### Admin (role: `admin`, `super_admin`)

`GET /` — List inquiries (filter by status).

Query: `?page=1&limit=50&status=Pending`

`GET /:id` — Detail inquiry.

`PATCH /:id` — Update inquiry status.

Body:

```json
{
  "status": "Contacted | Negotiation | Converted | Closed",
  "notes": "Catatan admin"
}
```

Status flow: Pending → Contacted → Negotiation → Converted / Closed.
