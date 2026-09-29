/**
 * Cache-Control for files served from dist/.
 *  - /assets/*  : Vite adds a content hash to the file name, so they never change -> cache 1 year.
 *  - everything else (images, favicon, og image, theme script): the file name does NOT change
 *    when the content changes, so a 1-year "immutable" cache would show stale images after an
 *    update. Cache for 7 days instead.
 */
export function staticCacheControl(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  if (/\/assets\/[^/]+$/.test(normalized)) return 'public, max-age=31536000, immutable';
  return 'public, max-age=604800';
}
