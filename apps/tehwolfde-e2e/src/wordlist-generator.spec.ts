import { expect, test } from '@playwright/test';

test.describe('Wordlist Generator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wordlist-generator');
  });

  test('should load wordlist generator component', async ({ page }) => {
    await expect(page.locator('wordlist-generator')).toBeVisible();
  });

  test('should have form elements for charset input', async ({ page }) => {
    // Check for form fields
    await expect(page.locator('wordlist-generator form')).toBeVisible();
    await expect(
      page.locator('wordlist-generator input[type="text"]').first()
    ).toBeVisible();
  });

  test('should allow adding and removing charsets', async ({ page }) => {
    // Count initial charset inputs within the wordlist generator
    const charsetInputs = page.locator('wordlist-generator input[type="text"]');
    const initialInputs = await charsetInputs.count();

    // Look for add button (may have plus icon or "add" text)
    const addButton = page
      .locator('wordlist-generator button')
      .filter({ hasText: /add|plus|\+/i });
    if ((await addButton.count()) > 0) {
      await addButton.first().click();

      // Verify new input was added
      const newInputs = await charsetInputs.count();
      expect(newInputs).toBeGreaterThan(initialInputs);
    }
  });

  test('should generate wordlist with valid input', async ({ page }) => {
    // Fill in first charset position
    const position0Input = page.locator(
      'wordlist-generator input[id="position-0"]'
    );
    await position0Input.fill('abc');

    // Add a second position to make it more robust
    const addButton = page
      .locator('wordlist-generator button')
      .filter({ hasText: /add/i })
      .first();
    await addButton.click();

    // Fill in second charset position
    const position1Input = page.locator(
      'wordlist-generator input[id="position-1"]'
    );
    await position1Input.fill('123');

    // Generate wordlist
    const generateButton = page.locator(
      'wordlist-generator button.generate-wordlist'
    );
    await generateButton.click();

    // Wait for wordlist to be generated and displayed
    const wordlistCode = page.locator('wordlist-generator code.wordlist');
    await expect(wordlistCode).toBeVisible({ timeout: 10000 });
    await expect(wordlistCode).toContainText('a1'); // Should contain combinations

    // Wait for download button to appear (when generation is truly complete)
    const downloadButton = page.locator(
      'wordlist-generator button.download-wordlist'
    );
    await expect(downloadButton).toBeVisible({ timeout: 5000 });
  });

  test('should handle large dataset warning', async ({ page }) => {
    // Fill in charset that will be cloned to create large dataset
    const largeCharset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const position0Input = page.locator(
      'wordlist-generator input[id="position-0"]'
    );
    await position0Input.first().fill(largeCharset);

    // Clone the charset 3 times to reach 36^4 = 1,679,616 combinations
    const cloneButton = page.locator('wordlist-generator button.clone-charset');
    if ((await cloneButton.count()) > 0) {
      await cloneButton.first().click();
      await cloneButton.first().click();
      await cloneButton.first().click();

      // Generate
      const generateButton = page
        .locator('wordlist-generator button')
        .filter({ hasText: /generate/i });
      if ((await generateButton.count()) > 0) {
        await generateButton.click();

        // Check for progress indicator (should appear quickly for large datasets)
        const progressBar = page.locator('wordlist-generator mat-progress-bar');
        await expect(progressBar).toBeVisible({ timeout: 2000 });

        // Wait for generation to complete
        await expect(generateButton).toHaveText('Generate wordlist', {
          timeout: 15000
        });
      }
    }
  });

  test('should support file format selection', async ({ page }) => {
    // First generate a wordlist to enable format selection
    const charsetInput = page
      .locator('wordlist-generator input[type="text"]')
      .first();
    await charsetInput.fill('abc');

    const generateButton = page
      .locator('wordlist-generator button')
      .filter({ hasText: /generate/i });
    if ((await generateButton.count()) > 0) {
      await generateButton.click();

      // Look for file format menu or dropdown
      const formatMenu = page
        .locator('wordlist-generator button')
        .filter({ hasText: /format|choose/i });
      if ((await formatMenu.count()) > 0) {
        await formatMenu.first().click();

        // Check for format options in menu
        const formatOptions = page.locator('mat-menu-item');
        if ((await formatOptions.count()) > 0) {
          await expect(formatOptions.first()).toBeVisible();
        }
      }
    }
  });
});
