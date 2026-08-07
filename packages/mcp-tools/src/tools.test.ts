import { describe, it, expect } from 'vitest';
import {
  toolDefinitions,
  searchServicesSchema,
  getServiceDetailSchema,
  trackBookingSchema,
  checkCoverageSchema,
  searchFaqSchema,
  searchArticlesSchema,
  navigateToPageSchema,
  getPlatformInfoSchema,
  createBookingSchema,
  searchPartnersSchema,
} from './tools.ts';

describe('toolDefinitions', () => {
  it('exports all 10 shared tools with complete metadata', () => {
    expect(toolDefinitions).toHaveLength(10);
    for (const tool of toolDefinitions) {
      expect(tool.name).toMatch(/^[a-z_]+$/);
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.inputSchema).toBeDefined();
      expect(tool.zodSchema).toBeDefined();
    }
  });

  it('exposes tool names used by the A2A agent', () => {
    const names = toolDefinitions.map((t) => t.name);
    expect(names).toContain('search_services');
    expect(names).toContain('create_booking');
    expect(names).toContain('check_coverage');
  });
});

describe('searchServicesSchema', () => {
  it('accepts empty query', () => {
    expect(searchServicesSchema.safeParse({}).success).toBe(true);
  });

  it('rejects invalid limit', () => {
    expect(searchServicesSchema.safeParse({ limit: 0 }).success).toBe(false);
    expect(searchServicesSchema.safeParse({ limit: 51 }).success).toBe(false);
  });
});

describe('getServiceDetailSchema', () => {
  it('accepts a slug', () => {
    expect(getServiceDetailSchema.safeParse({ slug: 'service-ac' }).success).toBe(true);
  });

  it('rejects empty slug', () => {
    expect(getServiceDetailSchema.safeParse({ slug: '' }).success).toBe(false);
  });
});

describe('trackBookingSchema', () => {
  it('accepts valid booking number', () => {
    expect(trackBookingSchema.safeParse({ bookingNumber: 'SP-12345' }).success).toBe(true);
  });

  it('rejects malformed booking number', () => {
    expect(trackBookingSchema.safeParse({ bookingNumber: 'ABC-123' }).success).toBe(false);
  });
});

describe('checkCoverageSchema', () => {
  it('accepts a city', () => {
    expect(checkCoverageSchema.safeParse({ city: 'Bandung' }).success).toBe(true);
  });

  it('rejects empty city', () => {
    expect(checkCoverageSchema.safeParse({ city: '' }).success).toBe(false);
  });
});

describe('createBookingSchema', () => {
  it('accepts a valid booking payload', () => {
    const result = createBookingSchema.safeParse({
      serviceId: 'a3d7de63-d30f-45e6-b6ca-9be6d68ecc4e',
      quantity: 2,
      bookingDate: '2026-08-10',
      bookingTime: '09:00',
      notes: 'Cuci AC 2 unit',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.quantity).toBe(2);
  });

  it('rejects invalid date and time format', () => {
    expect(
      createBookingSchema.safeParse({
        serviceId: 'x',
        bookingDate: '10-08-2026',
        bookingTime: '09:00',
      }).success,
    ).toBe(false);
    expect(
      createBookingSchema.safeParse({
        serviceId: 'x',
        bookingDate: '2026-08-10',
        bookingTime: '9am',
      }).success,
    ).toBe(false);
  });
});

describe('searchFaqSchema', () => {
  it('requires a non-empty query', () => {
    expect(searchFaqSchema.safeParse({ query: 'garansi' }).success).toBe(true);
    expect(searchFaqSchema.safeParse({ query: '' }).success).toBe(false);
  });
});

describe('searchArticlesSchema', () => {
  it('accepts optional limit and rejects out-of-range values', () => {
    expect(searchArticlesSchema.safeParse({ query: 'tips' }).success).toBe(true);
    expect(searchArticlesSchema.safeParse({ query: 'tips', limit: 10 }).success).toBe(true);
    expect(searchArticlesSchema.safeParse({ query: 'tips', limit: 21 }).success).toBe(false);
  });
});

describe('searchPartnersSchema', () => {
  it('accepts empty payload', () => {
    expect(searchPartnersSchema.safeParse({}).success).toBe(true);
  });
});

describe('navigateToPageSchema', () => {
  it('accepts known pages and rejects unknown ones', () => {
    expect(navigateToPageSchema.safeParse({ page: 'services' }).success).toBe(true);
    expect(navigateToPageSchema.safeParse({ page: 'admin' }).success).toBe(false);
  });
});

describe('getPlatformInfoSchema', () => {
  it('accepts known topics only', () => {
    expect(getPlatformInfoSchema.safeParse({ topic: 'corporate' }).success).toBe(true);
    expect(getPlatformInfoSchema.safeParse({ topic: 'pricing' }).success).toBe(false);
  });
});
