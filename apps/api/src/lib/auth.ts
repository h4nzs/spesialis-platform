import { sign, verify } from 'hono/jwt';
import { argon2id } from 'hash-wasm';
import { randomUUID, createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db, users, customerProfiles, partnerProfiles } from './db.ts';
import type { UserRole } from '@ahlipanggilan/types';

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error('JWT_SECRET environment variable is required');
  })();

export async function hashPassword(password: string): Promise<string> {
  return argon2id({
    password,
    salt: randomUUID(),
    parallelism: 1,
    iterations: 2,
    memorySize: 19456,
    hashLength: 32,
    outputType: 'encoded',
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    const parts = hash.split('$');
    if (parts.length !== 6) return false;

    const saltBase64 = parts[4]!;
    const saltBytes = new Uint8Array(Buffer.from(saltBase64, 'base64'));

    const newHash = await argon2id({
      password,
      salt: saltBytes,
      parallelism: 1,
      iterations: 2,
      memorySize: 19456,
      hashLength: 32,
      outputType: 'encoded',
    });

    return newHash === hash;
  } catch {
    return false;
  }
}

export function signAccessToken(
  userId: string,
  email: string,
  role: UserRole,
  name?: string,
): Promise<string> {
  return sign(
    {
      sub: userId,
      email,
      role,
      ...(name ? { name } : {}),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60,
    },
    JWT_SECRET,
    'HS256',
  );
}

export async function verifyAccessToken(token: string) {
  return verify(token, JWT_SECRET, 'HS256') as Promise<{
    sub: string;
    role: UserRole;
    exp: number;
  }>;
}

export function generateRefreshToken(): string {
  return randomUUID();
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

export async function getUserDisplayName(userId: string): Promise<string | undefined> {
  const [profile] = await db
    .select({
      customerName: customerProfiles.fullName,
      partnerName: partnerProfiles.fullName,
    })
    .from(users)
    .leftJoin(customerProfiles, eq(customerProfiles.userId, users.id))
    .leftJoin(partnerProfiles, eq(partnerProfiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  return profile?.customerName ?? profile?.partnerName ?? undefined;
}
