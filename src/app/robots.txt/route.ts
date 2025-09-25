import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://revetir.com";

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /checkout/
Disallow: /account/
Disallow: /cart/
Disallow: /order/
Disallow: /test-page/
Disallow: /test-routing/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap_main.xml
Sitemap: ${baseUrl}/sitemap_brand_categories.xml
Sitemap: ${baseUrl}/sitemap_products.xml`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
