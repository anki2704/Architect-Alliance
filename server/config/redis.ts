import Redis from 'ioredis';

let redis: Redis | null = null;
let isReady = false;

/**
 * Connect to Redis if REDIS_URL is set.
 * Never throws — app continues with in-memory / Mongo fallbacks.
 */
export async function connectRedis(): Promise<void> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) {
    console.warn('[Redis] REDIS_URL not set — using in-memory rate limit + Mongo blacklist');
    return;
  }

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: true,
      connectTimeout: 8000,
      lazyConnect: true,
      // Avoid crashing the process on connection errors
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 2000)),
    });

    redis.on('error', (err) => {
      isReady = false;
      console.warn('[Redis] Error:', err.message);
    });

    redis.on('ready', () => {
      isReady = true;
      console.log('[Redis] Connected and ready');
    });

    redis.on('close', () => {
      isReady = false;
      console.warn('[Redis] Connection closed');
    });

    await redis.connect();
  } catch (err) {
    isReady = false;
    redis = null;
    console.warn('[Redis] Could not connect — falling back:', (err as Error).message);
  }
}

export function getRedis(): Redis | null {
  return isReady ? redis : null;
}

export function isRedisReady(): boolean {
  return isReady && redis !== null;
}