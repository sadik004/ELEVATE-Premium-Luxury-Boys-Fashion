import { test, expect } from '@playwright/test';

/**
 * ELEVATE Authentication E2E Tests (OTP Flow)
 * 
 * To run these tests with the fixed OTP:
 * Set NEXT_PUBLIC_APP_ENV=test in your environment.
 */

test.describe('OTP Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';
  const fixedOtp = '123456';

  test('should complete the registration flow with OTP', async ({ page }) => {
    // 1. Fill Registration Form
    await page.goto('/register');
    await page.fill('input[name="name"]', testName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // 2. Trigger OTP sending
    // Intercept the API call to verify it's called
    const otpResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/send-otp') && response.status() === 200
    );

    await page.click('button[type="submit"]');
    
    // Wait for API success
    await otpResponsePromise;

    // 3. Verify Redirection to /verify-email
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.locator('text="Verify Your Email"')).toBeVisible();

    // 4. Enter Incorrect OTP (Edge Case)
    await page.fill('input[name="otp"]', '000000');
    await page.click('button:has-text("Verify")');
    await expect(page.locator('text="Invalid verification code"')).toBeVisible();

    // 5. Enter Correct OTP
    await page.fill('input[name="otp"]', fixedOtp);
    
    const registerResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/register') && response.status() === 201
    );

    await page.click('button:has-text("Verify")');
    await registerResponsePromise;

    // 6. Verify Successful Registration & Redirect to Home/Login
    // Depending on your app logic, it might auto-login or redirect to /login
    await expect(page.locator('text="User registered successfully"')).toBeVisible();
  });

  test('should handle forgot password flow with OTP', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('input[type="email"]', 'existing-user@example.com');
    
    const otpResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/send-otp') && response.status() === 200
    );

    await page.click('button[type="submit"]');
    await otpResponsePromise;

    // Verify redirection to reset-password
    await expect(page).toHaveURL(/\/reset-password/);
    
    // Fill reset form
    await page.fill('input[name="otp"]', fixedOtp);
    await page.fill('input[name="newPassword"]', 'NewSecurePassword123!');
    
    const resetResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/reset-password') && response.status() === 200
    );

    await page.click('button:has-text("Reset Password")');
    await resetResponsePromise;

    await expect(page.locator('text="Password reset successfully"')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should respect rate limits for OTP sending', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Spammer');
    await page.fill('input[name="email"]', 'spam@example.com');
    await page.fill('input[name="password"]', 'Password123!');

    // Trigger multiple times quickly
    // Note: Rate limiting is by IP + Email usually.
    // In e2e tests, we might want to mock the 429 response if we don't want to rely on real Redis.
    
    await page.route('**/api/auth/send-otp', async route => {
      // Mocking a 429 for this specific test case to ensure UI handles it
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.click('button[type="submit"]');
    await expect(page.locator('text="Too many requests"')).toBeVisible();
  });
});
