import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import { generateProductJsonLd } from "@lib/util/json-ld"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import Script from "next/script"

type Props = {
  params: Promise<{ countryCode: string; slug: string[] }>
}

async function resolveProductByBrandAndHandle(brandAndHandle: string, countryCode: string): Promise<{ product: HttpTypes.StoreProduct; brandSlug: string } | null> {
  const parts = brandAndHandle.split("-")

  if (parts.length < 2) {
    // No dash: treat entire string as handle, resolve and redirect later
    const product = await listProducts({
      countryCode,
      queryParams: {
        handle: brandAndHandle,
        fields: "handle,title,description,thumbnail,*images,+categories.*,+product_sku.*,+brands.*,*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,*variants.options.value,*variants.options.option_id,*variants.metadata,+variants.ean,+variants.upc,+variants.barcode,*options.*,*options.values.*",
        limit: 1,
      },
    }).then(({ response }) => response.products[0])

    if (!product) {
      return null
    }

    // Normalize brands to array and get all brand slugs joined
    const brandData = (product as any).brands
    const brands = Array.isArray(brandData) ? brandData : (brandData ? [brandData] : [])
    const brandSlug = brands.length > 0 ? brands.map((b: any) => b.slug).join("-") : ""

    return { product, brandSlug }
  }

  // Try candidates by increasing the brand portion from the left
  // i represents how many segments belong to brand
  for (let i = 1; i < parts.length; i++) {
    const brandCandidate = parts.slice(0, i).join("-")
    const handleCandidate = parts.slice(i).join("-")

    const candidate = await listProducts({
      countryCode,
      queryParams: {
        handle: handleCandidate,
        // ensure brand/brands are included to validate
        fields: "handle,title,description,thumbnail,*images,+categories.*,+product_sku.*,+brands.*,*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,*variants.options.value,*variants.options.option_id,*variants.metadata,+variants.ean,+variants.upc,+variants.barcode,*options.*,*options.values.*",
        limit: 1,
      },
    }).then(({ response }) => response.products[0])

    if (candidate) {
      // Get brand(s) - the 'brands' field returns an array when isList: true
      const brandData = (candidate as any).brands
      const brands = Array.isArray(brandData) ? brandData : (brandData ? [brandData] : [])

      if (brands.length > 0) {
        // Check if all brand slugs match when joined
        const productBrandSlugs = brands.map((b: any) => b.slug).join("-")
        if (productBrandSlugs === brandCandidate) {
          return { product: candidate, brandSlug: productBrandSlugs }
        }
      }
    }
  }

  return null
}

