import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSeedGuard } from './seedGuard.ts';

const base = { nodeEnv: 'development', allowProduction: false, hasExistingData: false, forced: false, dbName: 'architect', typedName: undefined };

describe('evaluateSeedGuard', () => {
  it('allows seeding an empty non-production database', () => {
    assert.equal(evaluateSeedGuard(base).ok, true);
  });
  it('refuses in production unless explicitly allowed', () => {
    assert.equal(evaluateSeedGuard({ ...base, nodeEnv: 'production' }).ok, false);
    assert.equal(evaluateSeedGuard({ ...base, nodeEnv: 'production', allowProduction: true }).ok, true);
  });
  it('refuses to wipe existing data without --force', () => {
    assert.equal(evaluateSeedGuard({ ...base, hasExistingData: true }).ok, false);
  });
  it('refuses a forced wipe unless the database name is typed exactly', () => {
    const forced = { ...base, hasExistingData: true, forced: true };
    assert.equal(evaluateSeedGuard({ ...forced, typedName: 'wrong' }).ok, false);
    assert.equal(evaluateSeedGuard({ ...forced, typedName: undefined }).ok, false);
    assert.equal(evaluateSeedGuard({ ...forced, typedName: ' architect ' }).ok, true);
  });
});
