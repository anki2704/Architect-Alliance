# Architech Alliance — MERN Stack Website

A full architecture-firm website: React + Tailwind on the frontend, Express + MongoDB (via Mongoose) on the backend, with JWT-based authentication for three roles (admin, designer/architect, customer).

## Stack

- **M**ongoDB — via Mongoose (`/server/models`)
- **E**xpress — REST API (`/server/routes`, `/server/controllers`)
- **R**eact — frontend (`/src`), styled with Tailwind
- **N**ode — runs it all, with `server.ts` as the single entry point (serves the API and the Vite frontend together)

## Prerequisites

- Node.js 18+
- A MongoDB database — either:
  - **Local:** install MongoDB Community Server and run `mongod`, or
  - **Atlas (free tier, no local install):** create a cluster at https://www.mongodb.com/cloud/atlas and copy its connection string

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the environment template and fill it in:
   ```
   cp .env.example .env
   ```
   - `MONGODB_URI` — your local or Atlas connection string
   - `JWT_SECRET` — a long random string (generate one with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (and the designer/customer equivalents) — real credentials for the accounts `npm run seed` creates. Leave blank only for local testing.

3. Seed the database with the site's content (projects, team, testimonials, journal posts) and the three role accounts:
   ```
   npm run seed
   ```
   This prints the login emails it created. If any `SEED_*_PASSWORD` was left blank, it warns you and falls back to a local dev password — don't run that fallback against a production database.

4. Run the app:
   ```
   npm run dev
   ```
   Open http://localhost:3000 — the same server serves both the API (`/api/*`) and the React frontend.

## Roles & permissions

- **Admin** — full access: manage projects/team/testimonials/journal content, view all bookings and contact inquiries, assign architects, and add/remove designer accounts from the "Designers" tab in the dashboard.
- **Designer** — has their own separate login; sees only bookings assigned to them.
- **Customer** — sees only their own bookings. Public sign-up always creates a customer account; admin/designer accounts are only created via the seed script (or a direct database insert), never through the public API.

## Project structure

```
server/
  config/db.ts          MongoDB connection
  models/                Mongoose schemas (User, Project, Booking, ContactMessage, TeamMember, Testimonial, JournalPost)
  middleware/auth.ts     JWT verification + role-based access control
  controllers/           Route handlers
  routes/                Express routers, mounted in server.ts under /api/*
  seed/                  Seed script — populates MongoDB from src/data/mockData.ts + seedData.ts
src/
  services/api.ts        Central fetch wrapper — attaches JWT, typed helpers per resource
  components/            React components, fetch data from the API
server.ts                Entry point — connects MongoDB, mounts API routes, serves the frontend
```

## Before deploying to production

- Set a fresh, unique `JWT_SECRET` and real `SEED_*_PASSWORD` values — never reuse local dev values.
- Point `MONGODB_URI` at your production database (e.g. Atlas), not localhost.
- Make sure `.env` is never committed (see `.gitignore`).
- Consider adding a password-reset flow and monitoring on the login/register rate limiter for your traffic patterns.

## Extending it

Every entity (projects, team, testimonials, journal posts) already has full admin CRUD on the backend (`POST` / `PUT` / `DELETE` routes, admin-only). The one still missing an admin *UI* is projects/team/testimonials/journal management from the dashboard — the API is ready, so that's mostly a matter of adding forms to `DashboardView.tsx` that call `projectsApi.create/update/remove` etc. from `src/services/api.ts`.

## Auth & OTP email (Gmail)

OTP for login lockout and forgot-password is delivered via Gmail SMTP.

1. Copy `.env.example` → `.env`
2. Set `EMAIL_USER` to your Gmail address
3. Create a [Google App Password](https://myaccount.google.com/apppasswords) (2-Step Verification required) and set `EMAIL_PASS`
4. Optionally set `EMAIL_FROM`

If `EMAIL_USER` / `EMAIL_PASS` are empty, OTP is printed to the server console (dev fallback).

### Auth endpoints

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/auth/register` | Always creates `customer` |
| POST | `/api/auth/login` | All roles |
| POST | `/api/auth/verify-otp` | After 3 failed logins |
| POST | `/api/auth/forgot-password` | Admin, designer & customer |
| POST | `/api/auth/reset-password` | After OTP |
| GET | `/api/auth/me` | Requires Bearer token |
| POST | `/api/auth/logout` | Revokes current JWT server-side |

Forgot password works for **admin**, **designer**, and **customer** — use the account email and the OTP sent

## Operations checklist (security / performance / reliability)

### Rate limiting
Public write endpoints are rate-limited:
- `POST /api/messages` — `enquiryLimiter` (5 / 15 min)
- `POST /api/bookings` — `bookingLimiter` (5 / 15 min)
- `POST /api/testimonials` — `testimonialLimiter` (5 / hour)
- Auth routes use stricter limiters in `authRoutes.ts`
- Global `apiLimiter` on `/api` (600 / 15 min)

### Password policy
All password creation paths (register, reset-password, admin `createDesigner`) use the shared 12–128 character policy in `server/utils/passwordPolicy.ts` (upper + lower + digit + special).

### Error responses
Controllers never send raw `err.message` / stack traces to the client. Details are logged server-side only; clients receive generic messages.

### Compression
`compression` middleware is enabled so API JSON and static assets are gzip’d.

### API response cache
Public GET lists (`/api/projects`, `/api/team`, `/api/testimonials`, `/api/journal`) use a short in-memory cache (60s) via `server/middleware/cache.ts`. Authenticated requests bypass the cache.


### Tiptap editor
The project currently uses Tiptap **v2** (`@tiptap/react` ^2.27). A v3 upgrade is optional and involves breaking API changes (extension imports, `useEditor` options). Track upstream release notes before upgrading; the editor in `src/components/RichTextEditor.tsx` should be regression-tested after any major bump.

### Automated tests
```bash
npm test
```
Currently covers the password policy. Expand with integration tests as needed.

### Error monitoring (Sentry)
Not wired by default. To add:
1. `npm install @sentry/node`
2. Initialize early in `server.ts` with `SENTRY_DSN` from the environment
3. Capture unhandled errors in the global Express error middleware

### Cold starts on Render free/starter tier
Spinning-down services cause multi-second cold starts. Fix by pinging the health endpoint every 5–10 minutes from an external uptime monitor (UptimeRobot, Better Stack, Cron-job.org, etc.):

```
GET https://<your-render-host>/api/health
```

The endpoint is public, returns `{ status: "ok", timestamp }` and is cheap.

### MongoDB Atlas backup strategy
Document and enable in the Atlas UI (or Infrastructure-as-Code):

1. **Cloud Provider Snapshots** (M10+): continuous cloud backups with point-in-time recovery. Preferred for production.
2. **M0 / free tier**: no automated snapshots. Schedule a daily `mongodump` (or Atlas Data Federation export) to S3 / object storage, and test restores quarterly.
3. Retention: keep at least 7 daily + 4 weekly snapshots for production.
4. Store connection strings and restore runbooks outside the repo (password manager / ops wiki). Never commit dump files or live credentials.

