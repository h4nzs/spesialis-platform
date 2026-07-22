// =============================================================================
// Analytics Platform — Goal Registry
// =============================================================================
// Maps analytics goals to business KPIs.
// Every goal should be traceable to a business outcome.
// =============================================================================

import type { GoalDefinition } from '../types.ts';

const goals = new Map<string, GoalDefinition>();

export function registerGoal(def: GoalDefinition): void {
  if (goals.has(def.name)) {
    console.warn(`[Analytics] Goal "${def.name}" already registered. Overwriting.`);
  }
  goals.set(def.name, def);
}

export function getGoal(name: string): GoalDefinition | undefined {
  return goals.get(name);
}

export function getAllGoals(): GoalDefinition[] {
  return Array.from(goals.values());
}

// ── Register Goals ────────────────────────────────────────────────
// Called at bootstrap to populate the registry.

export function registerDefaultGoals(): void {
  registerGoal({
    name: 'booking_completed',
    description: 'Customer successfully submits a booking form',
    kpi: 'Booking Conversion Rate > 15%',
    events: ['booking_submit'],
    type: 'event',
  });

  registerGoal({
    name: 'payment_completed',
    description: 'Customer completes payment for an order',
    kpi: 'Payment Success Rate > 90%',
    events: ['payment_success'],
    type: 'event',
  });

  registerGoal({
    name: 'partner_signup',
    description: 'Partner completes registration',
    kpi: 'Partner Acquisition Growth > 20% MoM',
    events: ['partner_register_complete'],
    type: 'event',
  });

  registerGoal({
    name: 'corporate_lead',
    description: 'Corporate submits an inquiry',
    kpi: 'Corporate Lead Conversion > 10%',
    events: ['inquiry_submit'],
    type: 'event',
  });

  registerGoal({
    name: 'cta_engagement',
    description: 'User clicks on a call-to-action button',
    kpi: 'CTA Click Rate > 5%',
    events: ['cta_click', 'hero_cta_click', 'partner_cta_click', 'corporate_cta_click'],
    type: 'event',
  });

  registerGoal({
    name: 'user_engagement',
    description: 'User stays on page and scrolls',
    kpi: 'Engagement Rate > 60%',
    events: ['scroll_depth', 'page_engagement'],
    type: 'duration',
    target: 30000, // 30 seconds
  });
}
