import { HttpTypes } from "@medusajs/types"

interface ProductJsonLdProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

// Color mapping for parsing from product title
const COLOR_MAPPING = [
  'Black', 'White', 'Gray', 'Blue', 'Red', 'Brown', 'Green', 'Pink', 
  'Purple', 'Yellow', 'Orange', 'Multicolor', 'Transparent', 'Iridescent', 
  'Gold', 'Silver', 'Rose Gold'
]

// Parse color from product title
function parseColor(title: string): string {
  const foundColors = COLOR_MAPPING.filter(color => 
    title.toLowerCase().includes(color.toLowerCase())
  )
  return foundColors.length > 0 ? foundColors.join('/') : ''
}

// Parse material from description (second to last line)
function parseMaterial(description: string): string {
  const lines = description.split('\n').filter(line => line.trim())
  if (lines.length >= 2) {
    return lines[lines.length - 2].trim()
  }
  return ''
}

// Apparel categories for pattern extraction
const APPAREL_CATEGORIES = [
  'Belt', 'Suspenders', 'Glasses', 'Sunglasses', 'Face Mask', 'Gloves', 'Aviator', 'Beanie', 'Cap', 'Structured Hat',
  'Bracelet', 'Cufflinks', 'Earring', 'Necklace', 'Pendant', 'Ring', 'Keychain', 'Pocket Square', 'Tie Bar',
  'Scarf', 'Sock', 'Iphone Case', 'Bow Tie', 'Neck Tie', 'Towel', 'Card Holder', 'Passport Holder', 'Wallet', 'Watch',
  'Backpack', 'Briefcase', 'Duffle', 'Top Handle Bag', 'Messenger Bag', 'Satchel', 'Pouch', 'Document Holder', 'Tote Bag', 'Travel Bag',
  'Bomber', 'Coat', 'Denim Jacket', 'Down', 'Fur', 'Shearling', 'Jacket', 'Leather Jacket', 'Peacoat', 'Trench Coat', 'Vest',
  'Jeans', 'Cargo Pants', 'Leather Pants', 'Sweatpants', 'Trousers', 'Shirt', 'Shorts', 'Blazer', 'Suit', 'Waistcoat',
  'Cardigan', 'Crewneck', 'Hoodie', 'Zipup', 'Shawlneck', 'Sweatshirt', 'Turtleneck', 'V-Neck', 'Swimsuit',
  'Henley', 'Polo', 'T-Shirt', 'Tank Top', 'Boxers', 'Briefs', 'Pyjamas', 'Loungewear', 'Robe',
  'Boat Shoes', 'Moccasins', 'Biker Boots', 'Combat Boots', 'Chelsea Boots', 'Desert Boots', 'Lace-up Boots', 'Zip up Boots', 'Buckled Boots',
  'Espadrilles', 'Lace Ups', 'Oxfords', 'Monkstraps', 'Sandals', 'Flip Flops', 'Slippers', 'Loafers', 'High Top Sneakers', 'Low Top Sneakers',
  'Dress', 'Head Band', 'Hair Accessory'
]

// Parse pattern from product title (between color and item category)
function parsePattern(title: string, category: string): string {
  // Only extract patterns for apparel items
  const isApparel = APPAREL_CATEGORIES.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(category.toLowerCase())
  )
  
  if (!isApparel) {
    return ''
  }
  
  const titleWords = title.split(' ')
  const colorIndex = titleWords.findIndex(word => 
    COLOR_MAPPING.some(color => word.toLowerCase() === color.toLowerCase())
  )
  
  if (colorIndex === -1) {
    return 'Plain'
  }
  
  // Find the item category in the title
  const categoryWords = category.split(' ')
  let categoryIndex = -1
  
  for (let i = 0; i < titleWords.length; i++) {
    const remainingWords = titleWords.slice(i).join(' ').toLowerCase()
    if (categoryWords.some(catWord => remainingWords.includes(catWord.toLowerCase()))) {
      categoryIndex = i
      break
    }
  }
  
  if (categoryIndex === -1 || categoryIndex <= colorIndex + 1) {
    return 'Plain'
  }
  
  // Extract words between color and category
  const patternWords = titleWords.slice(colorIndex + 1, categoryIndex)
  const pattern = patternWords.join(' ').trim()
  
  // If no pattern found, default to Plain
  return pattern || 'Plain'
}

