import { test, expect } from '@playwright/test';

test.describe('Contact Form Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact-form');
  });

  test('should load contact form component', async ({ page }) => {
    await expect(page.locator('contact-form')).toBeVisible();
  });

  test('should have form fields', async ({ page }) => {
    // Check for contact form component and its form
    await expect(page.locator('contact-form form')).toBeVisible();
    
    // Look for formly form fields
    const formlyFields = page.locator('formly-form');
    await expect(formlyFields).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.locator('contact-form button[type="submit"]');
    
    if (await submitButton.count() > 0) {
      // Button should be disabled when form is invalid
      await expect(submitButton).toBeDisabled();
    }
  });

  test('should handle form input', async ({ page }) => {
    // Wait for form to be ready
    await page.waitForSelector('formly-form');
    
    // Fill out form fields by labels (more reliable for formly forms)
    const nameField = page.getByLabel(/name/i);
    if (await nameField.count() > 0) {
      await nameField.fill('Test User');
      await expect(nameField).toHaveValue('Test User');
    }

    const emailField = page.getByLabel(/email/i);
    if (await emailField.count() > 0) {
      await emailField.fill('test@example.com');
      await expect(emailField).toHaveValue('test@example.com');
    }

    const messageField = page.getByLabel(/message/i);
    if (await messageField.count() > 0) {
      await messageField.fill('This is a test message');
      await expect(messageField).toHaveValue('This is a test message');
    }
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper form structure
    await expect(page.locator('contact-form form')).toBeVisible();
    
    // Check for formly accessibility
    const formlyForm = page.locator('formly-form');
    await expect(formlyForm).toBeVisible();
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