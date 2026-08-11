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

/** Ambang severity minimum untuk surel; Discord selalu menerima semua. */
function emailMinSeverity(): number {
  return Number(process.env.SECURITY_ALERT_EMAIL_MIN_SEVERITY ?? 3);
}

const DISCORD_COLORS: Record<number, number> = {
  1: 0x95a5a6,
  2: 0xf1c40f,
  3: 0xe67e22,
  4: 0xe74c3c,
  5: 0x8e44ad,
};

function colorFor(severity: number): number {
  return DISCORD_COLORS[severity] ?? 0x95a5a6;
}

function severityLabel(severity: number): string {
  return SEVERITY_LABEL[severity] ?? 'LOW';
}

export interface SecurityAlert {
  rule: SecurityRule;
  count: number;
  ip: string | null;
  path?: string;
  metadata?: Record<string, unknown>;
}

export interface ExternalSecurityAlertInput {
  severity: number;
  event: string;
  message: string;
  source: string;
  ip?: string | null;
  metadata?: Record<string, unknown>;
}

interface DiscordEmbed {
  title: string;
  color: number;
  fields: Array<{ name: string; value: string; inline: boolean }>;
  footer?: { text: string };
  timestamp: string;
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
  const { rule, ip } = alert;
  await dispatch({
    cooldownKey: `security:alert:${rule.id}:${ip ?? 'unknown'}`,
    ip,
    severity: rule.severity,
    subject: `🚨 Security Alert (${severityLabel(rule.severity)}): ${rule.eventType}`,
    text: buildAlertText(alert),
    embed: {
      title: `🚨 Security Alert — ${rule.eventType}`,
      color: colorFor(rule.severity),
      fields: [
        { name: 'Severity', value: severityLabel(rule.severity), inline: true },
        { name: 'Host', value: HOST, inline: true },
        { name: 'Source IP', value: ip ?? '-', inline: true },
        { name: 'Path', value: alert.path ?? '-', inline: true },
        { name: 'Count', value: `${alert.count}/${rule.threshold}`, inline: true },
        { name: 'Action', value: rule.action.toUpperCase(), inline: true },
      ],
      footer: { text: `Rule: ${rule.id} · window ${Math.round(rule.windowMs / 1000)}s` },
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Alert dari sumber eksternal (CrowdSec decisions, trivy findings, FIM
 * changes) yang masuk via webhook /api/v1/security/webhook. Cooldown per
 * source+event agar deteksi massal tidak membanjiri notifikasi.
 */
export async function sendExternalSecurityAlert(input: ExternalSecurityAlertInput): Promise<void> {
  const { severity, event, message, source, ip } = input;
  await dispatch({
    cooldownKey: `security:alert:ext:${source}:${event}:${ip ?? 'global'}`,
    ip: ip ?? null,
    severity,
    subject: `🚨 Security Alert (${severityLabel(severity)}): ${event} [${source}]`,
    text: buildExternalAlertText(input),
    embed: {
      title: `🚨 Security Alert — ${event}`,
      color: colorFor(severity),
      fields: [
        { name: 'Severity', value: severityLabel(severity), inline: true },
        { name: 'Host', value: HOST, inline: true },
        { name: 'Source', value: source, inline: true },
        { name: 'Source IP', value: ip ?? '-', inline: true },
        { name: 'Message', value: truncate(message, 1024), inline: false },
      ],
      footer: { text: `Source: ${source}` },
      timestamp: new Date().toISOString(),
    },
  });
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

async function dispatch(params: {
  cooldownKey: string;
  ip: string | null;
  severity: number;
  subject: string;
  text: string;
  embed: DiscordEmbed;
}): Promise<void> {
  if (!securityAlertEnabled()) return;

  const emails = alertEmails();
  const webhook = discordWebhook();
  const maxAlerts = maxPerMin();

  const passed = await reserveOnce(params.cooldownKey, ALERT_COOLDOWN_MS);
  if (!passed) return;

  const minuteKey = `security:alert:minute:${Math.floor(Date.now() / 60_000)}`;
  const minuteCount = await incrWithWindow(minuteKey, 60_000);
  if (minuteCount > maxAlerts) return;

  const deliveries: Promise<void>[] = [];
  if (webhook) deliveries.push(sendDiscordEmbed(webhook, params.embed));
  if (params.severity >= emailMinSeverity()) {
    for (const email of emails) {
      deliveries.push(sendSecurityAlertEmail(email, params.subject, params.text));
    }
  }

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

function buildExternalAlertText(input: ExternalSecurityAlertInput): string {
  const { severity, event, message, source, ip, metadata } = input;
  const lines = [
    `Severity: ${SEVERITY_LABEL[severity] ?? 'LOW'}`,
    `Host: ${HOST}`,
    `Event: ${event}`,
    `Source: ${source}`,
    `Source IP: ${ip ?? '-'}`,
    `Message: ${message}`,
    `Time: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
  ];
  if (metadata && Object.keys(metadata).length > 0) {
    lines.push(`Metadata: ${JSON.stringify(metadata)}`);
  }
  return lines.join('\n');
}

async function sendDiscordEmbed(webhook: string, embed: DiscordEmbed): Promise<void> {
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  });
  if (!res.ok) throw new Error(`Discord webhook ${res.status}: ${await res.text()}`);
}
