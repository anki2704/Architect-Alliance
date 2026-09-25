import rateLimit from 'express-rate-limit';

const common = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
};

export const apiLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 600
});

export const enquiryLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 5
});

export const bookingLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  limit: 5
});

export const testimonialLimiter = rateLimit({
  ...common,
  windowMs: 60 * 60 * 1000,
  limit: 5
});
