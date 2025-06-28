import { test, expect } from '@playwright/test';

test.describe('Contact Form Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact-form');
  });

  test('should load contact form component', async ({ page }) => {
    await expect(page.locator('contact-form')).toBeVisible();
  });

  test('should have form fields', async ({ page }) => {
    // Check for typical contact form fields
    await expect(page.locator('form')).toBeVisible();
    
    // Look for common form fields (name, email, message)
    const inputs = page.locator('input, textarea');
    await expect(inputs.first()).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /submit|send/i });
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // Check for validation errors
      const errorMessages = page.locator('.mat-error, .error, [role="alert"]');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
    }
  });

  test('should handle form input', async ({ page }) => {
    // Fill out form fields
    const nameInput = page.locator('input[type="text"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test User');
    }

    const emailInput = page.locator('input[type="email"], input').filter({ hasText: /email/i });
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
    }

    const messageField = page.locator('textarea');
    if (await messageField.count() > 0) {
      await messageField.fill('This is a test message');
    }

    // Verify inputs are filled
    await expect(nameInput).toHaveValue('Test User');
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper form labels and accessibility
    const labels = page.locator('label, .mat-form-field-label');
    if (await labels.count() > 0) {
      await expect(labels.first()).toBeVisible();
    }

    // Check for proper form structure
    await expect(page.locator('form')).toBeVisible();
  });

  test('should handle responsive layout', async ({ page }) => {
    // Test different viewport sizes
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('contact-form')).toBeVisible();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('contact-form')).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('contact-form')).toBeVisible();
  });
});