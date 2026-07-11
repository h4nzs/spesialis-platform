import { useState, useEffect, useMemo, useCallback } from 'react';
import { createBrowserClient } from '@ahlipanggilan/shared';
import { Card, Skeleton } from '@ahlipanggilan/ui';

interface IndexNowState {
  key: string;
  keyLocation: string;
  enabled: boolean;
}

interface IndexNowLog {
  id: string;
  url: string;
  status: string;
  httpStatus: number | null;
  error: string | null;
  duration: number | null;
  keyUsed: string | null;
  destination: string;
  createdAt: string;
}

interface IndexNowLogsResponse {
  logs: IndexNowLog[];
  stats: {
    total: number;
    success: number;
    error: number;
    successRate: number;
  };
}

const DESTINATION_LABELS: Record<string, string> = {
  'indexnow.org': 'IndexNow API',
  'bing.com': 'Bing API',
};

const DESTINATION_COLORS: Record<string, string> = {
  'indexnow.org': 'text-blue-600',
  'bing.com': 'text-orange-600',
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

export function IndexNowWidget() {
  const api = useMemo(() => createBrowserClient(), []);
  const [config, setConfig] = useState<IndexNowState | null>(null);
  const [logsData, setLogsData] = useState<IndexNowLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [configData, logsResponse] = await Promise.all([
        api.get<IndexNowState>('/api/v1/indexnow/key').catch(() => null),
        api.get<IndexNowLogsResponse>('/api/v1/indexnow/logs').catch(() => null),
      ]);
      if (configData) setConfig(configData);
      if (logsResponse) setLogsData(logsResponse);
      if (!configData && !logsResponse) {
        setError('Gagal memuat data IndexNow');
      }
    } catch {
      setError('Gagal memuat data IndexNow');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <Card padding="lg" className="space-y-4">
        <Skeleton variant="heading" className="w-48 h-6" />
        <div className="flex gap-4">
          <Skeleton variant="text" className="w-28 h-16" />
          <Skeleton variant="text" className="w-28 h-16" />
          <Skeleton variant="text" className="w-28 h-16" />
        </div>
        <Skeleton variant="text" className="h-20 w-full" />
      </Card>
    );
  }

  const stats = logsData?.stats;
  const recentLogs = logsData?.logs?.slice(0, 8) ?? [];
  const hasKey = config?.key && config.key.length > 0;

  return (
    <Card padding="lg" className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-caption font-semibold uppercase tracking-wider text-text-muted">
          IndexNow
        </h3>
        <button
          onClick={loadData}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-colors"
          title="Refresh"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={loading ? 'animate-spin' : ''}
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-50 px-4 py-3 text-body-sm text-danger-700">
          {error}
          <button onClick={loadData} className="ml-2 font-semibold underline hover:no-underline">
            Coba lagi
          </button>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${hasKey ? 'bg-success-500' : 'bg-warning-500'}`}
          />
          <span className="text-body-sm text-text-secondary">
            {hasKey ? 'API Key siap' : 'Belum ada key'}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${config?.enabled ? 'bg-success-500' : 'bg-neutral-400'}`}
          />
          <span className="text-body-sm text-text-secondary">
            Auto-ping: {config?.enabled ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        {stats && stats.total > 0 && (
          <>
            <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">
                Ping: <span className="font-semibold text-text-primary">{stats.total}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">
                Sukses: <span className="font-semibold text-success-600">{stats.success}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2">
              <span className="text-body-sm text-text-secondary">
                Gagal: <span className="font-semibold text-danger-600">{stats.error}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Success Rate Bar */}
      {stats && stats.total > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-body-xs text-text-muted">
            <span>Tingkat keberhasilan</span>
            <span className="font-semibold">{stats.successRate}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                stats.successRate >= 80
                  ? 'bg-success-500'
                  : stats.successRate >= 50
                    ? 'bg-warning-500'
                    : 'bg-danger-500'
              }`}
              style={{ width: `${stats.successRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Logs Table */}
      {recentLogs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-body-xs font-semibold uppercase tracking-wider text-text-muted">
            Ping Terbaru
          </h4>
          <div className="overflow-hidden rounded-lg border border-border-default">
            <table className="w-full text-body-sm">
              <thead>
                <tr className="border-b border-border-default bg-neutral-50 text-left text-caption font-semibold uppercase tracking-wider text-text-muted">
                  <th className="px-3 py-2">URL</th>
                  <th className="px-3 py-2">Tujuan</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">HTTP</th>
                  <th className="px-3 py-2 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border-default last:border-0 hover:bg-neutral-50 transition-colors"
                  >
                    <td
                      className="max-w-[200px] truncate px-3 py-2 text-text-primary"
                      title={log.url}
                    >
                      {log.url}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-body-xs font-medium ${
                          DESTINATION_COLORS[log.destination] ?? 'text-text-secondary'
                        }`}
                      >
                        {DESTINATION_LABELS[log.destination] ?? log.destination}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-body-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-success-50 text-success-700'
                            : 'bg-danger-50 text-danger-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${
                            log.status === 'success' ? 'bg-success-500' : 'bg-danger-500'
                          }`}
                        />
                        {log.status === 'success' ? 'Sukses' : 'Gagal'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {log.httpStatus ? (
                        <span
                          className={
                            log.httpStatus >= 200 && log.httpStatus < 400
                              ? 'text-success-600'
                              : 'text-danger-600'
                          }
                        >
                          {log.httpStatus}
                        </span>
                      ) : (
                        <span className="text-text-muted">&mdash;</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-text-muted">
                      {formatTimeAgo(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!recentLogs.length && !error && (
        <div className="rounded-lg border-2 border-dashed border-border-default px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary-500"
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </div>
          <p className="text-body-sm text-text-secondary">
            Belum ada ping terkirim. Ping akan tercatat saat artikel dipublikasikan dengan auto-ping
            aktif.
          </p>
          <a
            href="/dashboard/admin/settings"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg px-4 text-body-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
          >
            Atur IndexNow
          </a>
        </div>
      )}

      {/* Footer link */}
      {recentLogs.length > 0 && (
        <div className="border-t border-border-default pt-3 text-right">
          <a
            href="/dashboard/admin/settings"
            className="text-body-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Pengaturan IndexNow &rarr;
          </a>
        </div>
      )}
    </Card>
  );
}
