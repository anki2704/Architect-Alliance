/**
 * Decides whether a browser Origin may call the API.
 *  - no Origin header (curl, server-to-server, same-site GET) -> allowed
 *  - Origin equal to the site's own Host (frontend + API on one domain) -> allowed
 *  - Origin listed in FRONTEND_URL / known dev origins -> allowed
 * Everything else (another website's JavaScript) is refused.
 */
export function isOriginAllowed(
  origin: string | undefined,
  host: string | undefined,
  allowList: Iterable<string>
): boolean {
  if (!origin) return true;
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) return true;
  for (const allowed of allowList) {
    if (allowed === origin) return true;
  }
  return false;
}
