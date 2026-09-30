import { Request, Response, NextFunction } from 'express';

/**
 * Lightweight request logger.
 * Logs: method path status durationMs
 * Skips noisy health checks in production.
 */
export function requestLogger(isProduction: boolean) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (isProduction && (req.path === '/api/health' || req.path === '/favicon.ico')) {
      return next();
    }

    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      const status = res.statusCode;
      const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
      const line = `[HTTP] ${req.method} ${req.originalUrl} ${status} ${durationMs.toFixed(1)}ms`;

      if (level === 'error') console.error(line);
      else if (level === 'warn') console.warn(line);
      else if (!isProduction || durationMs > 500) console.log(line);
    });

    next();
  };
}
