/**
 * Turns any thrown error into a safe HTTP status + message.
 * Client mistakes (bad id, bad JSON, validation, duplicates, CORS) must be 4xx,
 * not 500, and must never leak internal details in production.
 */
export interface MappedError {
  status: number;
  message: string;
}

export function mapError(err: unknown, isProduction: boolean): MappedError {
  const e = (err ?? {}) as {
    name?: string;
    code?: number | string;
    type?: string;
    status?: number;
    statusCode?: number;
    message?: string;
  };

  if (e.name === 'CastError') return { status: 400, message: 'Invalid identifier.' };
  if (e.name === 'ValidationError') return { status: 400, message: 'Validation failed.' };
  if (e.code === 11000) return { status: 409, message: 'A record with these details already exists.' };
  if (e.type === 'entity.parse.failed') return { status: 400, message: 'Malformed JSON body.' };
  if (e.type === 'entity.too.large') return { status: 413, message: 'Request body is too large.' };

  const explicit = e.status ?? e.statusCode;
  if (typeof explicit === 'number' && explicit >= 400 && explicit < 500) {
    return { status: explicit, message: e.message || 'Request failed.' };
  }

  return {
    status: 500,
    message: isProduction ? 'Internal server error.' : e.message || 'Internal server error.'
  };
}
