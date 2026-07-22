# Analytics Governance

## Naming Convention

### Events

```
{domain}_{action}
```

- `snake_case`
- Domain reflects the business domain (booking, payment, auth, etc.)
- Action describes what happened (submit, cancel, view, click, etc.)
- Example: `booking_submit`, `payment_failed`, `partner_job_accept`

### Properties

```
{attribute_name}
```

- `snake_case`
- Descriptive and consistent
- Example: `service_id`, `booking_id`, `customer_type`

## Event Lifecycle

```
Active → Deprecated (1 release) → Removed (next release)
```

| Phase      | Duration          | Action                                               |
| ---------- | ----------------- | ---------------------------------------------------- |
| Active     | Current           | Full tracking, all analyses                          |
| Deprecated | 1 release cycle   | Still tracked, warning logged, scheduled for removal |
| Removed    | After deprecation | Rejected at runtime, all code removed                |

## Registration Requirements

Every event MUST have:

- **businessObjective** — What business goal this supports
- **owner** — Team responsible
- **version** — Schema version (increment on breaking changes)
- **status** — active, deprecated, or removed
- **properties.required** — All mandatory fields
- **properties.optional** — All optional fields

Every property MUST have:

- **privacy level** — public, internal, sensitive, or pii
- **type** — string, number, boolean, timestamp, array, or record
- **owner** — Team responsible
- **version** — Schema version

## Review Checklist

Before adding a new event:

- [ ] Does this event support a known business objective?
- [ ] Does this event map to an existing KPI?
- [ ] Is the event name consistent with existing taxonomy?
- [ ] Are all properties registered in the property registry?
- [ ] Are privacy levels correctly assigned?
- [ ] Is the owner team specified?
- [ ] Are tests added for validation?
- [ ] Is the EventRegistry TypeScript interface updated?

Before adding a new property:

- [ ] Is the property name consistent with existing properties?
- [ ] Is the privacy level appropriate?
- [ ] Is the TypeScript type correct?
- [ ] Is the property registered in both registry and property definitions?

## Migration Strategy

When removing an event:

1. Set `status: 'deprecated'` — still works, shows warning
2. After 1 release, set `status: 'removed'` — rejected at runtime
3. Remove from EventRegistry type, event definitions, and tests

## Ownership

| Domain                          | Owner       |
| ------------------------------- | ----------- |
| Navigation, Landing, Engagement | product     |
| Search, Service                 | service     |
| Booking                         | booking     |
| Payment, Finance                | finance     |
| Authentication                  | auth        |
| Partner                         | partner     |
| Corporate                       | corporate   |
| CMS                             | cms         |
| SEO                             | seo         |
| Error, Performance              | engineering |
| Marketing                       | marketing   |
