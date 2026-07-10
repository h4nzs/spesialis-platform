# ERD

## Users & Profiles

users
│
├── customer_profiles (1:1)
│ │
│ ├── addresses (1:N)
│ ├── orders (1:N)
│ ├── reviews (1:N)
│ └── complaints (1:N)
│
├── partner_profiles (1:1)
│ │
│ ├── partner_skills (1:N)
│ ├── assignments (1:N)
│ ├── reviews (1:N)
│ └── earnings (1:N)
│
└── company_users (1:N)
│
└── companies (N:1)

## Companies

companies
│
├── company_users (1:N)
├── branches (1:N)
├── orders (1:N)
├── contracts (1:N)
└── invoices (1:N)

## Services

service_categories
│
└── services (1:N)
│
├── order_items (1:N)
└── seo_metadata (1:1)

## Orders

orders
│
├── customer_profiles (N:1)
├── partner_profiles (N:1)
├── addresses (N:1)
├── companies (N:1)
├── order_items (1:N)
├── assignments (1:N)
├── payments (1:N)
├── reviews (1:1)
├── complaints (1:N)
├── order_status_history (1:N)
└── audit_logs (1:N)

## Payments

payments
│
├── orders (N:1)
├── media (N:1)
└── users - verified_by (N:1)

## Notifications

notifications
│
└── users (N:1)

## Media

media
│
├── articles
├── services
├── orders
├── partners
├── companies
├── reviews
├── complaints
├── ktp
├── avatar
└── seo

## CMS

articles
│
├── article_categories
├── seo_metadata
└── media

faq

seo_metadata
│
├── services (1:1)
├── articles (1:1)
├── categories (1:1)
└── landing_pages (1:1)

## Audit & Settings

audit_logs

system_settings

## Hidden Collections (Internal)

order_status_history

partner_availability_logs

payment_logs

notification_logs

## Singleton Collections

homepage

company_information

website_settings

seo_settings

---

# Legend

(1:1) = One to One
(1:N) = One to Many
(N:1) = Many to One
(N:N) = Many to Many
