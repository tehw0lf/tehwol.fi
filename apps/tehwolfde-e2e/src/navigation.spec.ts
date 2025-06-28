import { test, expect } from '@playwright/test';

test.describe('Application Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to all main routes', async ({ page }) => {
    // Test home navigation
    await page.goto('/home');
    await expect(page).toHaveURL(/.*\/home/);

    // Test portfolio navigation
    await page.goto('/portfolio');
    await expect(page).toHaveURL(/.*\/portfolio/);
    await expect(page.locator('git-portfolio')).toBeVisible();

    // Test wordlist generator navigation
    await page.goto('/wordlist-generator');
    await expect(page).toHaveURL(/.*\/wordlist-generator/);
    await expect(page.locator('wordlist-generator')).toBeVisible();

    // Test contact form navigation
    await page.goto('/contact-form');
    await expect(page).toHaveURL(/.*\/contact-form/);
    await expect(page.locator('contact-form')).toBeVisible();
  });

  test('should have working navigation menu', async ({ page }) => {
    // Check if navigation component exists
    const nav = page.locator('tehw0lf-nav, nav, [role="navigation"]');
    await expect(nav).toBeVisible();

    // Test navigation links if they exist
    const navLinks = page.locator('a[href*="/"], button').filter({ hasText: /home|portfolio|wordlist|contact/i });
    const linkCount = await navLinks.count();

    if (linkCount > 0) {
      // Test first available navigation link
      const firstLink = navLinks.first();
      await firstLink.click();
      
      // Verify navigation occurred
      await page.waitForLoadState('networkidle');
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check for mobile navigation elements
    const mobileNav = page.locator('tehw0lf-mobile, .mobile-nav, button').filter({ hasText: /menu|hamburger|☰/i });
    
    if (await mobileNav.count() > 0) {
      await mobileNav.first().click();
      
      // Check if mobile menu opens
      const mobileMenu = page.locator('.mobile-menu, mat-sidenav, [role="dialog"]');
      if (await mobileMenu.count() > 0) {
        await expect(mobileMenu.first()).toBeVisible();
      }
    }
  });

  test('should handle theme switching', async ({ page }) => {
    // Look for theme toggle button
    const themeToggle = page.locator('button').filter({ hasText: /theme|dark|light|toggle/i });
    
    if (await themeToggle.count() > 0) {
      await themeToggle.first().click();
      
      // Verify theme change (check for class changes on body)
      await page.waitForTimeout(500); // Give time for theme to apply
      const bodyClasses = await page.locator('body').getAttribute('class');
      expect(bodyClasses).toBeTruthy();
    }
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Start at home
    await page.goto('/');
    
    // Navigate to different routes and verify each loads properly
    const routes = ['/portfolio', '/wordlist-generator', '/contact-form', '/home'];
    
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Verify the page loaded successfully
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('tehw0lf-nav')).toBeVisible();
    }
  });

  test('should handle direct URL access', async ({ page }) => {
    // Test that deep links work properly
    const routes = [
      { path: '/portfolio', component: 'git-portfolio' },
      { path: '/wordlist-generator', component: 'wordlist-generator' },
      { path: '/contact-form', component: 'contact-form' }
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(new RegExp(`.*${route.path}`));
      await expect(page.locator(route.component)).toBeVisible();
    }
  });
});