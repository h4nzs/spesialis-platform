# Event Taxonomy

## Naming Convention

All event names use **snake_case** with the following pattern:

```
{domain}_{action}
```

Examples:

- `booking_submit` — domain: booking, action: submit
- `payment_success` — domain: payment, action: success
- `cta_click` — domain: cta (navigation), action: click

## Categories

| Category         | Description                          | Example Events                                                  |
| ---------------- | ------------------------------------ | --------------------------------------------------------------- |
| `navigation`     | User navigation and CTA interactions | `pageview`, `cta_click`, `navigation_click`                     |
| `landing`        | Homepage/landing page engagement     | `hero_view`, `hero_cta_click`, `service_view`                   |
| `search`         | Search functionality                 | `search_start`, `search_result`, `search_filter`                |
| `service`        | Service detail pages                 | `service_detail_view`, `service_faq_open`, `service_book_click` |
| `booking`        | Booking flow                         | `booking_start`, `booking_submit`, `booking_cancel`             |
| `payment`        | Payment flow                         | `payment_start`, `payment_success`, `payment_failed`            |
| `authentication` | Auth flows                           | `register_start`, `login_success`, `logout`                     |
| `partner`        | Partner actions                      | `partner_register_complete`, `partner_job_accept`               |
| `corporate`      | Corporate inquiries                  | `inquiry_submit`, `corporate_landing_view`                      |
| `cms`            | Content engagement                   | `article_view`, `faq_open`, `article_list_view`                 |
| `dashboard`      | Dashboard interactions               | `dashboard_view`, `dashboard_filter`, `dashboard_export`        |
| `seo`            | SEO operations                       | `seo_meta_update`, `seo_redirect_create`                        |
| `error`          | Errors and exceptions                | `page_404`, `api_error`, `error_boundary_caught`                |
| `performance`    | Web performance metrics              | `lcp_measure`, `cls_measure`, `fid_measure`                     |
| `engagement`     | User engagement signals              | `scroll_depth`, `session_start`, `session_end`                  |
| `system`         | System events                        | Reserved for internal use                                       |
| `experiment`     | A/B test events                      | Reserved for future use                                         |

## Event Lifecycle

Every event has a lifecycle status:

1. **active** — Currently tracked, being used for analysis
2. **deprecated** — Still tracked but scheduled for removal
3. **removed** — No longer tracked, rejected at runtime

## Domain Events (60+)

### Navigation (6)

- `pageview`, `navigation_click`, `cta_click`, `outbound_link_click`, `download_click`, `history_navigation`

### Landing / Homepage (8)

- `hero_view`, `hero_cta_click`, `service_view`, `service_category_click`, `testimonials_view`, `partner_cta_click`, `corporate_cta_click`, `whatsapp_click`, `footer_cta_click`

### Search (3)

- `search_start`, `search_result`, `search_filter`

### Service (4)

- `service_detail_view`, `service_faq_open`, `service_gallery_view`, `service_book_click`

### Booking (5)

- `booking_start`, `booking_form_step`, `booking_submit`, `booking_confirm`, `booking_cancel`, `booking_status_view`

### Payment (4)

- `payment_start`, `payment_submit`, `payment_success`, `payment_failed`

### Authentication (6)

- `register_start`, `register_complete`, `login_start`, `login_success`, `login_failed`, `logout`, `password_reset_request`, `password_reset_complete`

### Partner (5)

- `partner_register_start`, `partner_register_form_step`, `partner_register_complete`, `partner_dashboard_view`, `partner_job_accept`, `partner_job_reject`, `partner_availability_update`

### Corporate (4)

- `corporate_landing_view`, `inquiry_start`, `inquiry_submit`, `corporate_dashboard_view`

### CMS (4)

- `article_view`, `article_list_view`, `faq_view`, `faq_open`

### Review (2)

- `review_start`, `review_submit`

### Error (4)

- `error_boundary_caught`, `api_error`, `page_404`, `page_500`

### Performance (4)

- `lcp_measure`, `cls_measure`, `fid_measure`, `ttfb_measure`

### Engagement (5)

- `scroll_depth`, `page_engagement`, `session_start`, `session_end`, `visibility_change`
