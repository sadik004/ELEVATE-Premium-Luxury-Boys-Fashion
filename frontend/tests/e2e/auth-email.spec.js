import { test, expect } from '@playwright/test';

// To run this test reliably in CI without spamming real emails,
// we utilize Mailosaur (or Mailtrap) to intercept the actual SMTP payload.
// Prerequisites: Set MAILOSAUR_API_KEY and MAILOSAUR_SERVER_ID in your environment.

test.describe('Authentication Email Delivery', () => {
  // Use a unique email per test to prevent assertion race conditions
  const randomString = new Date().getTime().toString();
  const testEmail = `test-${randomString}@${process.env.MAILOSAUR_SERVER_ID}.mailosaur.net`;

  test('should trigger magic link email, verify API 200, and assert email integrity', async ({ page }) => {
    // 1. Navigate to the login page and trigger the magic link
    await page.goto('/login');

    // Fill the email input using standard semantic selectors
    await page.fill('input[type="email"]', testEmail);

    // 2. Setup API response listener to verify a 200 OK before proceeding
    const responsePromise = page.waitForResponse(response =>
      response.url().includes('/api/auth/signin/email') && response.status() === 200
    );

    // Click the "Sign in with Email" submit button
    await page.click('button[type="submit"]');

    // Verify API returned 200 OK
    const apiResponse = await responsePromise;
    expect(apiResponse.ok()).toBeTruthy();

    // 3. Wait for the UI success message to confirm frontend state
    await expect(page.locator('text="Check your email for the magic link!"')).toBeVisible();

    // 4. Fetch the actual email payload from the intercept server
    // Note: In a real implementation you would install 'mailosaur' package
    const fetchEmailWithRetry = async (retries = 5) => {
      for (let i = 0; i < retries; i++) {
        const response = await fetch(`https://mailosaur.com/api/messages/await?server=${process.env.MAILOSAUR_SERVER_ID}`, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(process.env.MAILOSAUR_API_KEY + ':').toString('base64'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sentTo: testEmail
          })
        });

        if (response.ok) {
          return await response.json();
        }

        // Wait 2 seconds before polling again to account for Upstash queue delays
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      throw new Error('Email interception timeout exceeded');
    };

    const email = await fetchEmailWithRetry();

    // Assert correct Subject Line
    expect(email.subject).toContain('Sign in to');

    // 5. Extract the Magic Link from the HTML body and Assert integrity
    const htmlBody = email.html.body;

    const magicLinkMatch = htmlBody.match(/href="([^"]+)"/);
    expect(magicLinkMatch).not.toBeNull();

    const magicLinkUrl = magicLinkMatch[1];

    // Ensure it points to our domain
    expect(magicLinkUrl).toContain(process.env.NEXTAUTH_URL || 'http://localhost:3000');

    // Ensure exact NextAuth callback parameters exist
    expect(magicLinkUrl).toContain('/api/auth/callback/email');
    expect(magicLinkUrl).toContain('token=');
    expect(magicLinkUrl).toContain('email=');
  });
});