// TODO: Increase cache back to 3600 (1 hour) or 86400 (24 hours) after testing
// Temporarily set to 0 for testing brand updates - revalidate on every request
export const revalidate = 0 // Was: 3600

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
        queryParams: { limit: 100, fields: "handle,+brands.*" },
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
          .filter((product) => {
            const brandData = (product as any).brands
            const brands = Array.isArray(brandData) ? brandData : (brandData ? [brandData] : [])
            return product.handle && brands.length > 0 && brands[0]?.slug
          })
          .map((product) => ({
            countryCode: countryData.country,
            slug: (() => {
              const brandData = (product as any).brands
              const brands = Array.isArray(brandData) ? brandData : (brandData ? [brandData] : [])
              const brandSlug = brands.map((b: any) => b.slug).join("-")
              return [`${brandSlug}-${product.handle}`]
            })(),
          }))
      )
      .filter((param) => param.slug[0])
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
  const { slug } = params
  
  if (slug.length !== 1) {
    notFound()
  }
  
  const brandAndHandle = slug[0]
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const resolved = await resolveProductByBrandAndHandle(brandAndHandle, params.countryCode)
  if (!resolved) {
    notFound()
  }

  const { product, brandSlug } = resolved

  // Normalize brands data
  const brandData = (product as any).brands
  const brands = Array.isArray(brandData) ? brandData : (brandData ? [brandData] : [])
  const allBrandSlugs = brands.length > 0 ? brands.map((b: any) => b.slug).join("-") : ""
  const firstBrand = brands.length > 0 ? brands[0] : null

  // If the URL was handle-only, enforce canonical brand-handle URL
  if (!brandAndHandle.includes("-") && allBrandSlugs) {
    const correctUrl = `/${params.countryCode}/products/${allBrandSlugs}-${product.handle}`
    redirect(correctUrl)
  }

  // If brand slug in URL doesn't match all product brands, redirect to correct URL
  if (allBrandSlugs && allBrandSlugs !== brandSlug) {
    const correctUrl = `/${params.countryCode}/products/${allBrandSlugs}-${product.handle}`
    redirect(correctUrl)
  }

  // Generate meta description using the new format
  const brandName = firstBrand?.name
  const metaDescription = `Buy ${brandName} ${product.title} on sale at REVETIR.com. Free Shipping & Returns in the US.`

  // Generate JSON-LD structured data
  const jsonLd = generateProductJsonLd({
    product,
    region,
    countryCode: params.countryCode
  })

  return {
    title: `${brandName} ${product.title}`,
    description: metaDescription,
    openGraph: {
      title: `${brandName} ${product.title}`,
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
  const { slug } = params
  
  if (slug.length !== 1) {
    notFound()
  }
  
  const brandAndHandle = slug[0]
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const resolved = await resolveProductByBrandAndHandle(brandAndHandle, params.countryCode)
  if (!resolved) {
    notFound()
  }

  const { product: resolvedProduct, brandSlug } = resolved

  // Normalize brands data for resolved product
  const resolvedBrandData = (resolvedProduct as any).brands
  const resolvedBrands = Array.isArray(resolvedBrandData) ? resolvedBrandData : (resolvedBrandData ? [resolvedBrandData] : [])
  const resolvedAllBrandSlugs = resolvedBrands.length > 0 ? resolvedBrands.map((b: any) => b.slug).join("-") : ""

  // If the URL was handle-only, enforce canonical brand-handle URL
  if (!brandAndHandle.includes("-") && resolvedAllBrandSlugs) {
    const correctUrl = `/${params.countryCode}/products/${resolvedAllBrandSlugs}-${resolvedProduct.handle}`
    redirect(correctUrl)
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: {
      handle: resolvedProduct.handle,
      // Ensure all relations needed by the template are present
      fields:
        "*images,*variants.calculated_price,+variants.inventory_quantity,+variants.manage_inventory,+variants.allow_backorder,*variants.title,*variants.options.value,*variants.options.option_id,*variants.metadata,+variants.ean,+variants.upc,+variants.barcode,+metadata,+tags,+categories.*,+product_sku.*,+brands.*,*options.*,*options.values.*",
    },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  // Normalize brands data for priced product
  const pricedBrandData = (pricedProduct as any).brands
  const pricedBrands = Array.isArray(pricedBrandData) ? pricedBrandData : (pricedBrandData ? [pricedBrandData] : [])
  const pricedAllBrandSlugs = pricedBrands.length > 0 ? pricedBrands.map((b: any) => b.slug).join("-") : ""

  // If brand slug in URL doesn't match all product brands, redirect to correct URL
  if (pricedAllBrandSlugs && pricedAllBrandSlugs !== brandSlug) {
    const correctUrl = `/${params.countryCode}/products/${pricedAllBrandSlugs}-${pricedProduct.handle}`
    redirect(correctUrl)
  }

  // Fetch related products data on the server - brand-based with category fallback
  // Get brands from product (handle both single brand object and array)
  const brandData = (pricedProduct as any).brands
  const brands = Array.isArray(brandData) ? brandData : (brandData ? [brandData] : [])

  // First, try to fetch products from the same brand(s)
  const brandQueryParams: any = {}
  if (region?.id) {
    brandQueryParams.region_id = region.id
  }
  if (brands.length > 0) {
    brandQueryParams.brand_id = brands.map((b: any) => b.id).filter(Boolean)
  }

  let relatedProducts = await listProducts({
    queryParams: {
      ...brandQueryParams,
      // Include brand to build canonical links in ProductPreview
      fields: "handle,title,thumbnail,+brands.*",
    },
    countryCode: params.countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== pricedProduct.id
    )
  })

  // If not enough brand matches, fall back to category-based products
  if (relatedProducts.length < 4 && pricedProduct.categories && pricedProduct.categories.length > 0) {
    const categoryQueryParams: any = {}
    if (region?.id) {
      categoryQueryParams.region_id = region.id
    }
    categoryQueryParams.category_id = pricedProduct.categories
      .map((c) => c.id)
      .filter(Boolean)

    const categoryProducts = await listProducts({
      queryParams: {
        ...categoryQueryParams,
        fields: "handle,title,thumbnail,+brands.*",
      },
      countryCode: params.countryCode,
    }).then(({ response }) => {
      return response.products.filter(
        (responseProduct) =>
          responseProduct.id !== pricedProduct.id &&
          !relatedProducts.some(p => p.id === responseProduct.id) // Avoid duplicates
      )
    })

    // Combine brand matches with category matches to fill the carousel
    relatedProducts = [...relatedProducts, ...categoryProducts]
  }

  // Generate JSON-LD structured data for this product
  const jsonLd = generateProductJsonLd({
    product: pricedProduct,
    region,
    countryCode: params.countryCode
  })

  return (
    <>
      <Script
        id="product-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd,
        }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        relatedProducts={relatedProducts}
      />
    </>
  )
}
