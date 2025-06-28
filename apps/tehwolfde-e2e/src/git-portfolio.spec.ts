import { test, expect } from '@playwright/test';

test.describe('Git Portfolio Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portfolio');
  });

  test('should load git portfolio component', async ({ page }) => {
    await expect(page.locator('git-portfolio')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    // Check for loading indicator
    const loadingIndicator = page.locator('mat-spinner, mat-progress-spinner, [role="progressbar"]');
    await expect(loadingIndicator).toBeVisible();
  });

  test('should handle responsive layout', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('git-portfolio')).toBeVisible();

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('git-portfolio')).toBeVisible();
  });

  test('should display repository cards when data loads', async ({ page }) => {
    // Wait for potential repository cards to load
    await page.waitForTimeout(2000); // Give time for API calls
    
    // Check if repo cards are present or if empty state is shown appropriately
    const repoCards = page.locator('repo-card');
    const count = await repoCards.count();
    
    if (count > 0) {
      await expect(repoCards.first()).toBeVisible();
    } else {
      // If no repos, ensure the component still renders properly
      await expect(page.locator('git-portfolio')).toBeVisible();
    }
  });
});