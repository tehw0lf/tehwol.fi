import { test, expect } from '@playwright/test';

test.describe('tehwolfde', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.locator('text=Welcome to tehwolf.de!')).toBeVisible();
  });

  test('should have proper navigation', async ({ page }) => {
    // Check that navigation elements are present
    await expect(page.locator('tehw0lf-nav')).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check for proper ARIA labels and roles
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });
});