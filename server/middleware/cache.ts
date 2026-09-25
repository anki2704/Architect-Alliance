import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory response cache for public GET endpoints.
 * Keyed by method + originalUrl. Short TTL so admin edits appear quickly.
 * Not suitable for authenticated or per-user responses.
 */
type CacheEntry = { body: string; status: number; expires: number };

const store = new Map<string, CacheEntry>();

const DEFAULT_TTL_MS = 60_000; // 1 minute

export function publicGetCache(ttlMs: number = DEFAULT_TTL_MS) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();
    // Skip if Authorization header present (auth-aware responses)
    if (req.headers.authorization) return next();

    const key = `GET:${req.originalUrl}`;
    const hit = store.get(key);
    if (hit && hit.expires > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttlMs / 1000)}`);
      return res.status(hit.status).type('json').send(hit.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      const payload = JSON.stringify(body);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.set(key, {
          body: payload,
          status: res.statusCode,
          expires: Date.now() + ttlMs
        });
      }
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttlMs / 1000)}`);
      return originalJson(body);
    };

    next();
  };
}

/** Call after admin mutations so lists refresh immediately. */
export function invalidatePublicCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.includes(prefix)) store.delete(key);
  }
}
