import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapError } from './httpErrors.ts';
import { isOriginAllowed } from './originPolicy.ts';

describe('mapError', () => {
  it('maps bad ids, validation errors and duplicates to 4xx', () => {
    assert.equal(mapError({ name: 'CastError' }, true).status, 400);
    assert.equal(mapError({ name: 'ValidationError' }, true).status, 400);
    assert.equal(mapError({ code: 11000 }, true).status, 409);
  });

  it('maps body-parser errors', () => {
    assert.equal(mapError({ type: 'entity.parse.failed' }, true).status, 400);
    assert.equal(mapError({ type: 'entity.too.large' }, true).status, 413);
  });

  it('respects explicit 4xx statuses such as the CORS refusal', () => {
    assert.deepEqual(mapError({ status: 403, message: 'Origin is not allowed by CORS.' }, true), {
      status: 403,
      message: 'Origin is not allowed by CORS.'
    });
  });

  it('hides internals of unknown errors in production but not in development', () => {
    assert.deepEqual(mapError(new Error('secret db detail'), true), { status: 500, message: 'Internal server error.' });
    assert.equal(mapError(new Error('secret db detail'), false).message, 'secret db detail');
  });

  it('never trusts a 5xx status coming from the error object', () => {
    assert.equal(mapError({ status: 503, message: 'x' }, true).status, 500);
  });
});

describe('isOriginAllowed', () => {
  const list = ['https://site.example'];
  it('allows requests without an Origin header', () => {
    assert.equal(isOriginAllowed(undefined, 'anything', list), true);
  });
  it('allows same-origin requests (frontend and API on one domain)', () => {
    assert.equal(isOriginAllowed('https://mysite.com', 'mysite.com', []), true);
  });
  it('allows listed origins and refuses everything else', () => {
    assert.equal(isOriginAllowed('https://site.example', 'api.host', list), true);
    assert.equal(isOriginAllowed('https://evil.example', 'api.host', list), false);
  });
  it('does not let a look-alike host through', () => {
    assert.equal(isOriginAllowed('https://mysite.com.evil.io', 'mysite.com', []), false);
  });
});
