import { describe, it, expect } from 'vitest';
import { routeIntent } from './a2a-rule-router.ts';

describe('routeIntent', () => {
  it('maps coverage questions to check_coverage', () => {
    const match = routeIntent('apakah tersedia di Bandung?');
    expect(match?.tool).toBe('check_coverage');
    expect(match?.args.city).toContain('bandung');
  });

  it('maps booking tracking to track_booking with SP number', () => {
    const match = routeIntent('tolong lacak pesanan saya SP-20260001');
    expect(match?.tool).toBe('track_booking');
    expect(match?.args.bookingNumber).toBe('sp-20260001');
  });

  it('maps service queries to search_services', () => {
    const match = routeIntent('saya butuh jasa service AC dan sedot wc');
    expect(match?.tool).toBe('search_services');
  });

  it('maps service cost questions to get_service_detail', () => {
    const match = routeIntent('berapa biaya jasa ac?');
    expect(match?.tool).toBe('get_service_detail');
    expect(match?.args.slug).toBe('service-ac');
  });

  it('maps general cost questions to search_faq', () => {
    const match = routeIntent('berapa biaya refund?');
    expect(match?.tool).toBe('search_faq');
  });

  it('returns null for unknown intent', () => {
    expect(routeIntent('apa warna langit hari ini')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(routeIntent('CEK STATUS BOOKING SAYA SP-0001')?.tool).toBe('track_booking');
  });
});
