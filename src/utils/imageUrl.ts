/**
 * Adds Cloudinary delivery transformations (auto format, auto quality and a
 * max width) to an image URL, so browsers download a right-sized WebP/AVIF
 * instead of the original upload (which can be up to 8 MB).
 *
 * Only standard Cloudinary delivery URLs of the form
 *   https://res.cloudinary.com/<cloud>/image/upload/v<version>/<public_id>.<ext>
 * are rewritten. Anything else (Unsplash, local /images, data: URLs, URLs
 * that already carry a transformation) is returned unchanged.
 */
const UPLOAD_MARKER = '/image/upload/';

export function cloudinaryOptimize(url: string, width: number): string {
  if (!url || !url.startsWith('https://res.cloudinary.com/')) return url;

  const markerIndex = url.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1) return url;

  const head = url.slice(0, markerIndex + UPLOAD_MARKER.length);
  const tail = url.slice(markerIndex + UPLOAD_MARKER.length);

  // Only rewrite the plain "v<digits>/..." form; leave already-transformed URLs alone.
  if (!/^v\d+\//.test(tail)) return url;

  const safeWidth = Math.max(16, Math.min(4000, Math.round(width)));
  return `${head}f_auto,q_auto,c_limit,w_${safeWidth}/${tail}`;
}
