# Deployment Guide

## Deployment to Vercel (Recommended)

Vercel is the recommended hosting platform for this Astro site.

### Prerequisites

1. Create a Vercel account at https://vercel.com/signup
2. Install Vercel CLI: `npm i -g vercel`

### Deploy Steps

#### Option 1: Deploy via CLI

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Option 2: Deploy via GitHub

1. Push your code to a GitHub repository
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect Astro and configure build settings
5. Click "Deploy"

### Build Settings (Auto-detected)

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Environment Variables

No environment variables are required for this site.

### Custom Domain

After deployment, you can add your custom domain (dartfordplumber.com):

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add `dartfordplumber.com`
4. Update your DNS records as instructed by Vercel

## Alternative Deployment Options

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Cloudflare Pages

1. Go to https://pages.cloudflare.com/
2. Connect your GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy

## Post-Deployment Checklist

- [ ] Verify sitemap is accessible at `/sitemap-index.xml`
- [ ] Test all plumber detail pages load correctly
- [ ] Verify phone number links work on mobile
- [ ] Check Google Search Console for any crawl errors
- [ ] Submit sitemap to Google Search Console
- [ ] Test structured data with Google's Rich Results Test
- [ ] Verify robots.txt is accessible at `/robots.txt`
