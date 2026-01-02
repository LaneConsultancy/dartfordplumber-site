import { test, expect } from '@playwright/test';

const plumberSlugs = [
  'local-plumbing-services',
  'supreme-plumbers',
  'provide-plumbing-heating',
  'k-j-heating',
  'the-plumber',
  'gaff-plumbing-and-heating',
  'dartford-plumbing-mechanical-service',
  'horizon-plumbing-heating-bathrooms',
  'jaguar-plumbing-and-drainage',
  'allen-co-plumbing-and-heating-services-ltd',
];

test.describe('Individual Plumber Pages', () => {
  test('should load all 10 plumber detail pages', async ({ page }) => {
    for (const slug of plumberSlugs) {
      await page.goto(`/plumbers/${slug}`);

      // Verify page loads with plumber name heading
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Verify rating is displayed in subheadline
      await expect(page.getByText(/★ rated plumber/i)).toBeVisible();
    }
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    // Check breadcrumb exists
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb).toBeVisible();

    // Check home link
    const homeLink = breadcrumb.getByRole('link', { name: /home/i });
    await expect(homeLink).toBeVisible();
  });

  test('should display contact information', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    // Check contact information heading
    await expect(page.getByRole('heading', { name: /contact information/i })).toBeVisible();

    // Check phone number link exists
    const phoneLink = page.locator('a[href^="tel:"]');
    await expect(phoneLink.first()).toBeVisible();
  });

  test('should display services/categories', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    // Check services heading (h2 with exact text)
    await expect(page.getByRole('heading', { name: 'Services', exact: true })).toBeVisible();

    // Check at least one category badge is visible (new design uses service-card classes)
    const categories = page.locator('[class*="services-card__badge"]');
    await expect(categories.first()).toBeVisible();
  });

  test('should have working call CTAs', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    // Get all call links
    const callLinks = page.locator('a[href^="tel:"]');
    const count = await callLinks.count();

    expect(count).toBeGreaterThan(0);

    // Verify each has valid tel: format
    for (let i = 0; i < count; i++) {
      const href = await callLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^tel:\d+$/);
    }
  });

  test('should have website link when available', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    // Check for website link
    const websiteLink = page.locator('a[target="_blank"]').filter({ hasText: /website|visit/i });

    if (await websiteLink.count() > 0) {
      await expect(websiteLink.first()).toBeVisible();

      // Verify it has noopener noreferrer for security
      const rel = await websiteLink.first().getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  test('should have back to directory link', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    const backLink = page.getByRole('link', { name: /back to.*directory/i });
    await expect(backLink).toBeVisible();

    // Click and verify it goes to homepage plumbers section
    await backLink.click();
    await expect(page).toHaveURL('/#plumbers');
  });

  test('should include schema.org structured data', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    // Check for JSON-LD script tag
    const schemaScript = page.locator('script[type="application/ld+json"]');
    await expect(schemaScript).toHaveCount(1);

    // Verify it contains plumber/business data
    const schemaContent = await schemaScript.textContent();
    expect(schemaContent).toContain('"@type"');
    expect(schemaContent).toMatch(/plumber|localbusiness/i);
  });
});
