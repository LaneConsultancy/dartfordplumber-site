# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DartfordPlumber.com is a local business directory site built with Astro, optimized for "dartford plumber" and related keywords. The site lists 10 top-rated plumbers in Dartford with the primary conversion goal being phone calls to these local businesses.

**Tech Stack:**
- Astro 5 (zero-JS static site generator)
- Tailwind CSS 4 (utility-first styling)
- Playwright (E2E testing with accessibility checks)
- Sharp (image optimization)

**Site URL:** https://dartfordplumber.com

## Commands

### Development
```bash
npm run dev          # Start dev server (auto-finds free port, typically localhost:4321)
npm run build        # Build production site to ./dist/
npm run preview      # Preview production build locally
```

### Testing
```bash
npx playwright test                              # Run all E2E tests (166 tests)
npx playwright test <file>                       # Run specific test file
npx playwright test --project=chromium           # Run desktop tests only
npx playwright test --project=mobile             # Run mobile tests only
npx playwright test --headed                     # Run with visible browser
npx playwright test --debug                      # Run in debug mode
npx playwright show-report                       # View test report
```

**Test Projects:**
- `chromium`: Desktop Chrome tests
- `mobile`: iPhone 12 mobile tests

**Test suites** (in `tests/e2e/`):
- `accessibility.spec.ts` - WCAG 2.0/2.1 Level AA compliance (12 tests)
- `homepage.spec.ts` - Hero, directory, CTAs
- `plumber-pages.spec.ts` - Individual pages, schema, breadcrumbs
- `mobile.spec.ts` - Mobile responsiveness, touch targets
- `deployment-readiness.spec.ts` - Production build verification
- `todo-verification.spec.ts` - Task verification
- `todo-completion.spec.ts` - TODO.md checkbox validation

## Architecture

### Data-Driven Static Site

The site is **fully static** with content driven by JSON data files in `src/data/`:

- **`top-plumbers.json`** - Master data for all 10 plumbers (name, address, phone, website, rating, categories)
- **`homepage-copy.json`** - All homepage copy (hero, intro, CTAs, meta tags)
- **`existing-site-info.json`** - Reference data from original site

### Page Generation

**Dynamic Routes:**
The site uses Astro's `getStaticPaths()` to generate 10 individual plumber pages from a single template:

```astro
// src/pages/plumbers/[slug].astro
export async function getStaticPaths() {
  const plumbers = plumbersData.map(plumber => ({
    ...plumber,
    slug: plumber.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }));

  return plumbers.map((plumber) => ({
    params: { slug: plumber.slug },
    props: { plumber },
  }));
}
```

**Slug Generation:**
Business names are converted to URL-friendly slugs:
- "Local Plumbing Services" → `local-plumbing-services`
- "K J Heating" → `k-j-heating`

**Output Structure:**
```
dist/
├── index.html                           # Homepage
├── plumbers/
│   ├── local-plumbing-services/index.html
│   ├── supreme-plumbers/index.html
│   └── ... (8 more)
├── sitemap-index.xml
└── robots.txt
```

### Component Hierarchy

**BaseLayout.astro** - Root layout wrapper
- Sets up HTML structure with `lang="en-GB"`
- Handles all SEO meta tags (title, description, Open Graph, Twitter Card)
- Canonical URL management
- Wraps content in semantic `<main>` element for accessibility

**Page Templates:**
- `src/pages/index.astro` - Homepage (uses Hero + PlumberCard components)
- `src/pages/plumbers/[slug].astro` - Individual plumber pages with schema.org JSON-LD

**Reusable Components:**
- `Hero.astro` - Hero section with CTA buttons
- `PlumberCard.astro` - Directory card for plumber listings

### SEO Implementation

**Schema.org Structured Data:**
Each plumber page includes JSON-LD markup:
```javascript
{
  "@context": "https://schema.org",
  "@type": "Plumber",
  "name": "...",
  "address": { "@type": "PostalAddress", ... },
  "telephone": "...",
  "aggregateRating": { "@type": "AggregateRating", ... }
}
```

**Sitemap:**
Auto-generated via `@astrojs/sitemap` integration (configured in `astro.config.mjs` with `site: 'https://dartfordplumber.com'`)

**Meta Tags:**
All pages use BaseLayout which requires `title` and `description` props and optionally accepts `canonical`.

### Accessibility (WCAG 2.0/2.1 Level AA)

The site is fully compliant with automated accessibility testing via axe-core:
- Color contrast: 21:1 ratio (exceeds 4.5:1 requirement)
- Semantic HTML: `<main>` landmark for screen readers
- All images have alt text
- Phone links are keyboard accessible
- Touch targets ≥44×44px on mobile
- Proper heading hierarchy (single h1, multiple h2s)

**Testing:** Run `npx playwright test tests/e2e/accessibility.spec.ts` to verify compliance.

### Styling System

**Tailwind CSS 4:**
- Configured via Vite plugin (`@tailwindcss/vite`)
- Global styles in `src/styles/global.css`
- Utility-first approach throughout components

**Common Patterns:**
- Mobile-first responsive design (`md:`, `lg:` prefixes)
- Click-to-call links: `<a href="tel:07392234913">Call Now</a>`
- Card grids: `grid md:grid-cols-2 lg:grid-cols-3 gap-6`

## Key Patterns

### Adding a New Plumber

1. Add entry to `src/data/top-plumbers.json`:
```json
{
  "name": "Business Name",
  "address": "Full address",
  "phone": "Phone number",
  "website": "https://...",
  "rating": 5,
  "categories": ["Plumber", "Gas engineer"]
}
```

2. Rebuild site: `npm run build`
3. New page auto-generates at `/plumbers/{slug}/`

### Modifying Homepage Copy

Edit `src/data/homepage-copy.json` - all homepage text is sourced from this file:
- `meta.title` / `meta.description` - SEO meta tags
- `hero.headline` / `hero.subheadline` / `hero.cta` - Hero section
- `intro.heading` / `intro.body` - Intro section
- `why.heading` / `why.reasons` - Benefits section

### Testing Changes

1. **Development:** Changes auto-reload via `npm run dev`
2. **Production build:** Run `npm run build` to verify production output
3. **E2E tests:** Run `npx playwright test` to verify all functionality
4. **Accessibility:** Run `npx playwright test tests/e2e/accessibility.spec.ts`

### Deployment

Site is configured for Vercel deployment:
1. Production build: `npm run build`
2. Output directory: `dist/`
3. See `DEPLOY.md` for full deployment instructions

## Important Constraints

- **Zero JavaScript by default:** Astro ships no JS unless explicitly added
- **Static-only:** No server-side rendering, all pages pre-built
- **11 total pages:** Homepage + 10 plumber pages (fixed, data-driven)
- **SEO-first:** All changes must maintain meta tags, schema.org, and semantic HTML
- **Accessibility:** Must maintain WCAG 2.0/2.1 Level AA compliance
- **Mobile-responsive:** All layouts must work on mobile (iPhone 12 tested)

## Testing Requirements

All changes must pass the full test suite (166 tests):
- Homepage functionality (hero, directory, CTAs)
- Individual plumber pages (content, schema, breadcrumbs)
- Mobile responsiveness
- Deployment readiness (production build verification)
- Accessibility compliance (WCAG 2.0/2.1 AA)
- TODO task verification

Run `npx playwright test` before committing changes.
