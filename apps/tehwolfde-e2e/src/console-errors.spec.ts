import { expect, test } from './fixtures';

// Self-test of the shared fixture; runs in every Playwright project, so the
// detection is also confirmed in WebKit (CI only).
test.describe('Console error fixture', () => {
  test('should collect a logged Error argument', async ({
    page,
    consoleErrors
  }) => {
    await page.goto('/home');
    await page.evaluate(() => console.error(new Error('NG0950: e2e probe')));

    await expect
      .poll(() => consoleErrors.join('\n'))
      .toContain('NG0950: e2e probe');

    consoleErrors.length = 0;
  });

  test('should collect an uncaught page error', async ({
    page,
    consoleErrors
  }) => {
    await page.goto('/home');
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error('e2e page error probe');
      });
    });

    await expect
      .poll(() => consoleErrors.join('\n'))
      .toContain('e2e page error probe');

    consoleErrors.length = 0;
  });

  test('should ignore an allow-listed message', async ({
    page,
    consoleErrors
  }) => {
    await page.goto('/home');
    await page.evaluate(() =>
      console.error(
        `Framing 'https://example.invalid/' violates the following Content Security Policy directive: "frame-ancestors 'self'".`
      )
    );
    // A second, unlisted error marks the point after which the first one
    // would have been collected.
    await page.evaluate(() => console.error('e2e marker'));

    await expect.poll(() => consoleErrors.join('\n')).toContain('e2e marker');
    expect(consoleErrors.join('\n')).not.toContain('Framing');

    consoleErrors.length = 0;
  });
});
