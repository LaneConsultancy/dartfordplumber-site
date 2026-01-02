import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display hero section with correct content', async ({ page }) => {
    await page.goto('/');

    // Check hero headline is visible
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Find Trusted Dartford Plumbers');

    // Check subheadline is visible
    await expect(page.getByText('10 local plumbers ready to help')).toBeVisible();
  });

  test('should have working primary CTA', async ({ page }) => {
    await page.goto('/');

    // Find and click primary CTA
    const primaryCTA = page.getByRole('link', { name: /view local plumbers/i });
    await expect(primaryCTA).toBeVisible();
    await primaryCTA.click();

    // Should navigate to plumbers section
    await expect(page).toHaveURL('/#plumbers');
  });

  test('should have working emergency call CTA', async ({ page }) => {
    await page.goto('/');

    // Check emergency call link exists and has correct tel: href
    const emergencyLink = page.locator('a[href^="tel:"]').first();
    await expect(emergencyLink).toBeVisible();

    const href = await emergencyLink.getAttribute('href');
    expect(href).toMatch(/^tel:\d+$/);
  });

  test('should display all 10 plumber cards', async ({ page }) => {
    await page.goto('/');

    // Navigate to plumbers section
    await page.locator('#plumbers').scrollIntoViewIfNeeded();

    // Check all plumber cards are visible
    const plumberCards = page.locator('article').filter({ has: page.locator('h3') });
    await expect(plumberCards).toHaveCount(10);
  });

  test('should have clickable plumber cards with correct links', async ({ page }) => {
    await page.goto('/');

    // Get first plumber card
    const firstCard = page.locator('article').first();
    const viewDetailsLink = firstCard.getByRole('link', { name: /view details/i });

    await expect(viewDetailsLink).toBeVisible();

    // Click and verify navigation
    await viewDetailsLink.click();
    await expect(page).toHaveURL(/\/plumbers\/.+/);
  });

  test('should have working call buttons on plumber cards', async ({ page }) => {
    await page.goto('/');

    // Get call button from first card
    const firstCard = page.locator('article').first();
    const callButton = firstCard.locator('a[href^="tel:"]');

    await expect(callButton).toBeVisible();

    const href = await callButton.getAttribute('href');
    expect(href).toMatch(/^tel:\d+$/);
  });

  test('should display all main sections', async ({ page }) => {
    await page.goto('/');

    // Check intro section heading
    await expect(page.getByRole('heading', { name: /when you need a plumber in dartford/i })).toBeVisible();

    // Check services section - new design uses "Emergency Repairs" (not "Emergency Plumbing Repairs")
    await expect(page.getByRole('heading', { name: /emergency repairs/i })).toBeVisible();

    // Check trust/why use section - new design doesn't have "Covering Dartford" heading
    await expect(page.getByRole('heading', { name: /why use this directory/i })).toBeVisible();
  });
});