// Parse gender from SKU (4th character)
function parseGender(sku: string): string {
  if (sku.length >= 4) {
    const genderChar = sku[3].toUpperCase()
    switch (genderChar) {
      case 'M': return 'male'
      case 'F': return 'female'
      case 'U': return 'unisex'
      default: return 'unisex'
    }
  }
  return 'unisex'
}

// Generate item group ID (SKU minus last 2 characters)
function generateItemGroupId(sku: string): string {
  if (sku.length > 2) {
    return sku.slice(0, -2)
  }
  return sku
}

// Generate variant ID (SKU + variant name)
function generateVariantId(sku: string, variantName: string): string {
  return `${sku}${variantName}`
}

// Get global identifier (EAN, UPC, or Barcode) from variant metadata
function getVariantIdentifier(variant: any): string | undefined {
  // Check for EAN, UPC, or Barcode in metadata first, then direct fields
  return variant?.metadata?.ean ||
         variant?.metadata?.upc ||
         variant?.metadata?.barcode ||
         variant?.ean ||
         variant?.upc ||
         variant?.barcode ||
         undefined
}

// Format currency code to ISO 4217 standard (uppercase)
function formatCurrencyCode(currencyCode: string): string {
  return currencyCode?.toUpperCase() || "USD"
}

// Format price to have exactly 2 decimal places
function formatPrice(price: number): string {
  return price?.toFixed(2)
}

