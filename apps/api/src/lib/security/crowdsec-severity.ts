import { SEVERITY, type Severity } from './rules.ts';

type SeverityRule = { match: string; severity: Severity };

/**
 * CrowdSec alert (v1.7.x) tidak membawa field severity — hanya nama
 * scenario. Mapping berdasarkan keyword nama scenario menentukan
 * severity untuk keperluan prioritas notifikasi email. Urutan penting:
 * yang lebih spesifik didahulukan (mis. cve sebelum probing).
 */
const RULES: SeverityRule[] = [
  { match: 'sqli', severity: SEVERITY.HIGH },
  { match: 'xss', severity: SEVERITY.HIGH },
  { match: 'backdoor', severity: SEVERITY.HIGH },
  { match: 'sensitive-files', severity: SEVERITY.HIGH },
  { match: 'cve', severity: SEVERITY.HIGH },
  { match: 'open-proxy', severity: SEVERITY.HIGH },
  { match: 'otp-abuse', severity: SEVERITY.HIGH },
  { match: 'bruteforce', severity: SEVERITY.MEDIUM },
  { match: 'generic-bf', severity: SEVERITY.MEDIUM },
  { match: 'dos', severity: SEVERITY.MEDIUM },
  { match: 'admin-interface', severity: SEVERITY.MEDIUM },
  { match: 'path-traversal', severity: SEVERITY.MEDIUM },
  { match: 'wordpress', severity: SEVERITY.MEDIUM },
  { match: '404-storm', severity: SEVERITY.MEDIUM },
  { match: 'probing', severity: SEVERITY.MEDIUM },
];

/** Scenario yang umumnya noise/recon pasif — tidak layak email. */
const LOW_RULES: SeverityRule[] = [
  { match: 'crawl', severity: SEVERITY.LOW },
  { match: 'bad-user-agent', severity: SEVERITY.LOW },
  { match: 'generic-test', severity: SEVERITY.LOW },
];

export function crowdsecSeverity(scenario: string): Severity {
  const name = scenario.toLowerCase();
  for (const rule of RULES) {
    if (name.includes(rule.match)) return rule.severity;
  }
  for (const rule of LOW_RULES) {
    if (name.includes(rule.match)) return rule.severity;
  }
  return SEVERITY.LOW;
}
