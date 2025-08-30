import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  const currentDate = new Date().toISOString().split('T')[0] 
  
  // Generate multiple product sitemap pages for better pagination
  const productSitemapPages = []
  for (let i = 0; i < 10; i++) { // Support up to 10 product sitemap pages
    productSitemapPages.push({
      url: `${baseUrl}/sitemap_products_list_${i}.xml`,
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
