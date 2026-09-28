import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { cloudinaryOptimize } from './imageUrl.ts';

const ORIGINAL = 'https://res.cloudinary.com/democloud/image/upload/v1712345678/villa-front_1712.jpg';

describe('cloudinaryOptimize', () => {
  it('adds auto format/quality and a width limit to a plain Cloudinary URL', () => {
    assert.equal(
      cloudinaryOptimize(ORIGINAL, 800),
      'https://res.cloudinary.com/democloud/image/upload/f_auto,q_auto,c_limit,w_800/v1712345678/villa-front_1712.jpg'
    );
  });

  it('does not touch non-Cloudinary URLs', () => {
    const unsplash = 'https://images.unsplash.com/photo-123?w=1200';
    assert.equal(cloudinaryOptimize(unsplash, 800), unsplash);
    assert.equal(cloudinaryOptimize('/images/hero/image2.png', 800), '/images/hero/image2.png');
    assert.equal(cloudinaryOptimize('data:image/png;base64,AAAA', 800), 'data:image/png;base64,AAAA');
  });

  it('does not double-transform an already transformed URL', () => {
    const already = 'https://res.cloudinary.com/democloud/image/upload/w_300,q_auto/v1712345678/a.jpg';
    assert.equal(cloudinaryOptimize(already, 800), already);
  });

  it('returns empty input unchanged and clamps absurd widths', () => {
    assert.equal(cloudinaryOptimize('', 800), '');
    assert.match(cloudinaryOptimize(ORIGINAL, 999999), /w_4000\//);
    assert.match(cloudinaryOptimize(ORIGINAL, 1), /w_16\//);
  });
});
