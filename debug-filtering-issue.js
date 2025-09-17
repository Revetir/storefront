const { searchProductsWithAlgolia } = require('./src/lib/util/algolia-filters')

async function debugFilteringIssue() {
  console.log("🔍 Debugging filtering issue...")
  
  try {
    // Step 1: Test basic search without filters
    console.log("\n=== STEP 1: Basic Search (No Filters) ===")
    const basicResult = await searchProductsWithAlgolia({
      page: 1,
      hitsPerPage: 3
    })
    
    console.log(`Found ${basicResult.nbHits} total products`)
    if (basicResult.hits.length > 0) {
      const product = basicResult.hits[0]
      console.log("Sample product data:")
      console.log("- Title:", product.title)
      console.log("- Brand:", product.brand)
      console.log("- Gender:", product.gender)
      console.log("- All Category Handles:", product.allCategoryHandles)
      console.log("- Categories:", product.categories)
      console.log("- Min Price US:", product.minPriceUs)
      console.log("- Min Price EU:", product.minPriceEu)
    }
    
    // Step 2: Test gender filter only
    console.log("\n=== STEP 2: Gender Filter Only ===")
    const genderResult = await searchProductsWithAlgolia({
      gender: "men",
      page: 1,
      hitsPerPage: 3
    })
    
    console.log(`Found ${genderResult.nbHits} products for men`)
    if (genderResult.hits.length > 0) {
      const product = genderResult.hits[0]
      console.log("Sample men's product:")
      console.log("- Title:", product.title)
      console.log("- Brand:", product.brand)
      console.log("- Gender:", product.gender)
      console.log("- All Category Handles:", product.allCategoryHandles)
    }
    
    // Step 3: Test category filter only
    console.log("\n=== STEP 3: Category Filter Only ===")
    const categoryResult = await searchProductsWithAlgolia({
      gender: "men",
      categoryHandle: "shirts",
      page: 1,
      hitsPerPage: 3
    })
    
    console.log(`Found ${categoryResult.nbHits} products for men's shirts`)
    if (categoryResult.hits.length > 0) {
      const product = categoryResult.hits[0]
      console.log("Sample men's shirt:")
      console.log("- Title:", product.title)
      console.log("- Brand:", product.brand)
      console.log("- All Category Handles:", product.allCategoryHandles)
      console.log("- Categories:", product.categories)
    }
    
    // Step 4: Test brand filter only
    console.log("\n=== STEP 4: Brand Filter Only ===")
    const brandResult = await searchProductsWithAlgolia({
      gender: "men",
      brandSlug: "balenciaga",
      page: 1,
      hitsPerPage: 3
    })
    
    console.log(`Found ${brandResult.nbHits} products for Balenciaga men's`)
    if (brandResult.hits.length > 0) {
      const product = brandResult.hits[0]
      console.log("Sample Balenciaga product:")
      console.log("- Title:", product.title)
      console.log("- Brand:", product.brand)
      console.log("- All Category Handles:", product.allCategoryHandles)
    }
    
    // Step 5: Test combined filters
    console.log("\n=== STEP 5: Combined Filters ===")
    const combinedResult = await searchProductsWithAlgolia({
      gender: "men",
      brandSlug: "balenciaga",
      categoryHandle: "shirts",
      page: 1,
      hitsPerPage: 3
    })
    
    console.log(`Found ${combinedResult.nbHits} products for Balenciaga men's shirts`)
    if (combinedResult.hits.length > 0) {
      const product = combinedResult.hits[0]
      console.log("Sample combined filter product:")
      console.log("- Title:", product.title)
      console.log("- Brand:", product.brand)
      console.log("- All Category Handles:", product.allCategoryHandles)
    }
    
    // Step 6: Test different category handles
    console.log("\n=== STEP 6: Test Different Category Handles ===")
    const categoryHandles = ["pants", "shirts", "jackets", "shoes", "accessories"]
    
    for (const handle of categoryHandles) {
      const result = await searchProductsWithAlgolia({
        gender: "men",
        categoryHandle: handle,
        page: 1,
        hitsPerPage: 1
      })
      console.log(`- ${handle}: ${result.nbHits} products`)
    }
    
    // Step 7: Test different brand slugs
    console.log("\n=== STEP 7: Test Different Brand Slugs ===")
    const brandSlugs = ["balenciaga", "gucci", "prada", "versace", "dior"]
    
    for (const slug of brandSlugs) {
      const result = await searchProductsWithAlgolia({
        gender: "men",
        brandSlug: slug,
        page: 1,
        hitsPerPage: 1
      })
      console.log(`- ${slug}: ${result.nbHits} products`)
    }
    
  } catch (error) {
    console.error("❌ Error debugging filtering:", error)
    console.error("Stack trace:", error.stack)
  }
}

debugFilteringIssue()
