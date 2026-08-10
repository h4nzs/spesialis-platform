import { describe, expect, it } from 'vitest';
import { SECURITY_RULES, SUSPICIOUS_PATTERNS, SEVERITY_LABEL } from './rules.ts';

describe('security rules', () => {
  it('rule ids unik', () => {
    const ids = SECURITY_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('semua rule ber-action alert di v1 (auto-block menyusul)', () => {
    expect(SECURITY_RULES.every((r) => r.action === 'alert')).toBe(true);
  });

  it('severity valid dan punya label', () => {
    for (const r of SECURITY_RULES) {
      expect(r.severity).toBeGreaterThanOrEqual(1);
      expect(r.severity).toBeLessThanOrEqual(5);
      expect(SEVERITY_LABEL[r.severity]).toBeTruthy();
      expect(r.threshold).toBeGreaterThan(0);
      expect(r.windowMs).toBeGreaterThan(0);
    }
  });

  it('SUSPICIOUS_PATTERNS mendeteksi payload umum', () => {
    const sqli = SUSPICIOUS_PATTERNS.find((p) =>
      p.pattern.test("https://ahlipanggilan.id/api/services?id=1' OR 1=1--"),
    );
    expect(sqli?.name).toBe('sql-injection');

    const xss = SUSPICIOUS_PATTERNS.find((p) => p.pattern.test('/x?q=<script>alert(1)</script>'));
    expect(xss?.name).toBe('xss');

    const traversal = SUSPICIOUS_PATTERNS.find((p) =>
      p.pattern.test('/api/files/../../etc/passwd'),
    );
    expect(traversal?.name).toBe('path-traversal');
  });
});
