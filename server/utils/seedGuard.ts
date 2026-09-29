/**
 * Decides whether the destructive demo seed may run.
 *
 *  - In production it never runs unless ALLOW_PRODUCTION_SEED=yes is set on purpose.
 *  - If the database already contains data it needs BOTH --force / CONFIRM_RESEED=yes
 *    AND the operator typing the exact database name (or SEED_CONFIRM_DB=<name>), so a
 *    local .env that silently points at the live Atlas database can't be wiped by habit.
 */
export interface SeedGuardInput {
  nodeEnv: string | undefined;
  allowProduction: boolean;
  hasExistingData: boolean;
  forced: boolean;
  dbName: string;
  typedName: string | undefined;
}

export interface SeedGuardResult {
  ok: boolean;
  reason?: string;
}

export function evaluateSeedGuard(input: SeedGuardInput): SeedGuardResult {
  if (input.nodeEnv === 'production' && !input.allowProduction) {
    return {
      ok: false,
      reason:
        'NODE_ENV=production: the demo seed is disabled on production. It inserts demo content and demo accounts. ' +
        'Create your real admin with `npm run create-admin` instead.'
    };
  }
  if (input.hasExistingData) {
    if (!input.forced) {
      return {
        ok: false,
        reason:
          'This database already has data and the seed would DELETE all of it. Re-run with --force (npm run seed -- --force) if that is really what you want.'
      };
    }
    if ((input.typedName ?? '').trim() !== input.dbName) {
      return {
        ok: false,
        reason: `Confirmation failed: the database name "${input.dbName}" was not typed correctly. Nothing was deleted.`
      };
    }
  }
  return { ok: true };
}
