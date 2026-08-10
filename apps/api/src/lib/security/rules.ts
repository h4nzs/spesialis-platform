export type Severity = 1 | 2 | 3 | 4 | 5;

export const SEVERITY: Record<'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', Severity> = {
  INFO: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  CRITICAL: 5,
};

export const SEVERITY_LABEL: Record<number, string> = {
  1: 'INFO',
  2: 'LOW',
  3: 'MEDIUM',
  4: 'HIGH',
  5: 'CRITICAL',
};

export type RuleAction = 'alert' | 'block';

export interface SecurityRule {
  id: string;
  eventType: string;
  windowMs: number;
  threshold: number;
  severity: Severity;
  /** 'block' (auto-block IP) disiapkan untuk iterasi berikutnya. */
  action: RuleAction;
}

/**
 * Rules detection — satu sumber kebenaran. Alert dikirim tepat saat
 * hitungan menyentuh threshold dalam window (sekali per window per IP).
 */
export const SECURITY_RULES: SecurityRule[] = [
  {
    id: 'brute-force-login',
    eventType: 'AUTH_LOGIN_FAILED',
    windowMs: 60_000,
    threshold: 5,
    severity: SEVERITY.HIGH,
    action: 'alert',
  },
  {
    id: 'otp-abuse',
    eventType: 'AUTH_OTP_FAILED',
    windowMs: 60_000,
    threshold: 10,
    severity: SEVERITY.HIGH,
    action: 'alert',
  },
  {
    id: 'auth-rate-limited',
    eventType: 'AUTH_RATE_LIMITED',
    windowMs: 60_000,
    threshold: 20,
    severity: SEVERITY.MEDIUM,
    action: 'alert',
  },
  {
    id: 'payload-anomaly',
    eventType: 'SUSPICIOUS_PAYLOAD',
    windowMs: 60_000,
    threshold: 5,
    severity: SEVERITY.MEDIUM,
    action: 'alert',
  },
  {
    id: 'endpoint-enumeration',
    eventType: 'ENDPOINT_ENUMERATION',
    windowMs: 60_000,
    threshold: 30,
    severity: SEVERITY.LOW,
    action: 'alert',
  },
  {
    id: 'mass-booking',
    eventType: 'BOOKING_CREATED',
    windowMs: 60_000,
    threshold: 10,
    severity: SEVERITY.LOW,
    action: 'alert',
  },
];

export const DEFAULT_SEVERITY: Severity = SEVERITY.LOW;

export interface SuspiciousPattern {
  name: string;
  pattern: RegExp;
}

/**
 * Signature payload anomali (dicocokkan pada URL yang sudah di-decode).
 * Diletakkan di sini, bukan di middleware, agar penambahan rule baru tidak
 * menyentuh kode request pipeline.
 */
export const SUSPICIOUS_PATTERNS: SuspiciousPattern[] = [
  {
    name: 'sql-injection',
    pattern:
      /\b(union\s+select|information_schema|pg_sleep|select\s+[\w*]+\s+from|or\s+1\s*=\s*1)\b/i,
  },
  { name: 'xss', pattern: /(<script|<\/script|onerror\s*=|javascript:\s*)/i },
  { name: 'path-traversal', pattern: /(\.\.\/|\.\.%2[fF]|%2[eE]%2[eE]%2[fF])/ },
];
