# Customization & Whitelabeling Guide

How to customize **Enterprise Business OS** for your brand or client projects.

---

## Quick Start: 5-Minute Rebrand

Change these 5 things to make it yours:

```bash
# 1. App Name
NEXT_PUBLIC_APP_NAME="Your SaaS Name"

# 2. Logo
# Replace: public/logo.svg with your logo

# 3. Colors
# Edit: tailwind.config.ts (see section below)

# 4. Favicon
# Replace: public/favicon.ico

# 5. Default Sender Email
EMAIL_FROM="noreply@yourdomain.com"
```

Rebuild and deploy:
```bash
npm run build
```

---

## Environment Variables

### Brand Identity

```env
# App Name (appears in navbar, emails, meta tags)
NEXT_PUBLIC_APP_NAME="YourSaaS"

# App URL (for email links, OAuth redirects)
NEXT_PUBLIC_APP_URL="https://yoursaas.com"

# Support Email
SUPPORT_EMAIL="support@yoursaas.com"

# Email Sender
EMAIL_FROM="notifications@yoursaas.com"
EMAIL_FROM_NAME="YourSaaS Team"
```

Add these to `.env` and redeploy.

---

## Logo & Branding Assets

### 1. Logo Files

Replace these files in `public/`:

| File | Dimensions | Usage |
|------|-----------|-------|
| `logo.svg` | Vector (512x512 artboard) | Main logo (navbar, emails) |
| `logo-dark.svg` | Vector (512x512) | Dark mode logo |
| `favicon.ico` | 32x32 px | Browser tab icon |
| `logo-192.png` | 192x192 px | PWA icon (Android) |
| `logo-512.png` | 512x512 px | PWA icon (iOS) |

**Example**:
```bash
# Replace logo
cp your-logo.svg public/logo.svg
```

### 2. Update Metadata

Edit `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'YourSaaS - Project Management for Teams',
  description: 'Manage projects, teams, and billing in one place',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'YourSaaS',
    description: 'Your custom tagline here',
    images: ['/og-image.png'], // Create this 1200x630 image
  },
};
```

---

## Color Scheme

### Primary Brand Colors

Edit `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',   // Lightest
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Main brand color
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',  // Darkest
        },
      },
    },
  },
};
```

