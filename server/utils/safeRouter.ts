import { Router, RequestHandler } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Express 4 does NOT catch errors from async route handlers. Without this,
 * a rejected promise (for example Mongoose throwing a CastError for
 * GET /api/projects/not-a-valid-id) becomes an unhandled rejection and Node
 * terminates the whole process — one anonymous request could take the site down.
 *
 * safeRouter() returns a normal Router whose route methods automatically wrap
 * every handler so rejections are forwarded to the Express error middleware.
 */
const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'all', 'use'] as const;

function wrap(arg: unknown): unknown {
  if (Array.isArray(arg)) return arg.map(wrap);
  if (typeof arg !== 'function') return arg; // paths, regexes, etc.
  if (arg.length === 4) return arg; // (err, req, res, next) error middleware — leave untouched
  return asyncHandler(arg as RequestHandler);
}

export function safeRouter(): Router {
  const router = Router();
  for (const method of METHODS) {
    const original = (router as any)[method].bind(router);
    (router as any)[method] = (...args: unknown[]) => original(...args.map(wrap));
  }
  return router;
}
