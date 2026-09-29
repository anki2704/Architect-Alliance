import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { staticCacheControl } from './staticCache.ts';

describe('staticCacheControl', () => {
  it('caches hashed build assets for a year', () => {
    assert.match(staticCacheControl('/app/dist/assets/index-AbC123.js'), /max-age=31536000, immutable/);
    assert.match(staticCacheControl('C:\\app\\dist\\assets\\index-AbC123.css'), /immutable/);
  });
  it('does not mark un-hashed public files as immutable', () => {
    const value = staticCacheControl('/app/dist/images/hero/image2.webp');
    assert.equal(value, 'public, max-age=604800');
    assert.doesNotMatch(value, /immutable/);
  });
});
