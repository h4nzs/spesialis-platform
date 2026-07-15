// ─── Constants ───────────────────────────────────────────────────
export {
  ORDER_STATUSES,
  ACTIVE_ORDER_STATUSES,
  FINAL_ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  CANCELLABLE_BY_CUSTOMER,
  canTransition,
  isOrderActive,
  isOrderFinal,
  ROLES,
  ADMIN_ROLES,
  STAFF_ROLES,
  isAdminRole,
  isStaffRole,
  USER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  ASSIGNMENT_STATUSES,
  COMPLAINT_STATUSES,
  PARTNER_AVAILABILITY,
  PARTNER_VERIFICATION_STATUSES,
  COMPANY_STATUSES,
  NOTIFICATION_CHANNELS,
  BOOKING_NUMBER_PREFIX,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ID_PROVINCES,
} from './constants.ts';

// ─── API Client ──────────────────────────────────────────────────
export {
  ApiClient,
  MemoryTokenStore,
  NoopTokenStore,
  createBrowserClient,
  createServerClient,
} from './api-client.ts';
export type { RequestOptions, PaginatedResponse, TokenStore } from './api-client.ts';

// ─── Errors ──────────────────────────────────────────────────────
export {
  ApiClientError,
  NetworkError,
  SessionExpiredError,
  RequestAbortedError,
} from './errors.ts';

// ─── Helpers ─────────────────────────────────────────────────────
export {
  formatCurrency,
  parseCurrency,
  formatPhone,
  formatBookingNumber,
  parseBookingNumber,
  formatDate,
  formatTime,
  formatDuration,
  formatRating,
  parseBookingDateTime,
  isBookingPast,
  isWithinHours,
  daysBetween,
  addDays,
  getDateRange,
  isExpiringSoon,
  formatDateRange,
  getContractStatusBadge,
  getInvoiceBadge,
  INVOICE_STATUS_CHANGE_OPTIONS,
  CONTRACT_STATUS_CHANGE_OPTIONS,
  mapZodIssues,
  isValidUUID,
  isValidEmail,
  isValidIndonesianPhone,
  isValidFileSize,
  isValidFileType,
  truncate,
  slugify,
} from './helpers/index.ts';

// ─── Utilities ───────────────────────────────────────────────────
export {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  getRoleHierarchy,
  compareRoles,
  canManageRole,
  SEO_PERMISSION_KEYS,
  validateStatusChange,
  canCustomerCancel,
  getNextStatuses,
  getStatusLabel,
  getStatusColor,
  Logger,
  logger,
  createLogger,
} from './utils/index.ts';
export { serializeCSV, downloadCSV, downloadBlob } from './utils/index.ts';

export type { PermissionMap, StatusChangeResult, LogLevel, LoggerOptions } from './utils/index.ts';

// ─── IndexNow ────────────────────────────────────────────────────
export { pingIndexNow, generateIndexNowKey, getIndexNowKeyLocation } from './indexnow.ts';

// ─── Schema Templates ────────────────────────────────────────────
export { SCHEMA_TEMPLATES, getSchemaTemplate } from './schema-templates.ts';
export type { SchemaTemplate, SchemaTemplateType, SchemaField } from './schema-templates.ts';

// ─── WA Template ───────────────────────────────────────────────────
export { getCategorySpecificFields, inferCategorySlug } from './wa-template.ts';

// ─── SEO Analyzer ─────────────────────────────────────────────────
export {
  analyzeContent,
  checkReadability,
  getSnippetPreview,
  getScoreColor,
  getScoreLabel,
  slugify as seoSlugify,
} from './seo-analyzer.ts';
export type {
  SeoAnalysisResult,
  SeoCheck,
  ReadabilityResult,
  SnippetPreviewData,
} from './seo-analyzer.ts';
