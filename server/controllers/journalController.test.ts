import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JournalPost } from '../models/JournalPost.ts';
import { listJournalPosts } from './journalController.ts';

/** Minimal chainable stand-in for a Mongoose query so no database is needed. */
function fakeQuery(docs: unknown[], selectCalls: string[]) {
  const q: any = {
    sort() { return q; },
    select(fields: string) { selectCalls.push(fields); return q; },
    then(resolve: (v: unknown[]) => unknown) { return Promise.resolve(docs).then(resolve); }
  };
  return q;
}

function run(query: Record<string, unknown>) {
  const selectCalls: string[] = [];
  const docs = [{ toJSON: () => ({ id: '1', title: 'A' }) }];
  (JournalPost as any).find = () => fakeQuery(docs, selectCalls);

  let body: unknown;
  const headers: Record<string, string> = {};
  const res: any = {
    set(k: string, v: string) { headers[k] = v; return res; },
    json(b: unknown) { body = b; return res; }
  };
  return listJournalPosts({ query } as any, res).then(() => ({ selectCalls, body }));
}

describe('listJournalPosts', () => {
  it('leaves the heavy article body out of the public list', async () => {
    const { selectCalls, body } = await run({});
    assert.deepEqual(selectCalls, ['-content']);
    assert.deepEqual(body, [{ id: '1', title: 'A' }]);
  });

  it('returns full documents only when ?full=1 is requested', async () => {
    const { selectCalls } = await run({ full: '1' });
    assert.deepEqual(selectCalls, []);
  });

  it('ignores other values of the full flag', async () => {
    const { selectCalls } = await run({ full: 'true' });
    assert.deepEqual(selectCalls, ['-content']);
  });
});
