import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { RevokedToken } from '../models/RevokedToken';

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Mark a JWT as revoked so protect() will reject it until natural expiry.
 */
export async function revokeToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  let expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // fallback 30d

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

  await RevokedToken.findOneAndUpdate(
    { tokenHash },
    { tokenHash, expiresAt },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

export async function isTokenRevoked(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const found = await RevokedToken.findOne({ tokenHash }).lean();
  return !!found;
}
