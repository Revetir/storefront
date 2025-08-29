import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revetir.com'
  const currentDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  
  return [
    {
      url: `${baseUrl}/sitemap_main.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemap_products_list_0.xml`,
      lastModified: new Date(),
    },
  ]
}
