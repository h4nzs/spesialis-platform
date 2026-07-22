# Property Registry

## Public Properties (Safe to Send)

| Key                | Type          | Description                   | Owner               |
| ------------------ | ------------- | ----------------------------- | ------------------- |
| `url`              | string        | Page URL                      | product             |
| `title`            | string        | Page title                    | product             |
| `referrer`         | string        | HTTP referrer URL             | product             |
| `page`             | string        | Current page path             | product             |
| `destination`      | string        | Navigation target URL         | product             |
| `label`            | string        | Link/button label text        | product             |
| `section`          | string        | Page section name             | product             |
| `cta`              | string        | CTA button text               | product             |
| `position`         | number        | Element position (1-based)    | product             |
| `service_id`       | string        | Service identifier            | service             |
| `category`         | string        | Service category name         | service             |
| `slug`             | string        | URL-friendly slug             | service             |
| `query`            | string        | Search query text             | product             |
| `result_count`     | number        | Number of search results      | product             |
| `booking_id`       | string        | Booking identifier            | booking             |
| `customer_type`    | string        | Guest or registered           | booking             |
| `method`           | string        | Auth/payment method           | auth/finance        |
| `role`             | string        | User role                     | auth                |
| `assignment_id`    | string        | Assignment identifier         | partner             |
| `industry`         | string        | Corporate industry            | corporate           |
| `service_interest` | string        | Service interest type         | corporate           |
| `article_id`       | string        | Article identifier            | cms                 |
| `faq_id`           | string        | FAQ identifier                | cms                 |
| `question`         | string        | FAQ question text             | cms                 |
| `complaint_id`     | string        | Complaint identifier          | product             |
| `rating`           | number        | Rating score (1-5)            | product             |
| `filter`           | string        | Filter name                   | product             |
| `value`            | string/number | Filter/metric value           | product/engineering |
| `entity_type`      | string        | SEO entity type               | seo                 |
| `entity_id`        | string        | SEO entity identifier         | seo                 |
| `source`           | string        | Campaign/redirect source      | seo/marketing       |
| `endpoint`         | string        | API endpoint path             | engineering         |
| `status`           | number/string | HTTP status or booking status | engineering/booking |
| `path`             | string        | URL path                      | product             |
| `element`          | string        | DOM element selector          | engineering         |
| `duration`         | number        | Duration in ms                | product             |
| `depth`            | number        | Scroll depth (0-100)          | product             |
| `from`             | string        | Origin URL                    | product             |
| `to`               | string        | Destination URL               | product             |
| `hidden`           | boolean       | Tab visibility state          | product             |
| `page_views`       | number        | Session page view count       | product             |
| `file`             | string        | File name/path                | product             |
| `type`             | string        | File type extension           | product             |
| `text`             | string        | Link text content             | product             |

## Sensitive Properties (Filtered by Default)

| Key          | Type   | Description          | Owner   |
| ------------ | ------ | -------------------- | ------- |
| `amount`     | number | Payment amount (IDR) | finance |
| `user_id`    | string | User identifier      | auth    |
| `email_hash` | string | SHA-256 of email     | auth    |
| `partner_id` | string | Partner identifier   | partner |

## Internal Properties (Never Sent to Providers)

| Key            | Type   | Description                   | Owner       |
| -------------- | ------ | ----------------------------- | ----------- |
| `price`        | number | Service base price            | service     |
| `reason`       | string | Cancellation/rejection reason | booking     |
| `payment_id`   | string | Payment identifier            | finance     |
| `company_name` | string | Corporate company name        | corporate   |
| `employees`    | number | Number of employees           | corporate   |
| `error`        | string | Error message (sanitized)     | engineering |

## PII Properties (Blocked by Pattern Match)

These are NOT in the registry but are caught by PII pattern matching:

- `email`, `phone`, `phone_number`, `mobile`, `whatsapp`
- `address`, `full_name`, `name`
- `password`, `token`, `jwt`, `session`
- `secret`, `credit_card`, `card_number`, `cvv`
- `pin`, `otp`, `ssn`, `ktp`, `nik`, `npwp`
- `ip_address`

## UTM / Campaign Properties

| Key            | Type   | Description     | Owner     |
| -------------- | ------ | --------------- | --------- |
| `utm_source`   | string | Campaign source | marketing |
| `utm_medium`   | string | Campaign medium | marketing |
| `utm_campaign` | string | Campaign name   | marketing |

## Adding a New Property

1. Add to `src/properties/index.ts` using `prop()` helper
2. Assign appropriate `privacy` level
3. Add tests if the property affects filtering behavior
