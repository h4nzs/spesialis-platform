import { describe, expect, it } from 'vitest';
import { crowdsecSeverity } from './crowdsec-severity.ts';
import { SEVERITY } from './rules.ts';

describe('crowdsecSeverity', () => {
  it('HIGH untuk serangan eksploitasi & abuse', () => {
    expect(crowdsecSeverity('crowdsecurity/http-sqli-probbing-detection')).toBe(SEVERITY.HIGH);
    expect(crowdsecSeverity('crowdsecurity/http-xss-probbing')).toBe(SEVERITY.HIGH);
    expect(crowdsecSeverity('crowdsecurity/http-backdoors-attempts')).toBe(SEVERITY.HIGH);
    expect(crowdsecSeverity('crowdsecurity/http-sensitive-files')).toBe(SEVERITY.HIGH);
    expect(crowdsecSeverity('crowdsecurity/http-cve-probing')).toBe(SEVERITY.HIGH);
    expect(crowdsecSeverity('crowdsecurity/http-open-proxy')).toBe(SEVERITY.HIGH);
    expect(crowdsecSeverity('ahlipanggilan/otp-abuse')).toBe(SEVERITY.HIGH);
  });

  it('MEDIUM untuk brute-force, DoS, dan probing', () => {
    expect(crowdsecSeverity('ahlipanggilan/bruteforce-login')).toBe(SEVERITY.MEDIUM);
    expect(crowdsecSeverity('crowdsecurity/http-generic-bf')).toBe(SEVERITY.MEDIUM);
    expect(crowdsecSeverity('crowdsecurity/http-dos-random-uri')).toBe(SEVERITY.MEDIUM);
    expect(crowdsecSeverity('crowdsecurity/http-probing')).toBe(SEVERITY.MEDIUM);
    expect(crowdsecSeverity('crowdsecurity/http-path-traversal-probing')).toBe(SEVERITY.MEDIUM);
    expect(crowdsecSeverity('crowdsecurity/http-admin-interface-probing')).toBe(SEVERITY.MEDIUM);
    expect(crowdsecSeverity('ahlipanggilan/404-storm')).toBe(SEVERITY.MEDIUM);
  });

  it('LOW untuk noise/recon pasif, dengan prioritas rule spesifik', () => {
    expect(crowdsecSeverity('crowdsecurity/http-crawl-non_statics')).toBe(SEVERITY.LOW);
    expect(crowdsecSeverity('crowdsecurity/http-bad-user-agent')).toBe(SEVERITY.LOW);
    expect(crowdsecSeverity('crowdsecurity/http-generic-test')).toBe(SEVERITY.LOW);
  });

  it('default LOW untuk scenario tak dikenal', () => {
    expect(crowdsecSeverity('crowdsecurity/mystery-scenario')).toBe(SEVERITY.LOW);
  });
});
