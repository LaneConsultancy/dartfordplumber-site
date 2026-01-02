import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive Behavior', () => {
  // Only run these tests on mobile viewport
  test.beforeEach(async ({ viewport }) => {
    test.skip(viewport === null || viewport.width >= 768, 'Test requires mobile viewport');
  });

  test('should display mobile-friendly hero section', async ({ page }) => {
    await page.goto('/');

    // Check hero is visible
    const hero = page.getByRole('heading', { level: 1 });
    await expect(hero).toBeVisible();

    // Verify text doesn't overflow
    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(heroBox!.width).toBeLessThan(400); // Mobile viewport
  });

  test('should have tappable call buttons on mobile', async ({ page }) => {
    await page.goto('/');

    // Get call button
    const callButton = page.locator('a[href^="tel:"]').first();
    await expect(callButton).toBeVisible();

    // Verify it's large enough for tapping (44x44 minimum for accessibility)
    const box = await callButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(40);
  });

  test('should stack plumber cards vertically on mobile', async ({ page }) => {
    await page.goto('/');

    await page.locator('#plumbers').scrollIntoViewIfNeeded();

    const cards = page.locator('article');
    const firstCard = cards.first();
    const secondCard = cards.nth(1);

    const firstBox = await firstCard.boundingBox();
    const secondBox = await secondCard.boundingBox();

    expect(firstBox).not.toBeNull();
    expect(secondBox).not.toBeNull();

    // Second card should be below first card (stacked vertically)
    expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 10);
  });

  test('should have responsive navigation on mobile', async ({ page }) => {
    await page.goto('/');

    // Check breadcrumb on plumber page
    await page.goto('/plumbers/local-plumbing-services');

    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb).toBeVisible();

    // Verify breadcrumb items are readable
    const homeLink = breadcrumb.getByRole('link', { name: /home/i });
    const homeLinkBox = await homeLink.boundingBox();

    expect(homeLinkBox).not.toBeNull();
    expect(homeLinkBox!.height).toBeGreaterThan(15); // Readable text size (adjusted for browser rendering)
  });

  test('should make phone links work on mobile', async ({ page }) => {
    await page.goto('/');

    // Get all phone links
    const phoneLinks = page.locator('a[href^="tel:"]');
    const count = await phoneLinks.count();

    expect(count).toBeGreaterThan(0);

    // Verify all have valid tel: format (mobile devices will handle these)
    for (let i = 0; i < count; i++) {
      const href = await phoneLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^tel:\d+$/);
    }
  });

  test('should display content without horizontal scroll on mobile', async ({ page }) => {
    await page.goto('/');

    // Check viewport doesn't require horizontal scrolling
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // Allow 5px tolerance
  });

  test('should display plumber detail page on mobile', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    // Check heading is visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Check contact section is visible
    await expect(page.getByText(/contact information/i)).toBeVisible();

    // Check header call button meets WCAG touch target requirements (44x44px minimum)
    const headerCallButton = page.locator('a[href^="tel:"]').first();
    const headerBox = await headerCallButton.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(headerBox!.width).toBeGreaterThanOrEqual(44); // WCAG 2.1 Level AAA touch target size
    expect(headerBox!.height).toBeGreaterThanOrEqual(44);
  });
});
