import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import { mapError } from './server/utils/httpErrors';
import { isOriginAllowed } from './server/utils/originPolicy';
import { staticCacheControl } from './server/utils/staticCache';
import path from 'path';
import { connectDB } from './server/config/db';
import { connectRedis, isRedisReady } from './server/config/redis';
import {
  apiLimiter,
  createLimiters,
  applyRedisLimiters
} from './server/middleware/rateLimiters';
import { publicGetCache, getCacheStats } from './server/middleware/cache';
import { requestLogger } from './server/middleware/requestLogger';

import authRoutes from './server/routes/authRoutes';
import projectRoutes from './server/routes/projectRoutes';
import bookingRoutes from './server/routes/bookingRoutes';
import EnquiryRoutes from './server/routes/EnquiryRoutes';
import teamRoutes from './server/routes/teamRoutes';
import testimonialRoutes from './server/routes/testimonialRoutes';
import journalRoutes from './server/routes/journalRoutes';
import userRoutes from './server/routes/userRoutes';
import uploadRoutes from './server/routes/uploadRoutes';

const startedAt = Date.now();

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

/** Resolve public site origin for SEO files (robots/sitemap). */
function getPublicOrigin(req: Request): string {
  const fromEnv = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean)[0];
  if (fromEnv) return fromEnv;
  const proto = req.protocol || 'https';
  const host = req.get('host') || 'localhost';
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  validateEnvironment(isProduction);

  await connectRedis();

  const limiters = createLimiters();
  applyRedisLimiters(limiters);

  // Hostinger / Render sit behind a reverse proxy
  if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
  }

  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  // Same-origin + FRONTEND_URL + local dev. No hard-coded Vercel/Render.
  const corsOrigins = new Set([
    ...allowedOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ]);

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
      const connectSources = ["'self'", ...allowedOrigins].join(' ');
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
  // app.use(requestLogger(isProduction));

  app.use('/api', apiLimiter);

  app.use('/api/upload', express.json({ limit: '12mb' }), uploadRoutes);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads'), { maxAge: '7d' }));

  // ---------- Health + lightweight metrics ----------
  app.get('/api/health', (_req, res) => {
    const mem = process.memoryUsage();
    res.status(200).json({
      status: 'ok',
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      redis: isRedisReady() ? 'connected' : 'unavailable',
      cache: getCacheStats(),
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
      },
      timestamp: new Date().toISOString()
    });
  });

  // ---------- Dynamic robots.txt + sitemap ----------
  app.get('/robots.txt', (req, res) => {
    const origin = getPublicOrigin(req);
    res.type('text/plain').send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\n\nSitemap: ${origin}/sitemap.xml\n`
    );
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = getPublicOrigin(req);
    const urls = [
      { loc: `${origin}/`, priority: '1.0', changefreq: 'weekly' },
      { loc: `${origin}/projects`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${origin}/journal`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${origin}/team`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${origin}/privacy`, priority: '0.2', changefreq: 'yearly' }
    ];
    const body =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          (u) =>
            `  <url>\n    <loc>${u.loc}</loc>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
        )
        .join('\n') +
      `\n</urlset>\n`;
    res.type('application/xml').send(body);
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', publicGetCache(90_000), projectRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/messages', EnquiryRoutes);
  app.use('/api/team', publicGetCache(120_000), teamRoutes);
  app.use('/api/testimonials', publicGetCache(120_000), testimonialRoutes);
  app.use('/api/journal', publicGetCache(90_000), journalRoutes);
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
    if (status >= 500) console.error('[HTTP]', err);
    if (res.headersSent) return;
    res.status(status).json({ error: message });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Startup] Server running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
    console.log(`[Startup] Redis: ${isRedisReady() ? 'connected' : 'unavailable (in-memory fallbacks)'}`);
  });
}

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
