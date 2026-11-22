import { expect, test } from './fixtures';

test.describe('Octicon fetches and navigation', () => {
  test('should log no console error when a navigation cancels pending icon fetches', async ({
    page
  }) => {
    await page.route('**/api.github.com/users/tehw0lf/repos**', (route) =>
      route.fulfill({
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
            topics: []
          }
        ])
      })
    );

    // Icon requests never get an answer, so they are pending when the page
    // navigates away. The console error fixture fails the test if the
    // directive logs the cancelled fetches.
    const iconRequest = page.waitForRequest('**/assets/icons/octicons/**');
    await page.route('**/assets/icons/octicons/**', () => {
      /* never answers */
    });

    await page.goto('/portfolio');
    await iconRequest;
    await page.goto('/home');

    await expect(page).toHaveURL(/\/home$/);
  });
});
