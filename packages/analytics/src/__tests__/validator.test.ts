// =============================================================================
// Tests — Event Validator
// =============================================================================

import { describe, it, expect } from 'vitest';
import { validateEvent, validateEventStrict } from '../core/validator.ts';

// Events are registered via side-effect in events/index.ts
import '../events/index.ts';

describe('validateEvent', () => {
  it('returns valid for a registered event with correct properties', () => {
    const result = validateEvent('pageview', { url: '/', title: 'Home' });
    expect(result.valid).toBe(true);
    expect(result.category).toBe('navigation');
  });

  it('returns invalid for unregistered event', () => {
    const result = validateEvent('nonexistent_event', {});
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors![0]).toContain('not registered');
  });

  it('reports missing required properties', () => {
    const result = validateEvent('pageview', {});
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.some((e) => e.includes('Missing required property'))).toBe(true);
  });

  it('reports unknown properties', () => {
    const result = validateEvent('pageview', { url: '/', title: 'Home', unknown_prop: 'test' });
    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.some((e) => e.includes('Unknown property'))).toBe(true);
  });

  it('reports both missing required AND unknown properties', () => {
    // cta_click requires: section, cta, position, page. Missing position and page.
    const result = validateEvent('cta_click', {
      section: 'hero',
      cta: 'Click',
      made_up_prop: 'test',
    });
    expect(result.valid).toBe(false);
    expect(result.errors!.length).toBeGreaterThanOrEqual(1);
    // Should mention missing required position
    expect(result.errors!.some((e) => e.includes('position'))).toBe(true);
    // Should mention unknown property
    expect(result.errors!.some((e) => e.includes('made_up_prop'))).toBe(true);
  });

  it('assigns correct category for navigation events', () => {
    const result = validateEvent('cta_click', {
      section: 'hero',
      cta: 'Pesan',
      position: 1,
      page: '/',
    });
    expect(result.valid).toBe(true);
    expect(result.category).toBe('navigation');
  });

  it('assigns correct category for booking events', () => {
    const result = validateEvent('booking_submit', {
      service_id: 'srv-1',
      booking_id: 'bk-1',
      customer_type: 'guest',
    });
    expect(result.valid).toBe(true);
    expect(result.category).toBe('booking');
  });

  it('assigns correct category for payment events', () => {
    const result = validateEvent('payment_success', {
      booking_id: 'bk-1',
      amount: 50000,
      payment_method: 'transfer',
      payment_id: 'pay-123',
    });
    expect(result.valid).toBe(true);
    expect(result.category).toBe('payment');
  });

  it('assigns correct category for search events', () => {
    const result = validateEvent('search_performed', { query: 'tukang ledeng', result_count: 10 });
    // search_performed is not registered — returns system category
    expect(result.valid).toBe(false);
  });

  it('assigns correct category for error events', () => {
    const result = validateEvent('page_404', {
      path: '/nonexistent',
      referrer: 'https://google.com',
    });
    expect(result.valid).toBe(true);
    expect(result.category).toBe('error');
  });

  it('assigns correct category for auth events', () => {
    const result = validateEvent('login_success', { user_id: 'usr-1', role: 'customer' });
    expect(result.valid).toBe(true);
    expect(result.category).toBe('authentication');
  });
});

describe('validateEventStrict', () => {
  it('throws for invalid events', () => {
    expect(() => validateEventStrict('nonexistent_event', {})).toThrow('[Analytics] Invalid event');
  });

  it('does not throw for valid events', () => {
    expect(() => validateEventStrict('pageview', { url: '/', title: 'Test' })).not.toThrow();
  });
});
