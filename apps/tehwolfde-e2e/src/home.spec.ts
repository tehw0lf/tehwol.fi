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