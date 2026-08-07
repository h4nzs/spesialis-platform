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

  // RFC 9421: the signing base string is built from component name/value
  // pairs followed by the full Signature-Input (including the signature
  // label, e.g. `sig1=`). No trailing newline. Verifiers (e.g. Cloudflare
  // Web Bot Auth) reconstruct this string exactly, so it must match.
  const signatureInput = `sig1=${params}`;
  const canonical = [
    `"@method": ${method}`,
    `"@target-uri": ${targetUri}`,
    `"@authority": ${authority}`,
    `"@content-digest": ${contentDigest}`,
    `"@signature-params": ${signatureInput}`,
  ].join('\n');

  const privateKey = createPrivateKey({ key: privateKeyJwk, format: 'jwk' });
  const rawSignature = edSign(null, Buffer.from(canonical, 'utf8'), privateKey);

  return {
    signatureInput,
    signature: `sig1=:${rawSignature.toString('base64url')}:`,
    contentDigest,
  };
}

export const GET: APIRoute = async ({ request }) => {
  const body = JSON.stringify(DIRECTORY, null, 2);
  const url = new URL(request.url);
  // Request internally arrives as http via nginx proxy; canonicalize with the
  // public https scheme so external verifiers (Cloudflare, clients) reproduce
  // the exact @target-uri the signature was computed over.
  const externalUrl = `https://${url.host}${url.pathname}${url.search}`;
  const signed = signDirectory(body, request.method, externalUrl, url.host);

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
