/**
 * Tiny stale-while-revalidate helper for public lists (projects, journal).
 * The last successful response is kept in sessionStorage so the section can
 * paint instantly on the next visit/navigation while a fresh copy is fetched
 * in the background. Every call is wrapped in try/catch: storage can be
 * unavailable or full and the site must work without it.
 */
const PREFIX = 'architech_list_cache:';

export function readListCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeListCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}
