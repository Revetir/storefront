import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  const currentDate = new Date().toISOString().split('T')[0] 
  
  const productSitemapPages = []
  for (let i = 0; i < 10; i++) {
    productSitemapPages.push({
      url: `${baseUrl}/sitemap-products/${i}`,
      lastModified: new Date(),
    })
  }
  
  return [
    {
      url: `${baseUrl}/sitemap_main.xml`,
      lastModified: new Date(),
    },
    ...productSitemapPages,
  ]
}
