# Funnels

## Overview

Funnels track user conversion through multi-step business processes. Each funnel maps to a business KPI.

## Default Funnels (4)

### Booking Funnel

**Goal:** Booking Conversion Rate > 15%
**Window:** 1 hour

```
1. Landing          → pageview
2. View Service     → service_view
3. Start Booking    → booking_start
4. Submit Booking   → booking_submit
5. Payment          → payment_success
```

### Partner Registration Funnel

**Goal:** Partner Acquisition Growth > 20% MoM
**Window:** 2 hours

```
1. Landing            → pageview
2. CTA Click          → partner_cta_click
3. Register Start     → partner_register_start
4. Register Complete  → partner_register_complete
```

### Corporate Lead Funnel

**Goal:** Corporate Lead Conversion > 10%
**Window:** 1 hour

```
1. Landing            → pageview
2. CTA Click          → corporate_cta_click
3. Inquiry Start      → inquiry_start
4. Inquiry Submit     → inquiry_submit
```

### Authentication Funnel

**Goal:** Registration Completion Rate > 70%
**Window:** 30 minutes

```
1. Register Start     → register_start
2. Register Complete  → register_complete
```

## Funnel API

| Function                   | Purpose                    |
| -------------------------- | -------------------------- |
| `registerFunnel(def)`      | Register a new funnel      |
| `getFunnel(name)`          | Get funnel by name         |
| `getAllFunnels()`          | List all funnels           |
| `registerDefaultFunnels()` | Load the 4 default funnels |

## Funnel Structure

```ts
interface FunnelStep {
  order: number;
  name: string;
  event: string;
  timeLimit?: number; // ms to complete this step
  optional?: boolean;
}

interface FunnelDefinition {
  name: string;
  description: string;
  kpi: string;
  steps: FunnelStep[];
  window: number; // total time window in ms
}
```
