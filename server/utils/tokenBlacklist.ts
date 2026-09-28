import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { RevokedToken } from '../models/RevokedToken';
import { getRedis, isRedisReady } from '../config/redis';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getTtlSeconds(expiresAt: Date): number {
  return Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
}

/**
 * Mark a JWT as revoked so protect() will reject it until natural expiry.
 * Prefers Redis (fast + auto TTL). Falls back to MongoDB.
 */
export async function revokeToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  let expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // fallback 2h

  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (decoded?.exp) {
      expiresAt = new Date(decoded.exp * 1000);
    }
  } catch {
    // keep fallback
  }

  // Ignore if already past expiry
  if (expiresAt.getTime() <= Date.now()) return;

  const redis = getRedis();
  if (redis && isRedisReady()) {
    try {
      const key = `revoked:${tokenHash}`;
      await redis.set(key, '1', 'EX', getTtlSeconds(expiresAt));
      return;
    } catch (err) {
      console.warn(
        '[TokenBlacklist] Redis revoke failed, falling back to Mongo:',
        (err as Error).message
      );
    }
  }

  // MongoDB fallback (TTL index should already exist on expiresAt)
  await RevokedToken.findOneAndUpdate(
    { tokenHash },
    { tokenHash, expiresAt },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

export async function isTokenRevoked(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);

  const redis = getRedis();
  if (redis && isRedisReady()) {
    try {
      const exists = await redis.exists(`revoked:${tokenHash}`);
      if (exists === 1) return true;
      // If not in Redis, still check Mongo (in case it was revoked while Redis was down)
    } catch (err) {
      console.warn(
        '[TokenBlacklist] Redis check failed, falling back to Mongo:',
        (err as Error).message
      );
    }
  }

  const found = await RevokedToken.findOne({ tokenHash }).lean();
  return !!found;
}