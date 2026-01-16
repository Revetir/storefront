# Sanity CMS Integration for REVETIR Editorials

This guide explains how to set up Sanity CMS for managing editorial content.

## Setup Steps

### 1. Create a Sanity Project

If you haven't already, create a new Sanity project:

```bash
npm create sanity@latest -- --project-id=<your-project-id> --dataset=production
```

Or create one at https://www.sanity.io/manage

### 2. Configure Environment Variables

Create a `.env.local` file in the storefront root with:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
```

Get your project ID from https://www.sanity.io/manage

### 3. Set Up Sanity Studio

You can either:

**Option A: Use the embedded schemas (recommended)**

Copy the schemas from `sanity/schemas/` to your Sanity Studio project:
- `editorial.ts` - Main editorial articles
- `spotlight.ts` - Homepage spotlight section
- `newsItem.ts` - News items in the grid
- `index.ts` - Schema index

In your Sanity Studio's `sanity.config.ts`:

```typescript
import { schemaTypes } from './schemas'

export default defineConfig({
  // ... other config
  schema: {
    types: schemaTypes,
  },
})
```

**Option B: Create a new Sanity Studio in this repo**

```bash
cd sanity
npm init sanity@latest
```

Then import the schemas from `./schemas`.

### 4. CORS Configuration

In Sanity dashboard (https://www.sanity.io/manage):
1. Go to your project → API → CORS origins
2. Add your development URL: `http://localhost:8000`
3. Add your production URL: `https://revetir.com`

## Content Types

### Editorial
Full-length articles with:
- Title, subtitle, author, date
- Cover image with hotspot cropping
- Rich text content (Portable Text) with embedded images
- Featured flag for homepage display

### Spotlight
The large text section on homepage:
- Headline (large text)
- Subheadline (descriptive text)
- Link URL and CTA button text
- Active toggle (only one should be active)

### News Item
External news links in the grid:
- Title and date
- External URL
- Optional thumbnail image

## How It Works

The storefront components automatically:
1. Try to fetch from Sanity first
2. Fall back to hardcoded data if Sanity is not configured
3. Use Sanity CDN for optimized image delivery

This means:
- **No breaking changes** - existing content continues to work
- **Gradual migration** - move content to Sanity at your own pace
- **Zero downtime** - if Sanity is unreachable, fallbacks kick in

## Files Modified

### New Files
- `src/lib/sanity/client.ts` - Sanity client configuration
- `src/lib/sanity/queries.ts` - Data fetching functions
- `src/lib/sanity/PortableTextRenderer.tsx` - Rich text renderer
- `sanity/schemas/*.ts` - Content type definitions

### Updated Files
- `src/app/[countryCode]/editorial/[slug]/page.tsx` - Editorial detail page
- `src/modules/home/components/editorial/editorial-grid.tsx` - Homepage grid
- `src/modules/home/components/editorial/editorial-spotlight.tsx` - Spotlight section
- `next.config.js` - Added Sanity CDN domain

## Migrating Existing Content

To migrate your existing editorials to Sanity:

1. Open Sanity Studio
2. Create new Editorial documents
3. Copy content from `src/lib/data/editorials.ts`
4. Use the rich text editor for content (no more raw HTML!)
5. Upload images to Sanity's asset management
6. Mark editorials as "Featured" for homepage display

Once content is in Sanity, you can optionally remove the legacy data from `editorials.ts`.
