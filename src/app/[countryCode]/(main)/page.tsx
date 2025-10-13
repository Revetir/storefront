import { Metadata } from "next"
import dynamic from "next/dynamic"
import Hero from "@modules/home/components/hero"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import EditorialGrid from "@modules/home/components/editorial/editorial-grid"
import { getNewestProducts } from "@lib/data/products"

// Dynamic imports for below-the-fold components
const NewsSection = dynamic(() => import("@modules/home/components/news/news"), {
  loading: () => <div className="h-96" />,
})
const FeaturedBrands = dynamic(() => import("@modules/home/components/featured-brands/featured-brands"), {
  loading: () => <div className="h-96" />,
})
const CuratedProducts = dynamic(() => import("@modules/home/components/curated/curated-products"), {
  loading: () => <div className="h-96" />,
})
const NewArrivals = dynamic(() => import("@modules/home/components/new-arrivals/new-arrivals"), {
  loading: () => <div className="h-96" />,
})

export const metadata: Metadata = {
  title: "REVETIR: Luxury Fashion & Independent Designers",
  description: "Discover curated designer clothing, shoes and accessories for men and women on sale. Free shipping & returns in the US.",
  keywords: "designer fashion sale, luxury clothing, men's designer clothes, women's designer clothes, luxury accessories, fashion sale, designer sale",
  openGraph: {
    title: "REVETIR — Designer Clothing, Shoes and Accessories",
    description: "Discover curated designer fashion from luxury brands and emerging labels. Shop clothing, shoes, and accessories on sale with free U.S. shipping and returns.",
    url: "https://revetir.com",
    siteName: "REVETIR",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "REVETIR — Designer Clothing, Shoes and Accessories",
    description: "Discover curated designer fashion from luxury brands and emerging labels. Shop clothing, shoes, and accessories on sale with free U.S. shipping and returns.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  // Fetch initial products for NewArrivals
  const initialProducts = await getNewestProducts({ countryCode, limit: 15 })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <div className="">
        <EditorialGrid />
      </div>

      <div className="">
        <NewsSection />
      </div>

      <div className="mt-20">
        <FeaturedBrands />
      </div>

      <div className="mt-20">
        <CuratedProducts />
      </div>
      <div className="mt-10">
        <NewArrivals countryCode={countryCode} initialProducts={initialProducts} />
      </div>

      <nav
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 1280,
          margin: "4rem auto 0 auto",
          userSelect: "none",
        }}
        aria-label="Shop Menswear or Womenswear links"
      >
        <LocalizedClientLink
          href="/men"
          style={{
            flex: 1,
            padding: "2rem 0",
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "600",
            fontSize: "1.75rem",
            color: "#333",
            textDecoration: "none",
            cursor: "pointer",
          }}
          aria-label="Shop Menswear Sale"
        >
          Shop Menswear
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/women"
          style={{
            flex: 1,
            padding: "2rem 0",
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "600",
            fontSize: "1.75rem",
            color: "#333",
            textDecoration: "none",
            cursor: "pointer",
          }}
          aria-label="Shop Womenswear Sale"
        >
          Shop Womenswear
        </LocalizedClientLink>
      </nav>
    </>
  )
}
