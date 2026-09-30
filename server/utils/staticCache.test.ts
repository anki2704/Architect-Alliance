import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { staticCacheControl } from './staticCache.ts';

describe('staticCacheControl', () => {
  it('caches hashed build assets for a year', () => {
    assert.match(staticCacheControl('/app/dist/assets/index-AbC123.js'), /max-age=31536000, immutable/);
    assert.match(staticCacheControl('C:\\app\\dist\\assets\\index-AbC123.css'), /immutable/);
  });

  it('caches images and fonts for 30 days (not immutable)', () => {
    const value = staticCacheControl('/app/dist/images/hero/image2.webp');
    assert.equal(value, 'public, max-age=2592000');
    assert.doesNotMatch(value, /immutable/);

    assert.equal(staticCacheControl('/app/dist/fonts/inter.woff2'), 'public, max-age=2592000');
  });

  it('caches other public files for 7 days', () => {
    const other = staticCacheControl('/app/dist/manifest.json');
    assert.equal(other, 'public, max-age=604800');
    assert.doesNotMatch(other, /immutable/);
  });
});