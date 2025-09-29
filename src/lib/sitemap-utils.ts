import { HttpTypes } from "@medusajs/types"

export interface SitemapPage {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
  hreflang?: { [lang: string]: string }
}

export interface RegionConfig {
  code: string
  currency: string
  language: string
  hreflang: string
  isDefault: boolean
}

/**
 * Get all supported regions for sitemap generation
 * Based on your actual regions: US and Europe (DK, FR, DE, IT, ES, SE, GB)
 */
export async function getSupportedRegions(): Promise<RegionConfig[]> {
  return [
    {
      code: 'us',
      currency: 'USD',
      language: 'en',
      hreflang: 'en-us',
      isDefault: true
    },
    {
      code: 'dk',
      currency: 'EUR',
      language: 'da',
      hreflang: 'da-dk',
      isDefault: false
    },
    {
      code: 'fr',
      currency: 'EUR',
      language: 'fr',
      hreflang: 'fr-fr',
      isDefault: false
    },
    {
      code: 'de',
      currency: 'EUR',
      language: 'de',
      hreflang: 'de-de',
      isDefault: false
    },
    {
      code: 'it',
      currency: 'EUR',
      language: 'it',
      hreflang: 'it-it',
      isDefault: false
    },
    {
      code: 'es',
      currency: 'EUR',
      language: 'es',
      hreflang: 'es-es',
      isDefault: false
    },
    {
      code: 'se',
      currency: 'EUR',
      language: 'sv',
      hreflang: 'sv-se',
      isDefault: false
    },
    {
      code: 'gb',
      currency: 'EUR',
      language: 'en',
      hreflang: 'en-gb',
      isDefault: false
    }
  ]
}

/**
 * Generate hreflang annotations for a page across all regions
 * Following Google's guidelines for proper hreflang implementation
 */
export function generateHreflangAnnotations(
  baseUrl: string,
  path: string,
  regions: RegionConfig[]
): { [lang: string]: string } {
  const hreflang: { [lang: string]: string } = {}
  
  regions.forEach(region => {
    const url = `${baseUrl}/${region.code}${path}`
    hreflang[region.hreflang] = url
  })
  
  // Add x-default pointing to the default region (US)
  const defaultRegion = regions.find(r => r.isDefault)
  if (defaultRegion) {
    hreflang['x-default'] = `${baseUrl}/${defaultRegion.code}${path}`
  }
  
  return hreflang
}

/**
 * Generate sitemap pages for all regions with proper hreflang annotations
 */
export function generateMultiRegionPages(
  baseUrl: string,
  staticPages: Array<{
    path: string
    changeFrequency: SitemapPage['changeFrequency']
    priority: number
  }>,
  regions: RegionConfig[]
): SitemapPage[] {
  const pages: SitemapPage[] = []
  
  staticPages.forEach(page => {
    regions.forEach(region => {
      const url = `${baseUrl}/${region.code}${page.path}`
      const hreflang = generateHreflangAnnotations(baseUrl, page.path, regions)
      
      pages.push({
        url,
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        hreflang
      })
    })
  })
  
  return pages
}

/**
 * Generate XML sitemap with proper hreflang support
 * Following Google's XML sitemap format with hreflang annotations
 */
export function generateSitemapXML(pages: SitemapPage[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(page => {
  const hreflangTags = page.hreflang 
    ? Object.entries(page.hreflang)
        .map(([lang, url]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`)
        .join('\n')
    : ''
  
  return `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
${hreflangTags}
  </url>`
}).join('\n')}
</urlset>`

  return xml
}
