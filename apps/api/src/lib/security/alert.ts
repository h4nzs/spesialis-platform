import { sendSecurityAlertEmail } from '../email.ts';
import { incrWithWindow, reserveOnce } from './store.ts';
import { SEVERITY_LABEL, type SecurityRule } from './rules.ts';

const HOST =
  process.env.APP_ENV === 'production' ? (process.env.HOSTNAME ?? 'prod-api') : 'dev-api';

/** Cooldown per rule+IP — mencegah banjir notifikasi saat detection storm. */
const ALERT_COOLDOWN_MS = 60_000;

function alertEmails(): string[] {
  return (process.env.SECURITY_ALERT_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function discordWebhook(): string {
  return process.env.SECURITY_ALERT_DISCORD_WEBHOOK_URL ?? '';
}

function maxPerMin(): number {
  return Number(process.env.SECURITY_ALERT_MAX_PER_MIN ?? 5);
}

const DISCORD_COLORS: Record<number, number> = {
  1: 0x95a5a6,
  2: 0xf1c40f,
  3: 0xe67e22,
  4: 0xe74c3c,
  5: 0x8e44ad,
};

export interface SecurityAlert {
  rule: SecurityRule;
  count: number;
  ip: string | null;
  path?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Alert gateway terpusat — semua jalur alert (detection app-level,
 * CrowdSec webhook, trivy, FIM) lewat sini. Channel & penerima dikonfigurasi
 * via env (SECURITY_ALERT_*), bukan di kode.
 */
export function securityAlertEnabled(): boolean {
  return (
    process.env.SECURITY_ALERT_ENABLED !== 'false' &&
    (alertEmails().length > 0 || Boolean(discordWebhook()))
  );
}

export async function sendSecurityAlert(alert: SecurityAlert): Promise<void> {
  if (!securityAlertEnabled()) return;

  const emails = alertEmails();
  const webhook = discordWebhook();
  const maxAlerts = maxPerMin();

  const { rule, ip } = alert;
  const cooldownKey = `security:alert:${rule.id}:${ip ?? 'unknown'}`;
  const passed = await reserveOnce(cooldownKey, ALERT_COOLDOWN_MS);
  if (!passed) return;

  const minuteKey = `security:alert:minute:${Math.floor(Date.now() / 60_000)}`;
  const minuteCount = await incrWithWindow(minuteKey, 60_000);
  if (minuteCount > maxAlerts) return;

  const subject = `🚨 Security Alert (${SEVERITY_LABEL[rule.severity]}): ${rule.eventType}`;
  const text = buildAlertText(alert);

  const deliveries: Promise<void>[] = [];
  if (webhook) deliveries.push(sendDiscord(alert));
  for (const email of emails) deliveries.push(sendSecurityAlertEmail(email, subject, text));

  const results = await Promise.allSettled(deliveries);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[security] alert gagal terkirim:', result.reason);
    }
  }
}

function buildAlertText(alert: SecurityAlert): string {
  const { rule, count, ip, path, metadata } = alert;
  const lines = [
    `Severity: ${SEVERITY_LABEL[rule.severity]}`,
    `Host: ${HOST}`,
    `Event: ${rule.eventType}`,
    `Rule: ${rule.id}`,
    `Source IP: ${ip ?? '-'}`,
    `Path: ${path ?? '-'}`,
    `Count: ${count} (threshold ${rule.threshold} dalam ${Math.round(rule.windowMs / 1000)} detik)`,
    `Action: ${rule.action.toUpperCase()}`,
    `Time: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
  ];
  if (metadata && Object.keys(metadata).length > 0) {
    lines.push(`Metadata: ${JSON.stringify(metadata)}`);
  }
  return lines.join('\n');
}

async function sendDiscord(alert: SecurityAlert): Promise<void> {
  const webhook = discordWebhook();
  const { rule, count, ip, path } = alert;
  const embed = {
    title: `🚨 Security Alert — ${rule.eventType}`,
    color: DISCORD_COLORS[rule.severity] ?? DISCORD_COLORS[1],
    fields: [
      { name: 'Severity', value: SEVERITY_LABEL[rule.severity], inline: true },
      { name: 'Host', value: HOST, inline: true },
      { name: 'Source IP', value: ip ?? '-', inline: true },
      { name: 'Path', value: path ?? '-', inline: true },
      { name: 'Count', value: `${count}/${rule.threshold}`, inline: true },
      { name: 'Action', value: rule.action.toUpperCase(), inline: true },
    ],
    footer: { text: `Rule: ${rule.id} · window ${Math.round(rule.windowMs / 1000)}s` },
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });
  if (!res.ok) throw new Error(`Discord webhook ${res.status}: ${await res.text()}`);
}
