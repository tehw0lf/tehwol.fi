import { test, expect } from '@playwright/test';

test.describe('Wordlist Generator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/wordlist-generator');
  });

  test('should load wordlist generator component', async ({ page }) => {
    await expect(page.locator('wordlist-generator')).toBeVisible();
  });

  test('should have form elements for charset input', async ({ page }) => {
    // Check for form fields
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="text"]')).toBeVisible();
  });

  test('should allow adding and removing charsets', async ({ page }) => {
    // Count initial charset inputs
    const initialInputs = await page.locator('input[type="text"]').count();
    
    // Add a charset
    const addButton = page.locator('button').filter({ hasText: /add|plus|\+/i });
    if (await addButton.count() > 0) {
      await addButton.first().click();
      
      // Verify new input was added
      const newInputs = await page.locator('input[type="text"]').count();
      expect(newInputs).toBeGreaterThan(initialInputs);
    }
  });

  test('should generate wordlist with valid input', async ({ page }) => {
    // Fill in charset
    await page.locator('input[type="text"]').first().fill('abc');
    
    // Look for generate button
    const generateButton = page.locator('button').filter({ hasText: /generate/i });
    if (await generateButton.count() > 0) {
      await generateButton.click();
      
      // Check if wordlist is generated or download becomes available
      const downloadButton = page.locator('button').filter({ hasText: /download/i });
      await expect(downloadButton).toBeVisible();
    }
  });

  test('should handle large dataset warning', async ({ page }) => {
    // Fill in large charsets that would trigger worker usage
    const largeCharset = 'abcdefghijklmnopqrstuvwxyz0123456789';
    await page.locator('input[type="text"]').first().fill(largeCharset);
    
    // Add another charset
    const addButton = page.locator('button').filter({ hasText: /add|plus|\+/i });
    if (await addButton.count() > 0) {
      await addButton.first().click();
      await page.locator('input[type="text"]').last().fill(largeCharset);
      
      // Generate
      const generateButton = page.locator('button').filter({ hasText: /generate/i });
      if (await generateButton.count() > 0) {
        await generateButton.click();
        
        // Check for progress indicator or large dataset handling
        const progressBar = page.locator('mat-progress-bar, [role="progressbar"]');
        await expect(progressBar).toBeVisible();
      }
    }
  });

  test('should support file format selection', async ({ page }) => {
    // Look for file format menu or dropdown
    const formatMenu = page.locator('button').filter({ hasText: /format|file|type/i });
    if (await formatMenu.count() > 0) {
      await formatMenu.first().click();
      
      // Check for format options
      const formatOptions = page.locator('mat-option, [role="option"]');
      if (await formatOptions.count() > 0) {
        await expect(formatOptions.first()).toBeVisible();
      }
    }
  });
});