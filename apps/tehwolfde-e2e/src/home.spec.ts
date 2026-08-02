import { test, expect } from '@playwright/test';

test.describe('tehwolfde Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.locator('h1:has-text("Welcome to tehwolf.de!")')).toBeVisible();
  });

  test('should have proper navigation component', async ({ page }) => {
    // Wait for navigation to be fully rendered and visible
    await expect(page.locator('mat-toolbar')).toBeVisible();
    await expect(page.locator('tehw0lf-nav')).toBeAttached();
  });

  test('should show navigation links', async ({ page }) => {
    // Check for navigation links in main navigation
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(mainNav.locator('a[routerLink="/home"]')).toBeVisible();
    await expect(mainNav.locator('a[routerLink="/portfolio"]')).toBeVisible();
    await expect(mainNav.locator('a[routerLink="/wordlist-generator"]')).toBeVisible();
    await expect(mainNav.locator('a[routerLink="/contact-form"]')).toBeVisible();
  });

  test('should have theme switcher', async ({ page }) => {
    // Check for theme toggle buttons in main navigation
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    const lightButton = mainNav.locator('button#light');
    const darkButton = mainNav.locator('button#dark');
    
    // One of them should be visible
    await expect(lightButton.or(darkButton)).toBeVisible();
  });

  test('should have language switcher', async ({ page }) => {
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    const trigger = mainNav.locator('button.language-button');

    // The trigger reports the active locale rather than the one on offer.
    await expect(trigger).toContainText('English');

    await trigger.click();
    const menu = page.locator('.mat-mdc-menu-panel');
    await expect(menu).toBeVisible();

    // Endonyms, so each language is recognisable to someone who cannot read
    // the currently active one.
    await expect(menu.getByRole('menuitemradio', { name: 'Deutsch' })).toBeVisible();
    await menu.getByRole('menuitemradio', { name: 'Deutsch' }).click();

    await expect(trigger).toContainText('Deutsch');
    await expect(page.locator('h1')).toContainText('Willkommen');
  });

  // The endonyms differ in width, so a label sized to its content resized the
  // button on every switch and shoved the GitHub link beside it sideways. jsdom
  // does not lay text out, so the fixed box can only be verified here, against
  // a real layout, by measuring the same element in both locales.
  test('should not resize the language switcher when the locale changes', async ({
    page
  }) => {
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    const trigger = mainNav.locator('button.language-button');

    const englishBox = await trigger.boundingBox();

    await trigger.click();
    await page
      .locator('.mat-mdc-menu-panel')
      .getByRole('menuitemradio', { name: 'Deutsch' })
      .click();
    await expect(trigger).toContainText('Deutsch');

    const germanBox = await trigger.boundingBox();

    expect(englishBox).not.toBeNull();
    expect(germanBox).not.toBeNull();

    // A whole pixel of slack rather than toBeCloseTo's 0.05: engines round
    // subpixel text metrics differently per locale, and this has to hold across
    // every Playwright project. The regression it guards against moved the
    // button by 6px, so the looser bound still catches it comfortably.
    expect(Math.abs((germanBox?.width ?? 0) - (englishBox?.width ?? 0)))
      .toBeLessThanOrEqual(1);
    // The glyph and the first letter have to stay put too, not just the outer
    // edges: Material centres the label, so a fixed width alone would still
    // slide the text inside it.
    expect(Math.abs((germanBox?.x ?? 0) - (englishBox?.x ?? 0)))
      .toBeLessThanOrEqual(1);
  });

  // Focusing #main-content after NavigationEnd used to scroll the carousels:
  // the browser reveals a focus target by scrolling every scroll container
  // around it, which walked the first track on the page to its far end. On a
  // phone the libraries section therefore arrived showing its last slide.
  // The viewport comes from a fresh context rather than setViewportSize: the
  // scroll only happens on the navigation that focuses main, so the page has to
  // be laid out at phone width before it loads, not resized afterwards.
  test('should start every carousel at its first slide on mobile', async ({
    browser,
    browserName
  }) => {
    // isMobile is a Chromium only option, and Chromium is where the offending
    // focus scroll happens, so the other engines run the same check without it.
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      ...(browserName === 'chromium'
        ? { isMobile: true, hasTouch: true }
        : {})
    });

    try {
      const page = await context.newPage();
      await page.goto('/');

      await expect(
        page.locator('[data-section] .carousel-track').first()
      ).toBeVisible();

      // The offending scroll is animated and starts shortly after load, so the
      // tracks have to be read once they have settled. expect.poll would defeat
      // the test: it retries until the condition holds and so passes on the
      // first sample taken before the animation begins.
      await page.waitForTimeout(5000);

      const offsets = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll('[data-section] .carousel-track')
        ).map((track) => (track as HTMLElement).scrollLeft)
      );

      expect(offsets).toEqual([0, 0]);
    } finally {
      await context.close();
    }
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('tehw0lf-desktop')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('tehw0lf-mobile')).toBeVisible();
  });

  test('should have GitHub link', async ({ page }) => {
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(mainNav.locator('a[href="https://github.com/tehw0lf"]')).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check for proper ARIA labels and roles on main navigation
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(mainNav).toBeVisible();
    
    // Check if mobile navigation exists when switching to mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileComponent = page.locator('tehw0lf-mobile');
    await expect(mobileComponent).toBeVisible();
  });
});