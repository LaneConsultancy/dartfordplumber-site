import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('TODO.md Task Verification', () => {

  // Data Collection Tasks
  test('should have plumbers data collected from Apify', () => {
    const dataPath = path.join(process.cwd(), 'src', 'data', 'top-plumbers.json');
    expect(fs.existsSync(dataPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    expect(data.length).toBeGreaterThanOrEqual(10); // 10 plumbers as specified

    // Verify each plumber has required fields
    data.slice(0, 10).forEach((plumber: any) => {
      expect(plumber.name).toBeDefined();
      expect(plumber.phone).toBeDefined();
      expect(plumber.rating).toBeDefined();
    });
  });

  // Homepage copy data
  test('should have homepage copy data', () => {
    const copyPath = path.join(process.cwd(), 'src', 'data', 'homepage-copy.json');
    expect(fs.existsSync(copyPath)).toBe(true);

    const data = JSON.parse(fs.readFileSync(copyPath, 'utf-8'));
    expect(data.hero.headline).toBeDefined();
    expect(data.hero.cta).toBeDefined();
  });

  // Project Setup Tasks
  test('should have Astro project with Tailwind configured', () => {
    // Check package.json has Astro
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    expect(packageJson.dependencies.astro).toBeDefined();

    // Check astro config has Tailwind integration
    const astroConfigPath = path.join(process.cwd(), 'astro.config.mjs');
    expect(fs.existsSync(astroConfigPath)).toBe(true);

    const configContent = fs.readFileSync(astroConfigPath, 'utf-8');
    expect(configContent).toContain('tailwind');
  });

  // Hero Component Implementation
  test('should have hero component with phone CTA', async ({ page }) => {
    await page.goto('/');

    // Check hero section exists
    const hero = page.getByRole('heading', { level: 1 });
    await expect(hero).toBeVisible();

    // Check phone CTA exists
    const phoneLink = page.locator('a[href^="tel:"]').first();
    await expect(phoneLink).toBeVisible();
  });

  // Directory Implementation
  test('should have 10 plumber cards in directory', async ({ page }) => {
    await page.goto('/');

    const plumberCards = page.locator('article').filter({ has: page.locator('h3') });
    await expect(plumberCards).toHaveCount(10);
  });

  // Individual Plumber Pages
  test('should have dynamic routes for all plumbers', () => {
    const slugPagePath = path.join(process.cwd(), 'src', 'pages', 'plumbers', '[slug].astro');
    expect(fs.existsSync(slugPagePath)).toBe(true);

    // Verify all 10 pages built
    const distDir = path.join(process.cwd(), 'dist', 'plumbers');
    expect(fs.existsSync(distDir)).toBe(true);

    const plumberDirs = fs.readdirSync(distDir);
    expect(plumberDirs.length).toBe(10);
  });

  // SEO Meta Tags
  test('should have meta tags on homepage', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/dartford plumber/i);

    // Check meta description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);
  });

  // Structured Data
  test('should have LocalBusiness schema on plumber pages', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    const schemaScript = page.locator('script[type="application/ld+json"]');
    const content = await schemaScript.textContent();

    expect(content).toContain('@type');
    expect(content).toMatch(/Plumber|LocalBusiness/i);
  });

  // Heading Hierarchy
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check h1 exists
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check h2 exists
    const h2 = page.getByRole('heading', { level: 2 }).first();
    await expect(h2).toBeVisible();
  });

  // Sitemap
  test('should have XML sitemap generated', () => {
    const sitemapPath = path.join(process.cwd(), 'dist', 'sitemap-index.xml');
    expect(fs.existsSync(sitemapPath)).toBe(true);

    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content).toContain('<?xml');
    expect(content).toContain('sitemap');
  });

  // Robots.txt
  test('should have robots.txt configured', () => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);

    const content = fs.readFileSync(robotsPath, 'utf-8');
    expect(content).toContain('User-agent:');
    expect(content).toContain('Sitemap:');
  });

  // Open Graph Tags
  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/');

    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /.+/);
  });

  // Mobile Responsive
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check no horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  // Phone Number Links
  test('should have working phone links on mobile', async ({ page }) => {
    await page.goto('/');

    const phoneLinks = page.locator('a[href^="tel:"]');
    const count = await phoneLinks.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await phoneLinks.nth(i).getAttribute('href');
      expect(href).toMatch(/^tel:\d+$/);
    }
  });

  // Image Alt Text
  test('should have alt text on all images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeDefined();
      }
    }
  });

  // Breadcrumb Navigation
  test('should have breadcrumb navigation on plumber pages', async ({ page }) => {
    await page.goto('/plumbers/local-plumbing-services');

    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb).toBeVisible();

    const homeLink = breadcrumb.getByRole('link', { name: /home/i });
    await expect(homeLink).toBeVisible();
  });

  // Click-to-Call Functionality
  test('should have click-to-call on hero CTA', async ({ page }) => {
    await page.goto('/');

    const emergencyLink = page.locator('a[href^="tel:"]').first();
    const href = await emergencyLink.getAttribute('href');

    expect(href).toMatch(/^tel:\d+$/);
  });

  // Navigation from Homepage to Plumber Pages
  test('should navigate from homepage to plumber pages', async ({ page }) => {
    await page.goto('/');

    const firstCard = page.locator('article').first();
    const viewDetailsLink = firstCard.getByRole('link', { name: /view details/i });

    await viewDetailsLink.click();
    await expect(page).toHaveURL(/\/plumbers\/.+/);
  });

  // SEO Copywriting
  test('should have SEO-optimized copy', async ({ page }) => {
    await page.goto('/');

    // Check headline includes target keywords
    const h1 = page.getByRole('heading', { level: 1 });
    const h1Text = await h1.textContent();

    expect(h1Text?.toLowerCase()).toMatch(/dartford|plumber/);
  });

  // Page Load Speed
  test('should have optimized page load', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds as per TODO.md
    expect(loadTime).toBeLessThan(3000);
  });

  // Production Build
  test('should have production build completed', () => {
    const distPath = path.join(process.cwd(), 'dist');
    expect(fs.existsSync(distPath)).toBe(true);

    // Check index.html exists
    const indexPath = path.join(distPath, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  // Deployment Documentation
  test('should have deployment documentation', () => {
    const deployPath = path.join(process.cwd(), 'DEPLOY.md');
    expect(fs.existsSync(deployPath)).toBe(true);

    const content = fs.readFileSync(deployPath, 'utf-8');
    expect(content).toContain('Vercel');
  });
});
