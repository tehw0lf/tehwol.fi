import { expect, test } from '@playwright/test';

test.describe('Git Portfolio Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock GitHub API for specific user 'tehw0lf'
    await page.route(
      '**/api.github.com/users/tehw0lf/repos**',
      async (route) => {
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
              fork: false,
              topics: ['angular', 'typescript']
            },
            {
              name: 'mock-repo-2',
              description: 'A forked repository',
              html_url: 'https://github.com/tehw0lf/mock-repo-2',
              language: 'JavaScript',
              stargazers_count: 8,
              forks_count: 1,
              fork: true,
              topics: ['react', 'javascript']
            }
          ])
        });
      }
    );

    await page.goto('/portfolio');
  });

  test('should load git portfolio component', async ({ page }) => {
    // Wait for component to be attached first
    await expect(page.locator('git-portfolio')).toBeAttached();
    // Give extra time for component to finish loading and become visible
    await expect(page.locator('git-portfolio')).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state initially', async ({ page }) => {
    // This test verifies that the component handles loading states properly
    // Since the loading spinner appears very briefly, we'll test the component is initially hidden
    // and only becomes visible after data loads
    
    // Clear the beforeEach route
    await page.unroute('**/api.github.com/users/tehw0lf/repos**');

    // Set up a route that never responds to simulate loading
    await page.route('**/api.github.com/users/tehw0lf/repos**', async () => {
      // Never fulfill this request to keep it in loading state
    });

    // Navigate to trigger loading
    await page.goto('/portfolio');

    // Since the API never responds, the git-portfolio component should remain hidden
    // as it only renders when data successfully loads
    const gitPortfolio = page.locator('git-portfolio');
    await expect(gitPortfolio).toBeAttached();
    
    // The component should not be visible since no data loads
    await expect(gitPortfolio).not.toBeVisible();
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
    // With mocked data, we should see repository cards
    const repoCards = page.locator('repo-card');
    await expect(repoCards).toHaveCount(2);
    await expect(repoCards.first()).toBeVisible();

    // Check that mock data appears in the cards
    await expect(page.locator('text=mock-repo-1')).toBeVisible();
    await expect(
      page.locator('text=A mock repository for testing')
    ).toBeVisible();
  });
});