export function generateProductJsonLd({ product, region, countryCode }: ProductJsonLdProps): string {
  const brand = (product as any)?.brand
  const brandName = brand?.name
  const productSku = (product as any)?.product_sku?.sku
  const images = product.images?.map(img => img.url) || []
  const thumbnail = product.thumbnail
  const allImages = images.length > 0 ? images : (thumbnail ? [thumbnail] : [])
  
  const categories = product.categories?.map(cat => cat.name) || []
  
  // Parse product attributes
  const color = parseColor(product.title)
  const material = parseMaterial(product.description || '')
  const gender = parseGender(productSku || '')
  const itemGroupId = generateItemGroupId(productSku || '')
  const category = categories.length > 0 ? categories[0] : ''
  const pattern = parsePattern(product.title, category)
  
  // If only one variant, create a single product entry
  if (product.variants && product.variants.length === 1) {
    const variant = product.variants[0]
    const calculatedPrice = variant.calculated_price
    const inventoryQuantity = variant.inventory_quantity
    const manageInventory = variant.manage_inventory
    const allowBackorder = (variant as any).allow_backorder
    
    // Determine availability based on Medusa V2 logic:
    // 1. If backorders are allowed, always in stock
    // 2. If inventory is managed and quantity > 0, in stock
    // 3. If inventory is not managed, in stock
    // 4. Otherwise, out of stock
    const availability = allowBackorder || 
                        !manageInventory || 
                        (manageInventory && inventoryQuantity && inventoryQuantity > 0)
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock"
    
    // Check if variant is on sale by comparing calculated vs original price
    const isSale = calculatedPrice?.original_amount && 
                   calculatedPrice.original_amount !== calculatedPrice.calculated_amount
    
    // Get global identifier if available
    const globalIdentifier = getVariantIdentifier(variant)
    
    const offer: any = {
      "@type": "Offer",
      "price": calculatedPrice?.calculated_amount,
      "priceCurrency": formatCurrencyCode(calculatedPrice?.currency_code || region?.currency_code || "USD"),
      "availability": availability,
      "seller": {
        "@type": "Organization",
        "name": "REVETIR",
        "url": "https://revetir.com"
      },
    }

    // Add priceSpecification if on sale to show both original and sale prices
    if (isSale && calculatedPrice?.original_amount && calculatedPrice?.calculated_amount) {
      offer.priceSpecification = {
        "@type": "CompoundPriceSpecification",
        "priceCurrency": formatCurrencyCode(calculatedPrice?.currency_code || region?.currency_code || "USD"),
        "priceComponent": [
          {
            "@type": "UnitPriceSpecification",
            "name": "Original price",
            "price": formatPrice(calculatedPrice.original_amount)
          },
          {
            "@type": "UnitPriceSpecification",
            "name": "Sale price",
            "price": formatPrice(calculatedPrice.calculated_amount)
          }
        ]
      }
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "sku": productSku || product.id,
      "name": product.title,
      "description": product.description || "",
      ...(globalIdentifier && {
        "identifier": {
          "@type": "PropertyValue",
          "propertyID": "GTIN",
          "value": globalIdentifier
        }
      }),
      "brand": {
        "@type": "Brand",
        "name": brandName
      },
      "category": categories.length > 0 ? categories[0] : undefined,
      "image": allImages,
      "url": `https://revetir.com/${countryCode}/products/${brand?.slug ? `${brand.slug}-` : ''}${product.handle}`,
      "color": color || undefined,
      "material": material || "",
      "gender": gender,
      "ageGroup": "adult",
      "condition": "https://schema.org/NewCondition",
      "itemGroupId": itemGroupId,
      "size": "OS",
      "pattern": pattern || undefined,
      "offers": offer
    }

    return JSON.stringify(jsonLd, null, 2)
  }

  // Create separate entries for each variant (multiple variants)
  const variantEntries = product.variants?.map((variant, index) => {
    const calculatedPrice = variant.calculated_price
    const inventoryQuantity = variant.inventory_quantity
    const manageInventory = variant.manage_inventory
    const allowBackorder = (variant as any).allow_backorder
    
    // Determine availability based on Medusa V2 logic:
    // 1. If backorders are allowed, always in stock
    // 2. If inventory is managed and quantity > 0, in stock
    // 3. If inventory is not managed, in stock
    // 4. Otherwise, out of stock
    const availability = allowBackorder || 
                        !manageInventory || 
                        (manageInventory && inventoryQuantity && inventoryQuantity > 0)
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock"
    
    
    // Check if variant is on sale by comparing calculated vs original price
    const isSale = calculatedPrice?.original_amount && 
                   calculatedPrice.original_amount !== calculatedPrice.calculated_amount
    
    
    // Get variant name from variant.options relationship (Medusa V2 approach)
    const findVariantName = () => {
      // Check if variant has options and extract the option values
      if (variant.options && variant.options.length > 0) {
        // Join all option values to create the variant name
        return variant.options.map(option => option.value).join(' / ')
      }
      
      // Fallback to variant.title if available
      if (variant.title) {
        return variant.title
      }
      
      // Final fallback
      return `variant-${index}`
    }
    
    const variantName = findVariantName()
    const variantId = productSku ? generateVariantId(productSku, variantName) : `${product.id}-${variantName}`
    
    // Get global identifier if available
    const globalIdentifier = getVariantIdentifier(variant)
    
    const offer: any = {
      "@type": "Offer",
      "price": calculatedPrice?.calculated_amount,
      "priceCurrency": formatCurrencyCode(calculatedPrice?.currency_code || region?.currency_code || "USD"),
      "availability": availability,
      "seller": {
        "@type": "Organization",
        "name": "REVETIR",
        "url": "https://revetir.com"
      },
    }

    // Add priceSpecification if on sale to show both original and sale prices
    if (isSale && calculatedPrice?.original_amount && calculatedPrice?.calculated_amount) {
      offer.priceSpecification = {
        "@type": "CompoundPriceSpecification",
        "priceCurrency": formatCurrencyCode(calculatedPrice?.currency_code || region?.currency_code || "USD"),
        "priceComponent": [
          {
            "@type": "UnitPriceSpecification",
            "name": "Original price",
            "price": formatPrice(calculatedPrice.original_amount)
          },
          {
            "@type": "UnitPriceSpecification",
            "name": "Sale price",
            "price": formatPrice(calculatedPrice.calculated_amount)
          }
        ]
      }
    }

    const variantJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "sku": variantId,
      "name": product.title,
      "description": product.description || "",
      ...(globalIdentifier && {
        "identifier": {
          "@type": "PropertyValue",
          "propertyID": "GTIN",
          "value": globalIdentifier
        }
      }),
      "brand": {
        "@type": "Brand",
        "name": brandName
      },
      "category": categories.length > 0 ? categories[0] : undefined,
      "image": allImages,
      "url": `https://revetir.com/${countryCode}/products/${brand?.slug ? `${brand.slug}-` : ''}${product.handle}`,
      "color": color || undefined,
      "material": material || "",
      "gender": gender,
      "ageGroup": "adult",
      "condition": "https://schema.org/NewCondition",
      "itemGroupId": itemGroupId,
      "size": variantName,
      "pattern": pattern || undefined,
      "offers": offer
    }

    return variantJsonLd
  })

  // Return array of variant entries for Google Merchant Center compatibility
  return JSON.stringify(variantEntries, null, 2)
}
