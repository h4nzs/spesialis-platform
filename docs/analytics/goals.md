# Goals

## Overview

Goals map analytics events to business KPIs. Every goal is traceable to a measurable business outcome.

## Default Goals (6)

| Goal                | KPI                                  | Events                            | Type           |
| ------------------- | ------------------------------------ | --------------------------------- | -------------- |
| `booking_completed` | Booking Conversion Rate > 15%        | `booking_submit`                  | event          |
| `payment_completed` | Payment Success Rate > 90%           | `payment_success`                 | event          |
| `partner_signup`    | Partner Acquisition Growth > 20% MoM | `partner_register_complete`       | event          |
| `corporate_lead`    | Corporate Lead Conversion > 10%      | `inquiry_submit`                  | event          |
| `cta_engagement`    | CTA Click Rate > 5%                  | `cta_click`                       | event          |
| `user_engagement`   | Engagement Rate > 60%                | `scroll_depth`, `page_engagement` | duration (30s) |

## KPI Tree

```
Booking Conversion Rate > 15%
├── CTA Click Rate > 5%
├── Service View Rate
├── Booking Start Rate
├── Booking Submit Rate
└── Payment Success Rate > 90%

Partner Growth > 20% MoM
├── Partner Registration Start Rate
├── Partner Registration Completion
└── Partner Job Acceptance Rate > 80%

Corporate Lead Conversion > 10%
├── Inquiry Start Rate
└── Inquiry Submit Rate

User Engagement Rate > 60%
├── Scroll Depth > 50% avg
├── Avg Session Duration
├── Page Views per Session
└── Bounce Rate < 40%
```

## Goal API

| Function                 | Purpose                  |
| ------------------------ | ------------------------ |
| `registerGoal(def)`      | Register a new goal      |
| `getGoal(name)`          | Get goal by name         |
| `getAllGoals()`          | List all goals           |
| `registerDefaultGoals()` | Load the 6 default goals |

## Adding a Goal

```ts
registerGoal({
  name: 'service_booking',
  description: 'User books a service after viewing it',
  kpi: 'Service-to-Booking Rate > 20%',
  events: ['service_view', 'booking_submit'],
  type: 'event',
});
```
