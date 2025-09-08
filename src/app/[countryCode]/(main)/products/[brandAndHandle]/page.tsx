import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; brandAndHandle: string }>
}

function parseBrandAndHandle(brandAndHandle: string): { brandSlug: string; productHandle: string } {
  // Try to find the longest possible product handle by testing from the end
  const parts = brandAndHandle.split("-")
  
  for (let i = 1; i < parts.length; i++) {
    const productHandleCandidate = parts.slice(i).join("-")
    // We'll validate this exists when we fetch the product
    return {
      brandSlug: parts.slice(0, i).join("-"),
      productHandle: productHandleCandidate
    }
  }
  
  // Fallback: assume single dash split
  const firstDash = brandAndHandle.indexOf("-")
  if (firstDash > 0) {
    return {
      brandSlug: brandAndHandle.slice(0, firstDash),
      productHandle: brandAndHandle.slice(firstDash + 1)
    }
  }
  
  // If no dash found, treat entire string as product handle
  return {
    brandSlug: "",
    productHandle: brandAndHandle
  }
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle,brand.*" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products
          .filter((product) => product.handle && product.brand?.slug)
          .map((product) => ({
            countryCode: countryData.country,
            brandAndHandle: `${product.brand.slug}-${product.handle}`,
          }))
      )
      .filter((param) => param.brandAndHandle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { brandAndHandle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const { productHandle } = parseBrandAndHandle(brandAndHandle)

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: productHandle },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  // Validate brand slug matches
  const { brandSlug } = parseBrandAndHandle(brandAndHandle)
  if (product.brand?.slug && product.brand.slug !== brandSlug) {
    // Redirect to correct canonical URL
    const correctUrl = `/${params.countryCode}/products/${product.brand.slug}-${product.handle}`
    redirect(correctUrl, 301)
  }

  // Generate meta description using the new format
  const productType = product.type?.value || "Product"
  const metaDescription = `Buy ${productType} ${product.title} on sale at REVETIR.com. Free Shipping & Returns in the US.`

  return {
    title: `${productType} ${product.title} | REVETIR`,
    description: metaDescription,
    openGraph: {
      title: `${product.title} | REVETIR`,
      description: metaDescription,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
    alternates: {
      canonical: `/${params.countryCode}/products/${brandAndHandle}`,
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const { productHandle } = parseBrandAndHandle(params.brandAndHandle)

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle: productHandle },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  // Validate brand slug matches
  const { brandSlug } = parseBrandAndHandle(params.brandAndHandle)
  if (pricedProduct.brand?.slug && pricedProduct.brand.slug !== brandSlug) {
    // Redirect to correct canonical URL
    const correctUrl = `/${params.countryCode}/products/${pricedProduct.brand.slug}-${pricedProduct.handle}`
    redirect(correctUrl, 301)
  }

  // Fetch related products data on the server
  const queryParams: HttpTypes.StoreProductParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (pricedProduct.collection_id) {
    queryParams.collection_id = [pricedProduct.collection_id]
  }
  if (pricedProduct.tags) {
    queryParams.tag_id = pricedProduct.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }

  const relatedProducts = await listProducts({
    queryParams,
    countryCode: params.countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== pricedProduct.id
    )
  })

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      relatedProducts={relatedProducts}
    />
  )
}
