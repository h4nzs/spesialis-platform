const INDEXNOW_API_URL = 'https://api.indexnow.org/indexnow';
const BING_INDEXNOW_URL = 'https://www.bing.com/indexnow';

export interface PingResult {
  destination: string;
  status: number | null;
  error: string | null;
}

function buildPayload(urls: string[], key: string, keyLocation: string, host: string) {
  return {
    host: host.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    key,
    keyLocation,
    urlList: urls,
  };
}

/**
 * Ping IndexNow API to notify search engines about content changes.
 * Returns detailed results for each destination so callers can log them.
 */
export async function pingIndexNow(
  urls: string[],
  key: string,
  keyLocation: string,
  host: string = 'https://ahlipanggilan.id',
): Promise<PingResult[]> {
  if (!urls.length || !key) return [];

  const payload = buildPayload(urls, key, keyLocation, host);

  const results = await Promise.allSettled([
    fetch(INDEXNOW_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
    fetch(BING_INDEXNOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  ]);

  return results.map((r, i) => {
    const destination = i === 0 ? 'indexnow.org' : 'bing.com';
    if (r.status === 'fulfilled') {
      return { destination, status: r.value.status, error: null };
    }
    return {
      destination,
      status: null,
      error: r.reason instanceof Error ? r.reason.message : 'Unknown error',
    };
  });
}

/**
 * Generate a new IndexNow API key (UUID v4).
 */
export function generateIndexNowKey(): string {
  return crypto.randomUUID();
}

/**
 * Get the well-known key location URL.
 */
export function getIndexNowKeyLocation(host: string, key: string): string {
  return `${host.replace(/\/$/, '')}/${key}.txt`;
}
