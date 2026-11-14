import { expect, test as base } from '@playwright/test';

/**
 * Known noise that is not produced by this repository's code. Every entry
 * names its source; keep each pattern as narrow as the source allows.
 */
export const allowedConsoleErrors: {
  pattern?: RegExp;
  locationPattern?: RegExp;
  reason: string;
}[] = [
  {
    // The embedded sites allow framing only from their production origin, so
    // the local dev server is refused (Chromium reports it without location,
    // Firefox through its Playwright instrumentation).
    // Firefox words it differently: "blocked the loading of a resource
    // (frame-ancestors)".
    pattern:
      /Framing '[^']*' violates the following Content Security Policy directive: "frame-ancestors|blocked the loading of a resource \(frame-ancestors\)/,
    reason: 'embedded site refuses to be framed by the local server'
  },
  {
    // Firefox logs this when the embed frame holds a refused or not yet loaded
    // document; EmbedComponent posts with the embed's own origin as target.
    // Firefox quotes with typographic quotes.
    pattern:
      /Failed to execute .postMessage. on .DOMWindow.: The target origin provided \(.https:\/\/[^'’]+.\) does not match the recipient window.s origin \(.null.\)/,
    reason: 'Firefox postMessage target mismatch for a refused embed frame'
  },
  {
    // The unauthenticated GitHub API call of the git portfolio is rate limited
    // for shared addresses; the browser logs the failed request itself.
    pattern: /^Failed to load resource: .*status of 403/,
    locationPattern: /^https:\/\/api\.github\.com\//,
    reason: 'GitHub API rate limit'
  },
  {
    // The suite runs against `nx serve`; Firefox reports failed dev server
    // client fetches when the page reloads. Both must match: in Chromium the
    // dev server client wraps console.error, so every message carries its
    // location and a location-only entry would hide real errors.
    pattern: /NetworkError when attempting to fetch resource/,
    locationPattern: /\/@vite\/client/,
    reason: 'dev server client fetch failure during reload'
  }
];

/** An entry matches when every pattern it names matches. */
const isAllowed = (text: string, locationUrl: string): boolean =>
  allowedConsoleErrors.some(
    (entry) =>
      (entry.pattern === undefined || entry.pattern.test(text)) &&
      (entry.locationPattern === undefined ||
        entry.locationPattern.test(locationUrl))
  );

/**
 * `test` with an automatic fixture that fails every test on a console error
 * or an uncaught page error that is not on the allow-list. Specs must import
 * `test` and `expect` from here (enforced by lint).
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      const pending: Promise<void>[] = [];

      page.on('console', (message) => {
        if (message.type() !== 'error') {
          return;
        }
        const base = message.text();
        const locationUrl = message.location().url;
        pending.push(
          Promise.all(
            message
              .args()
              .map((arg) =>
                arg.evaluate((value) =>
                  value instanceof Error ? value.message : String(value)
                )
              )
          )
            // Evaluation fails when the page navigated away: use the text.
            .catch(() => [] as string[])
            .then((args) => {
              const text = [base, ...args].join(' ');
              if (
                !isAllowed(text, locationUrl) &&
                !isAllowed(base, locationUrl)
              ) {
                errors.push(text);
              }
            })
        );
      });
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });

      await use(errors);

      await Promise.all(pending);
      expect(
        errors,
        'unexpected console or page errors (see allowedConsoleErrors in fixtures.ts)'
      ).toEqual([]);
    },
    { auto: true }
  ]
});

export { expect };
