import { test, expect } from '@playwright/test';

test.describe('tehwolfde Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.locator('h1:has-text("Welcome to tehwolf.de!")')).toBeVisible();
  });

  test('should have proper navigation component', async ({ page }) => {
    // Check that navigation elements are present
    await expect(page.locator('tehw0lf-nav')).toBeVisible();
    await expect(page.locator('mat-toolbar')).toBeVisible();
  });

  test('should show navigation links', async ({ page }) => {
    // Check for navigation links
    await expect(page.locator('a[routerLink="/home"]')).toBeVisible();
    await expect(page.locator('a[routerLink="/portfolio"]')).toBeVisible();
    await expect(page.locator('a[routerLink="/wordlist-generator"]')).toBeVisible();
    await expect(page.locator('a[routerLink="/contact-form"]')).toBeVisible();
  });

  test('should have theme switcher', async ({ page }) => {
    // Check for theme toggle buttons (either light or dark should be visible)
    const lightButton = page.locator('button#light');
    const darkButton = page.locator('button#dark');
    
    // One of them should be visible
    await expect(lightButton.or(darkButton)).toBeVisible();
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
    await expect(page.locator('a[href="https://github.com/tehw0lf"]')).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    // Check for proper ARIA labels and roles
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });
});