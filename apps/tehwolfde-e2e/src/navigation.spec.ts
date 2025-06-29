import { test, expect } from '@playwright/test';

test.describe('Application Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to all main routes', async ({ page }) => {
    // Mock GitHub API for specific user 'tehw0lf' - needs both own and forked repos
    await page.route('**/api.github.com/users/tehw0lf/repos**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            name: 'mock-repo-1',
            description: 'A mock repository for testing',
            html_url: 'https://github.com/tehw0lf/mock-repo-1',
            language: 'TypeScript',
            stargazers_count: 15,
            forks_count: 3,
            fork: false
          },
          {
            name: 'mock-repo-2',
            description: 'A forked repository',
            html_url: 'https://github.com/tehw0lf/mock-repo-2',
            language: 'JavaScript',
            stargazers_count: 8,
            forks_count: 1,
            fork: true
          }
        ])
      });
    });

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
    const nav = page.locator('tehw0lf-nav');
    await expect(nav).toBeVisible();

    // Test specific navigation links in main navigation
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    const homeLink = mainNav.locator('a[routerLink="/home"]');
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*\/home/);
    }
  });

  test('should handle mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check for mobile navigation component
    const mobileNav = page.locator('tehw0lf-mobile');
    await expect(mobileNav).toBeVisible();
    
    // Look for menu button - specifically the open menu button
    const openMenuButton = page.getByRole('button', { name: 'Open navigation menu' });
    if (await openMenuButton.count() > 0) {
      await openMenuButton.click();
      
      // Check if mobile sidenav opens
      const sidenav = page.locator('mat-sidenav');
      await expect(sidenav).toBeVisible();
    }
  });

  test('should handle theme switching', async ({ page }) => {
    // Look for theme toggle buttons in main navigation
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    const lightButton = mainNav.locator('button#light');
    const darkButton = mainNav.locator('button#dark');
    
    // One of them should be visible - use count to avoid strict mode
    if (await lightButton.count() > 0 && await lightButton.isVisible()) {
      await lightButton.click();
      await page.waitForTimeout(500);
      // After clicking light, dark button should be visible
      await expect(darkButton).toBeVisible();
    } else if (await darkButton.count() > 0 && await darkButton.isVisible()) {
      await darkButton.click();
      await page.waitForTimeout(500);
      // After clicking dark, light button should be visible
      await expect(lightButton).toBeVisible();
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
    // Mock GitHub API for specific user 'tehw0lf' - needs both own and forked repos
    await page.route('**/api.github.com/users/tehw0lf/repos**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            name: 'mock-repo-1',
            description: 'A mock repository for testing',
            html_url: 'https://github.com/tehw0lf/mock-repo-1',
            language: 'TypeScript',
            stargazers_count: 15,
            forks_count: 3,
            fork: false
          },
          {
            name: 'mock-repo-2',
            description: 'A forked repository',
            html_url: 'https://github.com/tehw0lf/mock-repo-2',
            language: 'JavaScript',
            stargazers_count: 8,
            forks_count: 1,
            fork: true
          }
        ])
      });
    });

    // Test that deep links work properly
    const routes = [
      { path: '/portfolio', component: 'git-portfolio' },
      { path: '/wordlist-generator', component: 'wordlist-generator' },
      { path: '/contact-form', component: 'contact-form' }
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(new RegExp(`.*${route.path}`));
      // Wait for component to be attached and give more time for loading
      await expect(page.locator(route.component)).toBeAttached();
      await expect(page.locator(route.component)).toBeVisible({ timeout: 10000 });
    }
  });
});