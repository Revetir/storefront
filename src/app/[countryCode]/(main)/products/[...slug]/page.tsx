import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

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
        fields: "handle,title,+brand.*",
        limit: 1,
      },
    }).then(({ response }) => response.products[0])

    if (!product) {
      return null
    }

    return { product, brandSlug: (product as any).brand?.slug || "" }
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
        // ensure brand is included to validate
        fields: "handle,title,+brand.*",
        limit: 1,
      },
    }).then(({ response }) => response.products[0])

    if (candidate) {
      return { product: candidate, brandSlug: brandCandidate }
    }
  }

  return null
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
        queryParams: { limit: 100, fields: "handle,+brand.*" },
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
          .filter((product) => product.handle && (product as any).brand?.slug)
          .map((product) => ({
            countryCode: countryData.country,
            slug: [`${(product as any).brand.slug}-${product.handle}`],
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

  // If the URL was handle-only, enforce canonical brand-handle URL
  if (!brandAndHandle.includes("-") && (product as any).brand?.slug) {
    const correctUrl = `/${params.countryCode}/products/${(product as any).brand.slug}-${product.handle}`
    redirect(correctUrl)
  }

  if ((product as any).brand?.slug && (product as any).brand.slug !== brandSlug) {
    const correctUrl = `/${params.countryCode}/products/${(product as any).brand.slug}-${product.handle}`
    redirect(correctUrl)
  }

  // Generate meta description using the new format
  const brandName = (product as any).brand?.name
  const metaDescription = `Buy ${brandName} ${product.title} on sale at REVETIR.com. Free Shipping & Returns in the US.`

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

  // If the URL was handle-only, enforce canonical brand-handle URL
  if (!brandAndHandle.includes("-") && (resolvedProduct as any).brand?.slug) {
    const correctUrl = `/${params.countryCode}/products/${(resolvedProduct as any).brand.slug}-${resolvedProduct.handle}`
    redirect(correctUrl)
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: {
      handle: resolvedProduct.handle,
      // Ensure all relations needed by the template are present
      fields:
        "*images,*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,*categories,+product_sku.*,+brand.*",
    },
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  if ((pricedProduct as any).brand?.slug && (pricedProduct as any).brand.slug !== brandSlug) {
    const correctUrl = `/${params.countryCode}/products/${(pricedProduct as any).brand.slug}-${pricedProduct.handle}`
    redirect(correctUrl)
  }

  // Fetch related products data on the server
  const queryParams: any = {}
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
    queryParams: {
      ...queryParams,
      // Include brand to build canonical links in ProductPreview
      fields: "handle,thumbnail,+brand.*",
    },
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
