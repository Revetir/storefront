import { Metadata } from "next"
import dynamic from "next/dynamic"
import CheckerboardHero from "@modules/home/components/checkerboard-hero"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import EditorialGrid from "@modules/home/components/editorial/editorial-grid"
import BottomCTA from "@modules/home/components/bottom-cta"
import EditorialSpotlight from "@modules/home/components/editorial/editorial-spotlight"
import { mockRegion, mockCollections, mockProducts } from "@lib/data/mock-data"

// Dynamic imports for heavier/below-the-fold components
const ExpoGrid = dynamic(() => import("@modules/home/components/editorial/expo-grid"), {
  loading: () => <div className="h-[520px] md:h-[640px]" />,
})

const FeaturedGrid = dynamic(() => import("@modules/home/components/featured-brands/featured-grid"), {
  loading: () => <div className="h-96" />,
})
const RunwayBelt3D = dynamic(() => import("@modules/home/components/runway-belt-3d/RunwayBelt3DClient"), {
  loading: () => <div className="h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px]" />,
})
const CuratedProducts = dynamic(() => import("@modules/home/components/curated/curated-products"), {
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

  // Check if we're in design mode (local development without backend)
  const isDesignMode = process.env.NEXT_PUBLIC_DESIGN_MODE === "true"

  let region
  let collections
  let initialProducts

  if (isDesignMode) {
    // Use mock data when backend is not available
    region = mockRegion
    collections = mockCollections
    initialProducts = mockProducts.slice(0, 15)
  } else {
    // Fetch real data from backend
    region = await getRegion(countryCode)

    const collectionsResponse = await listCollections({
      fields: "id, handle, title",
    })
    collections = collectionsResponse.collections
  }

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <CheckerboardHero />
      <div className="">
        <EditorialGrid />
      </div>

      <EditorialSpotlight />

      <ExpoGrid />

      <FeaturedGrid />

      <div className="mt-14 md:mt-16">
        <RunwayBelt3D
          items={[
            {
              id: "dept_galerie_jacket_3d",
              modelSrc: "/images/dept_galerie_jacket_3d.glb",
              previewSrc: "/images/dept_galerie_jacket_preview.png",
              alt: "Dept Galerie jacket 3D",
              rotationSpeed: 0.35,
              scale: 1.45,
              previewAspect: 0.357,
              previewDepth: 0.751,
              href: "/men/jackets"
            },
            {
              id: "balenciaga_snow_boots_3d",
              modelSrc: "/images/balenciaga_snow_boots_3d.glb",
              previewSrc: "/images/balenciaga_snow_boots_preview.png",
              alt: "Balenciaga snow boots 3D",
              rotationSpeed: 0.35,
              previewAspect: 1.206,
              previewDepth: 1.148,
              href: "/men/shoes"
            },
            {
              id: "hat_3d",
              modelSrc: "/images/hat_3d.glb",
              previewSrc: "/images/hat_preview.png",
              alt: "Hat 3D",
              rotationSpeed: 0.35,
              scale: 0.6,
              previewAspect: 2.05,
              previewDepth: 2.038,
              href: "/women/hats"
            },
            {
              id: "boots",
              modelSrc: "/images/boots_3d.glb",
              previewSrc: "/images/boots_preview.png",
              alt: "3D rotating boots",
              rotationSpeed: 0.35,
              previewAspect: 0.816,
              previewDepth: 0.998,
              href: "/women/boots"
            },
          ]}
        />
      </div>

      {/* <div className="mt-20">
        <CuratedProducts />
      </div> */}

      <BottomCTA />
    </>
  )
}
