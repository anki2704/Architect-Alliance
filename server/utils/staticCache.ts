/**
 * Cache-Control for files served from dist/.
 *  - /assets/*  : Vite content-hash → immutable 1 year
 *  - images / fonts / webp / svg : 30 days
 *  - everything else : 7 days
 */
export function staticCacheControl(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  if (/\/assets\/[^/]+$/.test(normalized)) {
    return 'public, max-age=31536000, immutable';
  }
  if (/\.(webp|png|jpe?g|gif|svg|woff2?|ttf|eot)$/i.test(normalized)) {
    return 'public, max-age=2592000';
  }
  return 'public, max-age=604800';
}
