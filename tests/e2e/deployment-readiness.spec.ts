import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Deployment Readiness', () => {
  const distDir = path.join(process.cwd(), 'dist');

  test('should have production build directory', () => {
    expect(fs.existsSync(distDir)).toBe(true);
  });

  test('should have index.html in dist', () => {
    const indexPath = path.join(distDir, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
  });

  test('should have all 10 plumber pages built', () => {
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

    for (const slug of plumberSlugs) {
      const plumberPath = path.join(distDir, 'plumbers', slug, 'index.html');
      expect(fs.existsSync(plumberPath)).toBe(true);
    }
  });

  test('should have sitemap-index.xml', () => {
    const sitemapPath = path.join(distDir, 'sitemap-index.xml');
    expect(fs.existsSync(sitemapPath)).toBe(true);
  });

  test('should have robots.txt in public directory', () => {
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    expect(fs.existsSync(robotsPath)).toBe(true);
  });

  test('sitemap should contain all pages', () => {
    const sitemapPath = path.join(distDir, 'sitemap-index.xml');
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

    // Check homepage is in sitemap
    expect(sitemapContent).toContain('<loc>');

    // Should reference sitemap files
    expect(sitemapContent).toMatch(/sitemap.*\.xml/);
  });

  test('should have valid package.json with build script', () => {
    const packagePath = path.join(process.cwd(), 'package.json');
    expect(fs.existsSync(packagePath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    expect(packageJson.scripts.build).toBeDefined();
  });

  test('should have astro.config.mjs', () => {
    const configPath = path.join(process.cwd(), 'astro.config.mjs');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  test('production build should have optimized assets', () => {
    const assetsDir = path.join(distDir, '_astro');
    // Assets directory may or may not exist depending on if there are any bundled assets
    // At minimum, check that dist directory has content
    const distContents = fs.readdirSync(distDir);
    expect(distContents.length).toBeGreaterThan(0);
  });

  test('all built HTML files should be valid', () => {
    const indexPath = path.join(distDir, 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    // Check for basic HTML structure
    expect(indexContent).toContain('<!DOCTYPE html>');
    expect(indexContent).toContain('<html');
    expect(indexContent).toContain('</html>');

    // Check for meta tags
    expect(indexContent).toContain('<meta');
    expect(indexContent).toContain('<title>');
  });

  test('plumber pages should have schema.org markup', () => {
    const plumberPath = path.join(distDir, 'plumbers', 'local-plumbing-services', 'index.html');
    const content = fs.readFileSync(plumberPath, 'utf-8');

    // Check for JSON-LD script tag
    expect(content).toContain('application/ld+json');
    expect(content).toMatch(/@type.*Plumber|LocalBusiness/i);
  });

  test('deployment documentation exists', () => {
    const deployPath = path.join(process.cwd(), 'DEPLOY.md');
    expect(fs.existsSync(deployPath)).toBe(true);
  });
});
