import { expect, test as base } from '@playwright/test';

/**
 * Known console noise. Every entry names its source; keep each pattern as
 * narrow as the source allows. Entries match by text (and location where one
 * is given) in every browser, so a message with the same text logged by other
 * code is allowed as well.
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
    // (frame-ancestors)". WebKit: "Refused to load <url> because it does not
    // appear in the frame-ancestors directive of the Content Security Policy."
    // The WebKit alternative names the five embed hosts of
    // apps/tehwolfde/src/app/embeds/apps.ts, so a refused framing of any other
    // site or of the app's own routes still fails the test.
    pattern:
      /Framing '[^']*' violates the following Content Security Policy directive: "frame-ancestors|blocked the loading of a resource \(frame-ancestors\)|Refused to load https:\/\/(?:flowdive|numveil|btrain|color|farbduell)\.tehwolf\.de\/ because it does not appear in the frame-ancestors directive of the Content Security Policy/,
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
    // OcticonDirective (libs/git-portfolio) logs every failed icon fetch with
    // console.error; Firefox cancels them when a test navigates away. This is
    // this repository's own code, and the entry is a text-only exception: it
    // applies in every browser and to any code that logs this text.
    pattern: /NetworkError when attempting to fetch resource/,
    reason: 'icon fetch cancelled by a navigation in Firefox'
  },
  {
    // Firefox reports a web font as failed when a navigation cancels its
    // download. This hits the app's own fonts and those of the beep preview on
    // the home page alike. The entry names the aborted status only
    // (status=2152398850 is NS_BINDING_ABORTED), so a font that fails for any
    // other reason (a 404, a network error) still fails the test. Text-only:
    // it applies in every browser and to any font source.
    pattern: /downloadable font: download failed .*status=2152398850 source: /,
    reason: 'font download cancelled by a navigation in Firefox'
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
            .catch(() => null)
            .then((args) => {
              // Firefox renders an Error argument as a bare handle preview.
              // When the arguments could not be read either, nothing of the
              // message is known, so it cannot be told from the cancelled
              // icon fetches above and is not counted.
              if (args === null && /^(JSHandle@\w+\s*)+$/.test(base)) {
                return;
              }
              const text = [base, ...(args ?? [])].join(' ');
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
