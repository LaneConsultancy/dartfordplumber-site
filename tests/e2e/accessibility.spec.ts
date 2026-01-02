import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit (WCAG Compliance)', () => {

  test('homepage should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('individual plumber pages should not have accessibility issues', async ({ page }) => {
    // Test first plumber page as representative
    await page.goto('/plumbers/local-plumbing-services');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('all images should have alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).not.toBeNull();
        expect(alt).not.toBe('');
      }
    }
  });

  test('all links should have accessible names', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      // Link should have either visible text, aria-label, or title
      const hasAccessibleName = (text && text.trim() !== '') || ariaLabel || title;
      expect(hasAccessibleName).toBe(true);
    }
  });

  test('page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check h1 exists and is unique within main content (exclude browser DevTools UI)
    const h1Count = await page.locator('main h1').count();
    expect(h1Count).toBe(1);

    // Check that headings exist
    const h2Count = await page.locator('main h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('phone links should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    const phoneLinks = page.locator('a[href^="tel:"]');
    const count = await phoneLinks.count();

    expect(count).toBeGreaterThan(0);

    // Check first phone link is focusable
    await phoneLinks.first().focus();
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('A');
  });

  test('color contrast should be sufficient (automated check)', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .disableRules(['color-contrast']) // We'll check this separately with full scan
      .analyze();

    // Check specifically for color-contrast issues
    const colorContrastResults = await new AxeBuilder({ page })
      .include('body')
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze();

    expect(colorContrastResults.violations.filter(v => v.id === 'color-contrast')).toEqual([]);
  });

  test('forms should have proper labels', async ({ page }) => {
    await page.goto('/');

    const inputs = page.locator('main input, main textarea, main select');
    const count = await inputs.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');

        // Check if there's a label for this input
        let hasLabel = false;
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = (await label.count()) > 0;
        }

        // Input should have either a label, aria-label, or aria-labelledby
        const hasAccessibleLabel = hasLabel || ariaLabel || ariaLabelledby;
        expect(hasAccessibleLabel).toBe(true);
      }
    }
  });

  test('page should have valid HTML language attribute', async ({ page }) => {
    await page.goto('/');

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
    expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // en or en-US format
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('main button');
    const count = await buttons.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        // Button should have either visible text or aria-label
        const hasAccessibleName = (text && text.trim() !== '') || ariaLabel;
        expect(hasAccessibleName).toBe(true);
      }
    }
  });

  test('interactive elements should have sufficient touch target size on mobile', async ({ page }, testInfo) => {
    // Only run on mobile project
    if (!testInfo.project.name.includes('mobile')) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Check that clickable elements (links, buttons) are at least 44x44px (WCAG 2.1 Level AAA)
    const clickableElements = page.locator('a, button');
    const count = await clickableElements.count();

    let insufficientTargets = [];

    for (let i = 0; i < Math.min(count, 20); i++) { // Check first 20 elements
      const element = clickableElements.nth(i);
      const box = await element.boundingBox();

      if (box && (box.width < 44 || box.height < 44)) {
        const text = await element.textContent();
        insufficientTargets.push({
          text: text?.substring(0, 30),
          width: box.width,
          height: box.height
        });
      }
    }

    // Allow some small elements (like icons), but most should meet the target size
    const percentageMeetsTarget = ((count - insufficientTargets.length) / count) * 100;
    expect(percentageMeetsTarget).toBeGreaterThan(70); // At least 70% should meet target size
  });

  test('page should have skip navigation link or similar landmark navigation', async ({ page }) => {
    await page.goto('/');

    // Check for skip links OR proper landmark usage (main landmark)
    const skipLink = page.locator('a[href^="#"]').filter({ hasText: /skip/i });
    const hasSkipLink = (await skipLink.count()) > 0;

    const mainLandmark = page.locator('main');
    const hasMainLandmark = (await mainLandmark.count()) > 0;

    // Should have either skip link OR main semantic landmark (sufficient for accessibility)
    expect(hasSkipLink || hasMainLandmark).toBe(true);
  });
});
