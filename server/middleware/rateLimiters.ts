import rateLimit, { type Options, type RateLimitRequestHandler } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedis, isRedisReady } from '../config/redis';

const common: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
};

function createStore(prefix: string) {
  const client = getRedis();
  if (!client || !isRedisReady()) return undefined;

  return new RedisStore({
    // @ts-expect-error ioredis sendCommand typing
    sendCommand: (...args: string[]) => client.call(...args),
    prefix: `rl:${prefix}:`,
  });
}

/** Factory — call AFTER connectRedis() so store can use Redis when available */
export function createLimiters() {
  const apiLimiter = rateLimit({
    ...common,
    windowMs: 15 * 60 * 1000,
    limit: 600,
    store: createStore('api'),
  });

  const authLimiter = rateLimit({
    ...common,
    windowMs: 15 * 60 * 1000,
    limit: 20,
    message: { error: 'Too many attempts. Please try again in a few minutes.' },
    store: createStore('auth'),
  });

  const otpLimiter = rateLimit({
    ...common,
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: 'Too many OTP requests. Please try again in a few minutes.' },
    store: createStore('otp'),
  });

  const enquiryLimiter = rateLimit({
    ...common,
    windowMs: 15 * 60 * 1000,
    limit: 5,
    store: createStore('enquiry'),
  });

  const bookingLimiter = rateLimit({
    ...common,
    windowMs: 15 * 60 * 1000,
    limit: 5,
    store: createStore('booking'),
  });

  const testimonialLimiter = rateLimit({
    ...common,
    windowMs: 60 * 60 * 1000,
    limit: 5,
    store: createStore('testimonial'),
  });

  if (isRedisReady()) {
    console.log('[RateLimit] Using Redis store');
  } else {
    console.log('[RateLimit] Using in-memory store (per process)');
  }

  return {
    apiLimiter,
    authLimiter,
    otpLimiter,
    enquiryLimiter,
    bookingLimiter,
    testimonialLimiter,
  };
}

// Default in-memory versions (routes import these at module load time)
export let apiLimiter: RateLimitRequestHandler = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 600,
});

export let enquiryLimiter: RateLimitRequestHandler = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 5,
});

export let bookingLimiter: RateLimitRequestHandler = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 5,
});

export let testimonialLimiter: RateLimitRequestHandler = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 5,
});

export let authLimiter: RateLimitRequestHandler = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { error: 'Too many attempts. Please try again in a few minutes.' },
});

export let otpLimiter: RateLimitRequestHandler = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: 'Too many OTP requests. Please try again in a few minutes.' },
});

/** Call this from server.ts after connectRedis() */
export function applyRedisLimiters(limiters: ReturnType<typeof createLimiters>) {
  apiLimiter = limiters.apiLimiter;
  authLimiter = limiters.authLimiter;
  otpLimiter = limiters.otpLimiter;
  enquiryLimiter = limiters.enquiryLimiter;
  bookingLimiter = limiters.bookingLimiter;
  testimonialLimiter = limiters.testimonialLimiter;
}