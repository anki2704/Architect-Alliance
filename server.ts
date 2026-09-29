import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import { mapError } from './server/utils/httpErrors';
import { isOriginAllowed } from './server/utils/originPolicy';
import { staticCacheControl } from './server/utils/staticCache';
import path from 'path';
import { connectDB } from './server/config/db';
import { connectRedis, isRedisReady } from './server/config/redis';          // ← ADD
import {
  apiLimiter,
  createLimiters,
  applyRedisLimiters
} from './server/middleware/rateLimiters';                                  // ← UPDATE
import { publicGetCache } from './server/middleware/cache';

import authRoutes from './server/routes/authRoutes';
import projectRoutes from './server/routes/projectRoutes';
import bookingRoutes from './server/routes/bookingRoutes';
import EnquiryRoutes from './server/routes/EnquiryRoutes';
import teamRoutes from './server/routes/teamRoutes';
import testimonialRoutes from './server/routes/testimonialRoutes';
import journalRoutes from './server/routes/journalRoutes';
import userRoutes from './server/routes/userRoutes';
import uploadRoutes from './server/routes/uploadRoutes';

function validateEnvironment(isProduction: boolean) {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) throw new Error(`${key} is not configured.`);
  }
  if (isProduction && (process.env.JWT_SECRET?.length || 0) < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }
  if (isProduction && (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_UPLOAD_PRESET)) {
    throw new Error('Cloudinary configuration is required in production.');
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  validateEnvironment(isProduction);

  // ← ADD: Redis pehle connect karo (graceful — fail hone pe bhi app chalegi)
  await connectRedis();

  // ← ADD: Redis-aware limiters banao aur export hone wale limiters ko update karo
  const limiters = createLimiters();
  applyRedisLimiters(limiters);

  // Render/Hostinger sit behind a reverse proxy. Keep this configurable.
  if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
  }

  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const corsOrigins = new Set([
    ...allowedOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://architect-alliance.vercel.app'
  ]);

  // Allows: no Origin header, the site's own origin (frontend + API on one domain),
  // FRONTEND_URL and the local dev origins. Anything else gets a clean 403.
  app.use(
    cors((req, callback) => {
      const origin = req.headers.origin;
      const allowed = isOriginAllowed(origin, req.headers.host, corsOrigins);
      callback(
        allowed ? null : Object.assign(new Error('Origin is not allowed by CORS.'), { status: 403 }),
        {
          origin: allowed,
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: false
        }
      );
    })
  );

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      const connectSources = ["'self'", 'https://architect-alliance.onrender.com', ...allowedOrigins].join(' ');
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://ui-avatars.com",
          `connect-src ${connectSources}`,
          "frame-src 'self' https://www.google.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'"
        ].join('; ')
      );
    }
    next();
  });

  app.use(compression());

  // Ab yeh Redis-aware apiLimiter use karega (agar Redis connected hai)
  app.use('/api', apiLimiter);

  app.use('/api/upload', express.json({ limit: '12mb' }), uploadRoutes);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), { maxAge: '7d' }));

  // ← UPDATE: Health check me redis status add
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      redis: isRedisReady() ? 'connected' : 'unavailable',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', publicGetCache(60_000), projectRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/messages', EnquiryRoutes);
  app.use('/api/team', publicGetCache(60_000), teamRoutes);
  app.use('/api/testimonials', publicGetCache(60_000), testimonialRoutes);
  app.use('/api/journal', publicGetCache(60_000), journalRoutes);
  app.use('/api/users', userRoutes);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API route not found.' });
  });

  await connectDB();

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        index: false,
        setHeaders: (res, filePath) => res.setHeader('Cache-Control', staticCacheControl(filePath))
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'), { maxAge: 0 });
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const { status, message } = mapError(err, isProduction);
    // Only real server faults are logged loudly; bad ids / bad JSON are just client mistakes.
    if (status >= 500) console.error('[HTTP]', err);
    if (res.headersSent) return;
    res.status(status).json({ error: message });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Safety nets: log stray promise rejections instead of dying silently; for a truly
// uncaught exception exit so the process manager (pm2 / Hostinger) restarts a clean process.
process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught exception:', err);
  process.exit(1);
});

startServer().catch((err) => {
  console.error('[Startup] Server failed to start:', err);
  process.exit(1);
});