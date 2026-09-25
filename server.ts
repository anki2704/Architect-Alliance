import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { connectDB } from './server/config/db';
import { apiLimiter } from './server/middleware/rateLimiters';
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

  // Local development
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',

  // Vercel testing
  'https://architect-alliance.vercel.app'
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || corsOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin is not allowed by CORS.'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: false
    })
  );

  // Baseline security headers without locking the Three.js/Cloudinary CSP yet.
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

  // Gzip/Brotli compression for JSON and static assets (reduces TTFB on slow links).
  app.use(compression());

  // Protect the whole API against burst traffic. Sensitive/public write routes
  // have stricter route-specific limits below.
  app.use('/api', apiLimiter);

  // Uploads are parsed before the normal JSON parser so the larger limit is
  // scoped only to the authenticated image endpoint.
  app.use('/api/upload', express.json({ limit: '12mb' }), uploadRoutes);

  // Keep normal JSON requests small.
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  // Backward-compatible serving for any legacy local uploads. New uploads use Cloudinary.
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  // Public read endpoints: short in-memory cache (1 min) to avoid hitting Mongo on every page load.
  app.use('/api/projects', publicGetCache(60_000), projectRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/messages', EnquiryRoutes);
  app.use('/api/team', publicGetCache(60_000), teamRoutes);
  app.use('/api/testimonials', publicGetCache(60_000), testimonialRoutes);
  app.use('/api/journal', publicGetCache(60_000), journalRoutes);
  app.use('/api/users', userRoutes);

  // API 404s must return JSON instead of falling through to the SPA index.
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
        maxAge: '1y',
        immutable: true,
        index: false
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'), { maxAge: 0 });
    });
  }

  // Express 4 does not automatically catch rejected async handlers. Route
  // handlers are wrapped with asyncHandler, while this catches everything else.
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[HTTP]', err);
    if (res.headersSent) return;
    res.status(500).json({
      error: isProduction ? 'Internal server error.' : err.message || 'Internal server error.'
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Startup] Server failed to start:', err);
  process.exit(1);
});