**Find your colors**: Use [UI Colors](https://uicolors.app/) to generate a palette from your brand color.

### Update Components

Search and replace default colors:
```bash
# Find components using default colors
grep -r "bg-blue-500" src/components/

# Replace with brand colors
# bg-blue-500 → bg-brand-500
```

---

## Typography

### Change Default Font

Edit `src/app/layout.tsx`:

```typescript
import { Inter, Poppins } from 'next/font/google';

// Current font
const inter = Inter({ subsets: ['latin'] });

// Change to Poppins (or any Google Font)
const poppins = Poppins({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'] 
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      {children}
    </html>
  );
}
```

**Popular choices**: Inter, Poppins, Montserrat, Outfit, DM Sans

---

## Email Templates

### Customize Email Branding

Email templates are in `src/components/emails/`.

**Example**: Edit `src/components/emails/WelcomeEmail.tsx`:

```tsx
export function WelcomeEmail({ userName }: { userName: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f9fc' }}>
        {/* Change logo */}
        <Img 
          src="https://yourdomain.com/logo.png" 
          alt="YourSaaS" 
          width="120" 
        />
        
        {/* Customize copy */}
        <Heading>Welcome to YourSaaS, {userName}!</Heading>
        <Text>We're excited to have you onboard.</Text>
        
        {/* Update links */}
        <Button href="https://yourdomain.com/dashboard">
          Get Started
        </Button>
      </Body>
    </Html>
  );
}
```

**Email variables** (from `.env`):
- `{{APP_NAME}}` → Replaced with `NEXT_PUBLIC_APP_NAME`
- `{{SUPPORT_EMAIL}}` → Replaced with `SUPPORT_EMAIL`

---

## Remove "Powered By" Footers

### Website Footer

Edit `src/components/layout/Footer.tsx`:

```tsx
// BEFORE
<p>Powered by Enterprise Business OS</p>

// AFTER (remove or replace)
<p>© 2026 YourSaaS. All rights reserved.</p>
```

### Email Footer

Edit email templates:

```tsx
// BEFORE
<Text>Sent by Enterprise Business OS</Text>

// AFTER (remove entirely or customize)
<Text>©  YourSaaS Inc.</Text>
```

---

## Landing Page Customization

### Hero Section

Edit `src/app/[locale]/page.tsx`:

```tsx
<h1 className="text-5xl font-bold">
  {/* Change this */}
  Manage Your Business with AI
</h1>

<p className="text-xl text-muted-foreground">
  {/* And this */}
  The complete platform for modern teams
</p>
```

### Features Section

Update feature cards in the same file:

```tsx
const features = [
  {
    icon: Zap,
    title: 'Your Feature 1',
    description: 'Custom description here',
  },
  // Add/remove features
];
```

---

## Custom Domain Setup

### 1. Configure DNS

Point your custom domain to Vercel:

**A Record**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 2. Add Domain in Vercel

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add `yourdomain.com`
3. Wait for DNS propagation (5-30 minutes)

### 3. Update Environment Variables

```env
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### 4. Update OAuth Redirects

**Google OAuth**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Update **Authorized redirect URIs**:
   - Add: `https://yourdomain.com/api/auth/google/callback`

**Stripe**:
1. Go to Stripe Dashboard → Settings → Branding
2. Update **Website URL**: `https://yourdomain.com`

---

## Multi-Tenant Whitelabeling

For agencies serving multiple clients, each with custom domains.

### Architecture

```
client1.yourplatform.com → Team ID: team_abc123
client2.yourplatform.com → Team ID: team_def456
```

### Implementation

1. **Database: Add branding fields**

```sql
ALTER TABLE teams ADD COLUMN custom_domain VARCHAR(255);
ALTER TABLE teams ADD COLUMN logo_url TEXT;
ALTER TABLE teams ADD COLUMN primary_color VARCHAR(7);
```

2. **Middleware: Detect subdomain**

Edit `src/middleware.ts`:

```typescript
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Fetch team by subdomain
  const team = await getTeamBySubdomain(subdomain);
  
  // Inject into request
  request.headers.set('x-team-id', team.id);
  request.headers.set('x-logo-url', team.logoUrl);
  
  return NextResponse.next();
}
```

3. **Layout: Dynamic branding**

```typescript
export default function RootLayout() {
  const headers = headers();
  const logoUrl = headers.get('x-logo-url');
  
  return (
    <html>
      <body>
        <Navbar logo={logoUrl} />
        {children}
      </body>
    </html>
  );
}
```

---

## SEO Customization

### Per-Page Meta Tags

Edit page files (`src/app/[locale]/*/page.tsx`):

```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Your Page Title | YourSaaS',
    description: 'Custom description for SEO',
    keywords: ['saas', 'project management', 'teams'],
  };
}
```

### Sitemap

Auto-generated at `https://yourdomain.com/sitemap.xml`.

To customize, edit `src/app/sitemap.ts`:

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://yourdomain.com', lastModified: new Date() },
    { url: 'https://yourdomain.com/pricing', lastModified: new Date() },
    // Add custom pages
  ];
}
```

---

## Remove Demo/Test Features

For production, remove these development-only features:

### 1. Demo Route

Delete or restrict access:
```bash
rm -rf src/app/[locale]/demo
```

### 2. Seed Data

Remove demo accounts from production:
```typescript
// src/scripts/seed-financials.ts
// Comment out or delete demo user creation
```

### 3. Environment Checks

```typescript
// Only show dev features in development
{process.env.NODE_ENV === 'development' && (
  <DevTools />
)}
```

---

## Legal Pages

Customize these required pages:

### Privacy Policy

Edit `src/app/[locale]/privacy/page.tsx`:
- Company name
- Contact email
- Data retention periods
- Cookie usage

### Terms of Service

Edit `src/app/[locale]/terms/page.tsx`:
- Service description
- Pricing terms
- Liability disclaimers

**Need legal help?** Use [Termly](https://termly.io) or [Avodocs](https://www.avodocs.com) to generate compliant policies.

---

## Analytics & Tracking

### Replace PostHog

Currently uses PostHog. To switch to Google Analytics:

1. **Install GA**:
```bash
npm install @next/third-parties
```

2. **Add to layout**:
```typescript
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
```

3. **Remove PostHog**:
```bash
# Remove from package.json
npm uninstall posthog-js
```

---

## Internationalization (i18n)

Currently supports English and Indonesian. To add Spanish:

### 1. Create translation file

```bash
cp messages/en.json messages/es.json
```

### 2. Translate keys

Edit `messages/es.json`:
```json
{
  "Dashboard": {
    "title": "Panel de Control",
    "welcome": "Bienvenido de nuevo"
  }
}
```

### 3. Add locale to config

Edit `src/i18n.ts`:
```typescript
export const locales = ['en', 'id', 'es'];
```

### 4. Update middleware

Edit `src/middleware.ts` (already supports dynamic locales).

---

## Deployment Checklist

Before going live with your rebrand:

- [ ] Logo files replaced (SVG, PNG, favicon)
- [ ] App name updated in `.env`
- [ ] Color scheme customized
- [ ] Email templates updated
- [ ] Custom domain configured
- [ ] OAuth redirects updated
- [ ] Privacy Policy & Terms written
- [ ] "Powered by" references removed
- [ ] Demo routes disabled
- [ ] SEO meta tags customized
- [ ] Analytics tracking installed
- [ ] Sitemap generated
- [ ] SSL certificate verified

---

## Support

**Need help with customization?**

- **DIY Guide**: This document
- **Video Tutorial**: [Coming soon]
- **Custom Development**: farhandavin14@gmail.com ($150/hour)

---

**Last Updated**: January 3, 2026
