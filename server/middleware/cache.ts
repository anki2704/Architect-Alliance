import { Request, Response, NextFunction } from 'express';

/**
 * In-memory response cache for public GET endpoints.
 * - Keyed by method + originalUrl
 * - Max entries + TTL to prevent unbounded growth
 * - Not suitable for authenticated / per-user responses
 */
type CacheEntry = { body: string; status: number; expires: number; hits: number };

const store = new Map<string, CacheEntry>();

const DEFAULT_TTL_MS = 60_000;
const MAX_ENTRIES = 200;

function evictIfNeeded() {
  if (store.size <= MAX_ENTRIES) return;
  const sorted = [...store.entries()].sort((a, b) => a[1].expires - b[1].expires);
  const toRemove = sorted.slice(0, store.size - MAX_ENTRIES + 10);
  for (const [key] of toRemove) store.delete(key);
}

export function publicGetCache(ttlMs: number = DEFAULT_TTL_MS) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') return next();
    if (req.headers.authorization) return next();

    const key = `GET:${req.originalUrl}`;
    const hit = store.get(key);
    if (hit && hit.expires > Date.now()) {
      hit.hits += 1;
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttlMs / 1000)}, stale-while-revalidate=30`);
      return res.status(hit.status).type('json').send(hit.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      const payload = JSON.stringify(body);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        store.set(key, {
          body: payload,
          status: res.statusCode,
          expires: Date.now() + ttlMs,
          hits: 0
        });
        evictIfNeeded();
      }
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttlMs / 1000)}, stale-while-revalidate=30`);
      return originalJson(body);
    };

    next();
  };
}

export function invalidatePublicCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.includes(prefix)) store.delete(key);
  }
}

export function getCacheStats() {
  let totalHits = 0;
  for (const entry of store.values()) totalHits += entry.hits;
  return {
    entries: store.size,
    maxEntries: MAX_ENTRIES,
    totalHits
  };
}
