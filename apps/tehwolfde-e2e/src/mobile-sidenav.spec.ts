import { test, expect } from '@playwright/test';

test.describe('Mobile Sidenav Behavior', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport to trigger mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
  });

  test('should show mobile sidenav component on small screens', async ({ page }) => {
    // Verify mobile component is visible
    const mobileNav = page.locator('tehw0lf-mobile');
    await expect(mobileNav).toBeVisible();
    
    // Verify sidenav container exists
    const sidenavContainer = page.locator('mat-sidenav-container');
    await expect(sidenavContainer).toBeVisible();
    
    // Verify sidenav is initially closed
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).not.toHaveClass(/mat-drawer-opened/);
  });

  test('should open sidenav when menu button is clicked', async ({ page }) => {
    // Find and click the menu button within mobile component to open sidenav
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    
    // Verify sidenav opens
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    
    // Verify navigation links are visible
    const homeLink = page.locator('a[routerLink="/home"]');
    await expect(homeLink).toBeVisible();
    
    const portfolioLink = page.locator('a[routerLink="/portfolio"]');
    await expect(portfolioLink).toBeVisible();
    
    const wordlistLink = page.locator('a[routerLink="/wordlist-generator"]');
    await expect(wordlistLink).toBeVisible();
    
    const contactLink = page.locator('a[routerLink="/contact-form"]');
    await expect(contactLink).toBeVisible();
  });

  test('should close sidenav when clicking navigation links', async ({ page }) => {
    // Mock GitHub API for portfolio page
    await page.route('**/api.github.com/users/tehw0lf/repos**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Open sidenav
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    await menuButton.click();
    
    // Verify sidenav is open
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    
    // Click on Portfolio link
    const portfolioLink = page.locator('a[routerLink="/portfolio"]');
    await portfolioLink.click();
    
    // Verify sidenav closes and navigation occurs
    await expect(sidenav).not.toHaveClass(/mat-drawer-opened/);
    await expect(page).toHaveURL(/.*\/portfolio/);
  });

  test('should close sidenav when clicking outside (focus loss)', async ({ page }) => {
    // Open sidenav
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    await menuButton.click();
    
    // Verify sidenav is open
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    
    // Click on the main content area outside sidenav
    const mainContent = page.locator('mat-sidenav-content');
    await mainContent.click();
    
    // Verify sidenav closes
    await expect(sidenav).not.toHaveClass(/mat-drawer-opened/);
  });

  test('should close sidenav when clicking Home link', async ({ page }) => {
    // Open sidenav
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    await menuButton.click();
    
    // Verify sidenav is open
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    
    // Click on Home link
    const homeLink = page.locator('a[routerLink="/home"]');
    await homeLink.click();
    
    // Verify sidenav closes and navigation occurs
    await expect(sidenav).not.toHaveClass(/mat-drawer-opened/);
    await expect(page).toHaveURL(/.*\/home/);
  });

  test('should close sidenav when clicking Wordlist Generator link', async ({ page }) => {
    // Open sidenav
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    await menuButton.click();
    
    // Verify sidenav is open
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    
    // Click on Wordlist Generator link
    const wordlistLink = page.locator('a[routerLink="/wordlist-generator"]');
    await wordlistLink.click();
    
    // Verify sidenav closes and navigation occurs
    await expect(sidenav).not.toHaveClass(/mat-drawer-opened/);
    await expect(page).toHaveURL(/.*\/wordlist-generator/);
  });

  test('should close sidenav when clicking Contact Form link', async ({ page }) => {
    // Open sidenav
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    await menuButton.click();
    
    // Verify sidenav is open
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    
    // Click on Contact Form link
    const contactLink = page.locator('a[routerLink="/contact-form"]');
    await contactLink.click();
    
    // Verify sidenav closes and navigation occurs
    await expect(sidenav).not.toHaveClass(/mat-drawer-opened/);
    await expect(page).toHaveURL(/.*\/contact-form/);
  });

  test('should handle GitHub external link without closing sidenav prematurely', async ({ page }) => {
    // Open sidenav
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    await menuButton.click();
    
    // Verify sidenav is open
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    
    // Click on GitHub external link - this should close sidenav and open new tab
    const githubLink = page.locator('a[href="https://github.com/tehw0lf"]');
    await expect(githubLink).toBeVisible();
    
    // Since this is an external link, it will close sidenav
    await githubLink.click();
    
    // Verify sidenav closes
    await expect(sidenav).not.toHaveClass(/mat-drawer-opened/);
  });

  test('should toggle sidenav when clicking menu button multiple times', async ({ page }) => {
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    const sidenav = page.locator('mat-sidenav');
    
    // Initially closed
    await expect(sidenav).not.toHaveClass(/mat-drawer-opened/);
    
    // Click to open
    await menuButton.click();
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    
    // Click to close
    await menuButton.click();
    await expect(sidenav).not.toHaveClass(/mat-drawer-opened/);
    
    // Click to open again
    await menuButton.click();
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
  });

  test('should maintain theme switching functionality in mobile sidenav', async ({ page }) => {
    // Open sidenav
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    await menuButton.click();
    
    // Verify sidenav is open
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    
    // Look for theme toggle buttons within the sidenav
    const lightButton = sidenav.locator('button#light');
    const darkButton = sidenav.locator('button#dark');
    
    // One of them should be visible
    if (await lightButton.count() > 0 && await lightButton.isVisible()) {
      await lightButton.click();
      await page.waitForTimeout(500);
      // After switching to light theme, dark button should be visible
      await expect(darkButton).toBeVisible();
      // Sidenav should still be open after theme change
      await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    } else if (await darkButton.count() > 0 && await darkButton.isVisible()) {
      await darkButton.click();
      await page.waitForTimeout(500);
      // After switching to dark theme, light button should be visible
      await expect(lightButton).toBeVisible();
      // Sidenav should still be open after theme change
      await expect(sidenav).toHaveClass(/mat-drawer-opened/);
    }
  });

  test('should not show mobile sidenav on desktop screens', async ({ page }) => {
    // Change to desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Mobile component should not be visible on desktop
    const mobileNav = page.locator('tehw0lf-mobile');
    await expect(mobileNav).not.toBeVisible();
    
    // Desktop component should be visible instead
    const desktopNav = page.locator('tehw0lf-desktop');
    await expect(desktopNav).toBeVisible();
  });

  test('should handle rapid clicks on menu button gracefully', async ({ page }) => {
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    const sidenav = page.locator('mat-sidenav');
    
    // Rapid clicks should not cause issues
    await menuButton.click();
    await menuButton.click();
    await menuButton.click();
    await page.waitForTimeout(500);
    
    // Final state should be consistent (open in this case)
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
  });

  test('should maintain navigation state after page reload', async ({ page }) => {
    // Navigate to a specific page
    await page.goto('/portfolio');
    
    // Mock GitHub API
    await page.route('**/api.github.com/users/tehw0lf/repos**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Reload the page
    await page.reload();
    
    // Verify we're still on the correct page
    await expect(page).toHaveURL(/.*\/portfolio/);
    
    // Verify mobile nav is still functional
    const mobileNav = page.locator('tehw0lf-mobile');
    await expect(mobileNav).toBeVisible();
    
    // Verify menu button still works
    const menuButton = page.locator('tehw0lf-mobile button#menu');
    await menuButton.click();
    
    const sidenav = page.locator('mat-sidenav');
    await expect(sidenav).toHaveClass(/mat-drawer-opened/);
  });
});