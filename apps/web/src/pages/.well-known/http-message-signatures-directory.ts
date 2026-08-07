import type { APIRoute } from 'astro';
import { createHash, createPrivateKey, sign as edSign } from 'node:crypto';

const KID = 'b6opvVeOQR4GHtJIMv19TnAR097PQc5fR-pX7yk7yPk';

const PUBLIC_JWK = {
  crv: 'Ed25519',
  x: 'cuO25FvhX3I6Djybzcv7bydCfVnPRNOR_BWZLkIGZC0',
  kty: 'OKP',
};

const DIRECTORY = {
  keys: [{ ...PUBLIC_JWK, kid: KID, alg: 'EdDSA', use: 'sig' }],
};

/**
 * Build an HTTP Message Signature (draft-ietf-httpbis-message-signatures)
 * over the directory response so recipients can verify the key set was
 * published by this site's authority.
 *
 * Key material is read from BOT_SIGNING_PRIVATE_KEY (Ed25519 JWK, base64
 * encoded JSON). When absent the directory is served unsigned — Cloudflare
 * Web Bot Auth registration requires the signature, so set the secret
 * before enabling it.
 */
function signDirectory(
  body: string,
  method: string,
  targetUri: string,
  authority: string,
): { signatureInput: string; signature: string; contentDigest: string } | null {
  const raw = process.env.BOT_SIGNING_PRIVATE_KEY;
  if (!raw) return null;

  let privateKeyJwk: { d: string; x?: string; crv?: string; kty?: string };
  try {
    privateKeyJwk = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch {
    return null;
  }

  const contentDigest = 'sha-256=:' + createHash('sha256').update(body).digest('base64url') + ':';

  const now = Math.floor(Date.now() / 1000);
  const expires = now + 300;

  const params = [
    '("method" "@target-uri" "@authority" "@content-digest")',
    `created=${now}`,
    `expires=${expires}`,
    `keyid="${KID}"`,
    'tag="http-message-signatures-directory"',
    'req',
  ].join(';');

  const canonical = [
    `"@method": ${method}`,
    `"@target-uri": ${targetUri}`,
    `"@authority": ${authority}`,
    `"@content-digest": ${contentDigest}`,
    `"@signature-params": ${params}`,
    '',
  ].join('\n');

  const privateKey = createPrivateKey({ key: privateKeyJwk, format: 'jwk' });
  const rawSignature = edSign(null, Buffer.from(canonical, 'utf8'), privateKey);

  return {
    signatureInput: `sig1=${params}`,
    signature: `sig1=:${rawSignature.toString('base64url')}:`,
    contentDigest,
  };
}

export const GET: APIRoute = async ({ request }) => {
  const body = JSON.stringify(DIRECTORY, null, 2);
  const url = new URL(request.url);
  const signed = signDirectory(body, request.method, url.href, url.host);

  const headers: Record<string, string> = {
    'Content-Type': 'application/http-message-signatures-directory+json',
    'Cache-Control': 'public, max-age=300',
    'Access-Control-Allow-Origin': '*',
  };
  if (signed) {
    headers['Content-Digest'] = signed.contentDigest;
    headers['Signature-Input'] = signed.signatureInput;
    headers['Signature'] = signed.signature;
  }

  return new Response(body, { status: 200, headers });
};
