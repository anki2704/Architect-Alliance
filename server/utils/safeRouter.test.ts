import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { safeRouter } from './safeRouter.ts';
import { mapError } from './httpErrors.ts';

async function withServer(fn: (base: string) => Promise<void>) {
  const app = express();
  const router = safeRouter();
  router.get('/boom', async () => {
    throw Object.assign(new Error('cast failed'), { name: 'CastError' });
  });
  router.get('/ok', async (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api', router);
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const { status, message } = mapError(err, true);
    res.status(status).json({ error: message });
  });
  const server = app.listen(0);
  try {
    await fn(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
  } finally {
    server.close();
  }
}

describe('safeRouter', () => {
  it('forwards async handler rejections to the error middleware instead of crashing', async () => {
    await withServer(async (base) => {
      const res = await fetch(`${base}/api/boom`);
      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: 'Invalid identifier.' });
    });
  });

  it('still serves healthy async handlers normally', async () => {
    await withServer(async (base) => {
      const res = await fetch(`${base}/api/ok`);
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), { ok: true });
    });
  });
});
