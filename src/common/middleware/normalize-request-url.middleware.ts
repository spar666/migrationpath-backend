import type { IncomingMessage, Server } from 'http';

/**
 * Silences `[DEP0169] DeprecationWarning: url.parse() is not standardized...`
 * and hardens the request line at the same time.
 *
 * Express 5 routes via `parseurl`, which has a hand-rolled fast path for the
 * ordinary `/path?query` shape. Anything else — an absolute-form request URI
 * (`GET http://host/path HTTP/1.1`, legal per RFC 9112 §3.2.2 and routinely
 * emitted by proxies and by scanners probing for open relays), `OPTIONS *`,
 * or a target containing a fragment, TAB, NBSP or BOM — makes it fall back to
 * the legacy `url.parse()`, which Node runtime-deprecated. We do not control
 * that dependency, so instead we guarantee the fast path is the one taken.
 *
 * This has to run before Express: its router calls `parseurl(req)` to pick the
 * first layer, i.e. before any `app.use()` middleware executes. So we hook the
 * HTTP server's `request` event ahead of Express's own listener instead.
 *
 * Rewriting through the WHATWG `URL` parser percent-encodes stray characters
 * and drops any fragment (which a client should never have sent), so the
 * target reaching the router is always `/path?query`. The untouched value is
 * preserved on `req.rawRequestUrl` for logging and debugging.
 */

/** Leading char is not "/", or the target contains a char parseurl bails on. */
const NEEDS_NORMALISING = /^[^/]|[\t\n\f\r # ﻿]/;

/** Only gives the WHATWG parser something to resolve against; origin is dropped. */
const DUMMY_BASE = 'http://localhost';

export interface NormalisableRequest extends IncomingMessage {
  rawRequestUrl?: string;
}

/** Rewrites `req.url` in place so `parseurl` never reaches `url.parse()`. */
export function normalizeRequestUrl(req: NormalisableRequest): void {
  const raw = req.url;

  if (typeof raw !== 'string' || raw.length === 0) {
    req.url = '/';
    return;
  }

  if (!NEEDS_NORMALISING.test(raw)) return;

  req.rawRequestUrl = raw;

  try {
    const parsed = new URL(raw, DUMMY_BASE);
    req.url = `${parsed.pathname}${parsed.search}`;
  } catch {
    // Unparseable target — route it at the root rather than letting a
    // malformed request line reach the router.
    req.url = '/';
  }
}

/**
 * Registers {@link normalizeRequestUrl} ahead of Express on a long-lived HTTP
 * server. Use in `main.ts`; serverless handlers should call
 * `normalizeRequestUrl(req)` directly before delegating to the Express app.
 */
export function installRequestUrlNormalizer(server: Server): void {
  server.prependListener('request', (req: NormalisableRequest) =>
    normalizeRequestUrl(req),
  );
}
