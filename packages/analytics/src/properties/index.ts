// =============================================================================
// Analytics Platform — Property Registry
// =============================================================================
// Every analytics property MUST be registered here with:
//   - Key, description, type, privacy level
//   - Owner team
//   - Allowed values (if enum)
// =============================================================================

import type { PropertyDefinition } from '../types.ts';
import { registerPropertyDefinition } from '../registry/properties.ts';

function prop(def: PropertyDefinition): PropertyDefinition {
  registerPropertyDefinition(def);
  return def;
}

// ── Common / Shared Properties ────────────────────────────────────
prop({
  key: 'url',
  type: 'string',
  description: 'Page URL',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'title',
  type: 'string',
  description: 'Page title',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'referrer',
  type: 'string',
  description: 'HTTP referrer URL',
  privacy: 'public',
  owner: 'product',
  version: 1,
  required: false,
});
prop({
  key: 'page',
  type: 'string',
  description: 'Current page path',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Navigation Properties ─────────────────────────────────────────
prop({
  key: 'destination',
  type: 'string',
  description: 'Navigation target URL or path',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'label',
  type: 'string',
  description: 'Link or button label text',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'section',
  type: 'string',
  description: 'Page section name (hero, footer, sidebar, etc.)',
  privacy: 'public',
  owner: 'product',
  version: 1,
  required: false,
});
prop({
  key: 'cta',
  type: 'string',
  description: 'CTA button text',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'position',
  type: 'number',
  description: 'Element position on page (1-based)',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Service Properties ────────────────────────────────────────────
prop({
  key: 'service_id',
  type: 'string',
  description: 'Unique service identifier',
  privacy: 'public',
  owner: 'service',
  version: 1,
});
prop({
  key: 'category',
  type: 'string',
  description: 'Service category name',
  privacy: 'public',
  owner: 'service',
  version: 1,
});
prop({
  key: 'slug',
  type: 'string',
  description: 'URL-friendly service slug',
  privacy: 'public',
  owner: 'service',
  version: 1,
});
prop({
  key: 'price',
  type: 'number',
  description: 'Service base price in IDR',
  privacy: 'internal',
  owner: 'service',
  version: 1,
  required: false,
});

// ── Search Properties ─────────────────────────────────────────────
prop({
  key: 'query',
  type: 'string',
  description: 'Search query text',
  privacy: 'public',
  owner: 'product',
  version: 1,
  required: false,
});
prop({
  key: 'result_count',
  type: 'number',
  description: 'Number of search results',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'has_results',
  type: 'boolean',
  description: 'Whether the search returned any results',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Booking Properties ────────────────────────────────────────────
prop({
  key: 'booking_id',
  type: 'string',
  description: 'Unique booking identifier (SP-YYYY-NNNNNN)',
  privacy: 'public',
  owner: 'booking',
  version: 1,
});
prop({
  key: 'customer_type',
  type: 'string',
  description: 'Customer type during booking',
  privacy: 'public',
  owner: 'booking',
  version: 1,
  allowedValues: ['guest', 'registered'],
});
prop({
  key: 'reason',
  type: 'string',
  description: 'Cancellation or rejection reason',
  privacy: 'internal',
  owner: 'booking',
  version: 1,
  required: false,
});

// ── Payment Properties ────────────────────────────────────────────
prop({
  key: 'amount',
  type: 'number',
  description: 'Payment amount in IDR',
  privacy: 'sensitive',
  owner: 'finance',
  version: 1,
});
prop({
  key: 'payment_method',
  type: 'string',
  description: 'Payment method (transfer, cash, etc.)',
  privacy: 'public',
  owner: 'finance',
  version: 1,
});
prop({
  key: 'payment_id',
  type: 'string',
  description: 'Unique payment identifier',
  privacy: 'internal',
  owner: 'finance',
  version: 1,
});

// ── Authentication Properties ─────────────────────────────────────
prop({
  key: 'user_id',
  type: 'string',
  description: 'Authenticated user identifier',
  privacy: 'sensitive',
  owner: 'auth',
  version: 1,
});
prop({
  key: 'role',
  type: 'string',
  description: 'User role',
  privacy: 'public',
  owner: 'auth',
  version: 1,
  allowedValues: [
    'customer',
    'partner',
    'corporate',
    'admin',
    'dispatcher',
    'finance',
    'content_manager',
    'super_admin',
  ],
});
prop({
  key: 'email_hash',
  type: 'string',
  description: 'SHA-256 hash of user email (NOT raw email)',
  privacy: 'sensitive',
  owner: 'auth',
  version: 1,
});
prop({
  key: 'method',
  type: 'string',
  description: 'Authentication method (email, google)',
  privacy: 'public',
  owner: 'auth',
  version: 1,
  allowedValues: ['email', 'google'],
});

// ── Partner Properties ────────────────────────────────────────────
prop({
  key: 'partner_id',
  type: 'string',
  description: 'Unique partner identifier',
  privacy: 'sensitive',
  owner: 'partner',
  version: 1,
});
prop({
  key: 'assignment_id',
  type: 'string',
  description: 'Assignment identifier',
  privacy: 'public',
  owner: 'partner',
  version: 1,
});

// ── Corporate Properties ──────────────────────────────────────────
prop({
  key: 'company_name',
  type: 'string',
  description: 'Corporate company name',
  privacy: 'internal',
  owner: 'corporate',
  version: 1,
});
prop({
  key: 'industry',
  type: 'string',
  description: 'Corporate industry type',
  privacy: 'public',
  owner: 'corporate',
  version: 1,
  required: false,
});
prop({
  key: 'employees',
  type: 'number',
  description: 'Number of employees',
  privacy: 'internal',
  owner: 'corporate',
  version: 1,
  required: false,
});
prop({
  key: 'service_interest',
  type: 'string',
  description: 'Type of service corporate is interested in',
  privacy: 'public',
  owner: 'corporate',
  version: 1,
});

// ── CMS Properties ────────────────────────────────────────────────
prop({
  key: 'article_id',
  type: 'string',
  description: 'Article identifier',
  privacy: 'public',
  owner: 'cms',
  version: 1,
});
prop({
  key: 'faq_id',
  type: 'string',
  description: 'FAQ item identifier',
  privacy: 'public',
  owner: 'cms',
  version: 1,
});
prop({
  key: 'question',
  type: 'string',
  description: 'FAQ question text',
  privacy: 'public',
  owner: 'cms',
  version: 1,
});

// ── Review Properties ─────────────────────────────────────────────
prop({
  key: 'rating',
  type: 'number',
  description: 'Rating score (1-5)',
  privacy: 'public',
  owner: 'product',
  version: 1,
  allowedValues: [1, 2, 3, 4, 5],
});

// ── Complaint Properties ──────────────────────────────────────────
prop({
  key: 'complaint_id',
  type: 'string',
  description: 'Complaint identifier',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Filter Properties ─────────────────────────────────────────────
prop({
  key: 'filter',
  type: 'string',
  description: 'Filter name',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'filter_value',
  type: 'number',
  description: 'Filter value (page number, sort order, etc.)',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── SEO Properties ────────────────────────────────────────────────
prop({
  key: 'entity_type',
  type: 'string',
  description: 'SEO entity type (service, article, page)',
  privacy: 'public',
  owner: 'seo',
  version: 1,
});
prop({
  key: 'entity_id',
  type: 'string',
  description: 'SEO entity identifier',
  privacy: 'public',
  owner: 'seo',
  version: 1,
});
prop({
  key: 'source',
  type: 'string',
  description: 'Source URL for redirect or campaign source',
  privacy: 'public',
  owner: 'seo',
  version: 1,
});
prop({
  key: 'page_count',
  type: 'number',
  description: 'Number of pages in sitemap',
  privacy: 'public',
  owner: 'seo',
  version: 1,
});

// ── Error Properties ──────────────────────────────────────────────
prop({
  key: 'component',
  type: 'string',
  description: 'Component name where error occurred',
  privacy: 'public',
  owner: 'engineering',
  version: 1,
});
prop({
  key: 'error',
  type: 'string',
  description: 'Error message (sanitized, no PII)',
  privacy: 'internal',
  owner: 'engineering',
  version: 1,
  required: false,
});
prop({
  key: 'endpoint',
  type: 'string',
  description: 'API endpoint URL (path only, no params)',
  privacy: 'public',
  owner: 'engineering',
  version: 1,
});
prop({
  key: 'http_status',
  type: 'number',
  description: 'HTTP status code',
  privacy: 'public',
  owner: 'engineering',
  version: 1,
});
prop({
  key: 'path',
  type: 'string',
  description: 'URL path',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Performance Properties ────────────────────────────────────────
prop({
  key: 'value',
  type: 'number',
  description: 'Measured performance metric value in ms',
  privacy: 'public',
  owner: 'engineering',
  version: 1,
});
prop({
  key: 'element',
  type: 'string',
  description: 'DOM element selector for LCP',
  privacy: 'public',
  owner: 'engineering',
  version: 1,
  required: false,
});

// ── Engagement Properties ─────────────────────────────────────────
prop({
  key: 'duration',
  type: 'number',
  description: 'Duration in milliseconds',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'interaction_count',
  type: 'number',
  description: 'Number of user interactions',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'depth',
  type: 'number',
  description: 'Scroll depth percentage (0-100)',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── UTM / Campaign Properties ─────────────────────────────────────
prop({
  key: 'utm_source',
  type: 'string',
  description: 'UTM source parameter',
  privacy: 'public',
  owner: 'marketing',
  version: 1,
  required: false,
});
prop({
  key: 'utm_medium',
  type: 'string',
  description: 'UTM medium parameter',
  privacy: 'public',
  owner: 'marketing',
  version: 1,
  required: false,
});
prop({
  key: 'utm_campaign',
  type: 'string',
  description: 'UTM campaign parameter',
  privacy: 'public',
  owner: 'marketing',
  version: 1,
  required: false,
});

// ── File/Download Properties ──────────────────────────────────────
prop({
  key: 'file',
  type: 'string',
  description: 'File name or path',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'type',
  type: 'string',
  description: 'File type extension',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'size',
  type: 'number',
  description: 'File size in bytes',
  privacy: 'public',
  owner: 'product',
  version: 1,
  required: false,
});
prop({
  key: 'text',
  type: 'string',
  description: 'Link text content',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Gallery Properties ────────────────────────────────────────────
prop({
  key: 'image_count',
  type: 'number',
  description: 'Number of gallery images',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Form Properties ───────────────────────────────────────────────
prop({
  key: 'step',
  type: 'number',
  description: 'Multi-step form step number',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'step_name',
  type: 'string',
  description: 'Multi-step form step name',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Dashboard Properties ──────────────────────────────────────────
prop({
  key: 'row_count',
  type: 'number',
  description: 'Number of rows in dashboard export',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Partner Registration Properties ───────────────────────────────
prop({
  key: 'partner_type',
  type: 'string',
  description: 'Partner specialization type',
  privacy: 'public',
  owner: 'partner',
  version: 1,
});

// ── Booking Status Properties ─────────────────────────────────────
prop({
  key: 'status',
  type: 'string',
  description: 'Booking lifecycle status',
  privacy: 'public',
  owner: 'booking',
  version: 1,
});

// ── History Navigation Properties ────────────────────────────────
prop({
  key: 'from',
  type: 'string',
  description: 'Origin URL before navigation',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'to',
  type: 'string',
  description: 'Destination URL after navigation',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'navigation_method',
  type: 'string',
  description: 'Navigation method (back, forward, pushState, replaceState)',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'http_method',
  type: 'string',
  description: 'HTTP method (GET, POST, PUT, DELETE)',
  privacy: 'public',
  owner: 'engineering',
  version: 1,
});

// ── Visibility Properties ────────────────────────────────────────
prop({
  key: 'hidden',
  type: 'boolean',
  description: 'Whether the page tab is currently hidden',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
prop({
  key: 'previous_visibility',
  type: 'string',
  description: 'Previous visibility state before change',
  privacy: 'public',
  owner: 'product',
  version: 1,
  required: false,
});

// ── Session Properties ───────────────────────────────────────────
prop({
  key: 'page_views',
  type: 'number',
  description: 'Number of page views in the current session',
  privacy: 'public',
  owner: 'product',
  version: 1,
});

// ── Count / Aggregate Properties ──────────────────────────────────
prop({
  key: 'count',
  type: 'number',
  description: 'Count of items',
  privacy: 'public',
  owner: 'product',
  version: 1,
  required: false,
});
prop({
  key: 'date',
  type: 'timestamp',
  description: 'Date in YYYY-MM-DD format',
  privacy: 'public',
  owner: 'product',
  version: 1,
  required: false,
});
prop({
  key: 'event_count',
  type: 'number',
  description: 'Count of events',
  privacy: 'public',
  owner: 'product',
  version: 1,
  required: false,
});
prop({
  key: 'timestamp',
  type: 'timestamp',
  description: 'ISO 8601 timestamp',
  privacy: 'public',
  owner: 'product',
  version: 1,
});
