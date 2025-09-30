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

// Get UPC from variant metadata
function getVariantUPC(variant: any): string | undefined {
  return variant?.metadata?.upc || variant?.upc || undefined
}

export function generateProductJsonLd({ product, region, countryCode }: ProductJsonLdProps): string {
  const brand = (product as any)?.brand
  const brandName = brand?.name
  const productSku = (product as any)?.product_sku?.sku
  const images = product.images?.map(img => img.url) || []
  const thumbnail = product.thumbnail
  const allImages = images.length > 0 ? images : (thumbnail ? [thumbnail] : [])
  
  // Debug logging
  console.log('JSON-LD Debug - Product:', {
    productId: product.id,
    title: product.title,
    description: product.description,
    material: parseMaterial(product.description || ''),
    images: product.images,
    thumbnail: product.thumbnail,
    allImages,
    productSku,
    variants: product.variants?.length
  })
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
    // If inventory is not managed, always in stock
    // If inventory is managed, check quantity
    const availability = !manageInventory
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock"
    
    // Check if variant is on sale by comparing calculated vs original price
    const isSale = calculatedPrice?.original_amount && 
                   calculatedPrice.original_amount !== calculatedPrice.calculated_amount
    
    // Get GTIN if available
    const gtin = getVariantUPC(variant)
    
    const offer: any = {
      "@type": "Offer",
      "price": calculatedPrice?.calculated_amount,
      "priceCurrency": calculatedPrice?.currency_code || region?.currency_code || "USD",
      "availability": availability,
      "seller": {
        "@type": "Organization",
        "name": "REVETIR",
        "url": "https://revetir.com"
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    // Add sale price if on sale
    if (isSale && calculatedPrice?.original_amount && calculatedPrice?.calculated_amount) {
      offer.price = calculatedPrice.original_amount
      offer.salePrice = calculatedPrice.calculated_amount
    }

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "id": productSku,
      "name": product.title,
      "description": product.description || "",
      "gtin": gtin || "",
      "identifierExists": !!gtin,
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
    // If inventory is not managed, always in stock
    // If inventory is managed, check quantity
    const availability = !manageInventory || (inventoryQuantity && inventoryQuantity > 0)
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock"
    
    // Debug logging for variants
    console.log('JSON-LD Debug - Variant:', {
      index,
      variantId: variant.id,
      title: variant.title,
      options: variant.options,
      inventoryQuantity,
      manageInventory,
      availability,
      calculatedPrice
    })
    
    // Check if variant is on sale by comparing calculated vs original price
    const isSale = calculatedPrice?.original_amount && 
                   calculatedPrice.original_amount !== calculatedPrice.calculated_amount
    
    // Get variant name (size) from options
    const variantName = variant.options?.[0]?.value || variant.title || `Variant ${index + 1}`
    const variantId = generateVariantId(productSku, variantName)
    
    // Get GTIN if available
    const gtin = getVariantUPC(variant)
    
    const offer: any = {
      "@type": "Offer",
      "price": calculatedPrice?.calculated_amount,
      "priceCurrency": calculatedPrice?.currency_code || region?.currency_code || "USD",
      "availability": availability,
      "seller": {
        "@type": "Organization",
        "name": "REVETIR",
        "url": "https://revetir.com"
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    // Add sale price if on sale
    if (isSale && calculatedPrice?.original_amount && calculatedPrice?.calculated_amount) {
      offer.price = calculatedPrice.original_amount
      offer.salePrice = calculatedPrice.calculated_amount
    }

    const variantJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "id": variantId,
      "name": product.title,
      "description": product.description || "",
      "gtin": gtin || "",
      "identifierExists": !!gtin,
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
