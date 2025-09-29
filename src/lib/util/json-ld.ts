import { HttpTypes } from "@medusajs/types"

interface ProductJsonLdProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

export function generateProductJsonLd({ product, region, countryCode }: ProductJsonLdProps): string {
  // Get the first variant for pricing and availability
  const firstVariant = product.variants?.[0]
  const calculatedPrice = firstVariant?.calculated_price
  
  // Get brand information
  const brand = (product as any)?.brand
  const brandName = brand?.name || "REVETIR"
  
  // Get product images
  const images = product.images?.map(img => img.url) || []
  const thumbnail = product.thumbnail
  
  // Determine availability
  const inventoryQuantity = firstVariant?.inventory_quantity || 0
  const availability = inventoryQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
  
  // Get product SKU
  const sku = (product as any)?.product_sku?.sku || product.id
  
  // Get categories
  const categories = product.categories?.map(cat => cat.name) || []
  
  // Get tags
  const tags = product.tags?.map(tag => tag.value) || []
  
  // Build the JSON-LD structure
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "sku": sku,
    "mpn": sku, // Manufacturer Part Number
    "brand": {
      "@type": "Brand",
      "name": brandName
    },
    "category": categories.length > 0 ? categories[0] : undefined,
    "additionalProperty": tags.map(tag => ({
      "@type": "PropertyValue",
      "name": "Tag",
      "value": tag
    })),
    "image": images.length > 0 ? images : (thumbnail ? [thumbnail] : []),
    "url": `https://revetir.com/${countryCode}/products/${brand?.slug ? `${brand.slug}-` : ''}${product.handle}`,
    "offers": {
      "@type": "Offer",
      "price": calculatedPrice?.calculated_amount ? (calculatedPrice.calculated_amount / 100).toFixed(2) : undefined,
      "priceCurrency": calculatedPrice?.currency_code || region?.currency_code || "USD",
      "availability": availability,
      "seller": {
        "@type": "Organization",
        "name": "REVETIR",
        "url": "https://revetir.com"
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": calculatedPrice?.currency_code || region?.currency_code || "USD"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 5,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 5,
            "maxValue": 10,
            "unitCode": "DAY"
          }
        }
      }
    }
  }

  // Remove undefined values to keep JSON clean
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd, (key, value) => {
    return value === undefined ? undefined : value
  }))

  return JSON.stringify(cleanJsonLd, null, 2)
}
