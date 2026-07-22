// =============================================================================
// Analytics Platform — Funnel Registry
// =============================================================================
// Business funnel definitions for conversion analysis.
// Every funnel maps to a business KPI.
// =============================================================================

import type { FunnelDefinition } from '../types.ts';

const funnels = new Map<string, FunnelDefinition>();

export function registerFunnel(def: FunnelDefinition): void {
  if (funnels.has(def.name)) {
    console.warn(`[Analytics] Funnel "${def.name}" already registered. Overwriting.`);
  }
  funnels.set(def.name, def);
}

export function getFunnel(name: string): FunnelDefinition | undefined {
  return funnels.get(name);
}

export function getAllFunnels(): FunnelDefinition[] {
  return Array.from(funnels.values());
}

// ── Register Funnels ──────────────────────────────────────────────

export function registerDefaultFunnels(): void {
  // ── Booking Funnel ─────────────────────────────────────────
  registerFunnel({
    name: 'booking',
    description: 'Customer journey from landing to booking completion',
    kpi: 'Booking Conversion Rate > 15%',
    window: 3_600_000, // 1 hour
    steps: [
      { order: 1, name: 'Landing', event: 'pageview' },
      { order: 2, name: 'View Service', event: 'service_view' },
      { order: 3, name: 'Start Booking', event: 'booking_start' },
      { order: 4, name: 'Submit Booking', event: 'booking_submit' },
      { order: 5, name: 'Payment', event: 'payment_success' },
    ],
  });

  // ── Partner Registration Funnel ────────────────────────────
  registerFunnel({
    name: 'partner_registration',
    description: 'Partner registration from landing to completion',
    kpi: 'Partner Acquisition Growth > 20% MoM',
    window: 7_200_000, // 2 hours
    steps: [
      { order: 1, name: 'Landing', event: 'pageview' },
      { order: 2, name: 'CTA Click', event: 'partner_cta_click' },
      { order: 3, name: 'Register Start', event: 'partner_register_start' },
      { order: 4, name: 'Register Complete', event: 'partner_register_complete' },
    ],
  });

  // ── Corporate Lead Funnel ──────────────────────────────────
  registerFunnel({
    name: 'corporate_lead',
    description: 'Corporate inquiry from landing to submission',
    kpi: 'Corporate Lead Conversion > 10%',
    window: 3_600_000,
    steps: [
      { order: 1, name: 'Landing', event: 'pageview' },
      { order: 2, name: 'CTA Click', event: 'corporate_cta_click' },
      { order: 3, name: 'Inquiry Start', event: 'inquiry_start' },
      { order: 4, name: 'Inquiry Submit', event: 'inquiry_submit' },
    ],
  });

  // ── Authentication Funnel ──────────────────────────────────
  registerFunnel({
    name: 'authentication',
    description: 'User registration from start to completion',
    kpi: 'Registration Completion Rate > 70%',
    window: 1_800_000, // 30 minutes
    steps: [
      { order: 1, name: 'Register Start', event: 'register_start' },
      { order: 2, name: 'Register Complete', event: 'register_complete' },
    ],
  });
}
