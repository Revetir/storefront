const { searchProductsWithAlgolia } = require('./lib/util/algolia-filters')

async function debugFrontendSearch() {
  console.log("Debugging frontend Algolia search...")
  
  try {
    // Test basic gender search
    console.log("\n=== TESTING GENDER SEARCH ===")
    const genderResult = await searchProductsWithAlgolia({
      gender: "men",
      page: 1,
      hitsPerPage: 5
    })
    
    console.log(`Found ${genderResult.nbHits} products for men`)
    if (genderResult.hits.length > 0) {
      const firstProduct = genderResult.hits[0]
      console.log("First product:")
      console.log("- Title:", firstProduct.title)
      console.log("- Brands:", firstProduct.brands)
      console.log("- Gender:", firstProduct.gender)
      console.log("- All Category Handles:", firstProduct.allCategoryHandles)
      console.log("- Categories:", firstProduct.categories)
    }
    
    // Test category search
    console.log("\n=== TESTING CATEGORY SEARCH ===")
    const categoryResult = await searchProductsWithAlgolia({
      gender: "men",
      categoryHandle: "shirts", // Try a common category
      page: 1,
      hitsPerPage: 5
    })
    
    console.log(`Found ${categoryResult.nbHits} products for men's shirts`)
    if (categoryResult.hits.length > 0) {
      const firstProduct = categoryResult.hits[0]
      console.log("First product:")
      console.log("- Title:", firstProduct.title)
      console.log("- Brands:", firstProduct.brands)
      console.log("- All Category Handles:", firstProduct.allCategoryHandles)
    }
    
    // Test brand search
    console.log("\n=== TESTING BRAND SEARCH ===")
    const brandResult = await searchProductsWithAlgolia({
      gender: "men",
      brandSlug: "balenciaga", // Try a common brand
      page: 1,
      hitsPerPage: 5
    })
    
    console.log(`Found ${brandResult.nbHits} products for Balenciaga men's`)
    if (brandResult.hits.length > 0) {
      const firstProduct = brandResult.hits[0]
      console.log("First product:")
      console.log("- Title:", firstProduct.title)
      console.log("- Brands:", firstProduct.brands)
      console.log("- All Category Handles:", firstProduct.allCategoryHandles)
    }
    
    // Test combined search
    console.log("\n=== TESTING COMBINED SEARCH ===")
    const combinedResult = await searchProductsWithAlgolia({
      gender: "men",
      brandSlug: "balenciaga",
      categoryHandle: "shirts",
      page: 1,
      hitsPerPage: 5
    })
    
    console.log(`Found ${combinedResult.nbHits} products for Balenciaga men's shirts`)
    if (combinedResult.hits.length > 0) {
      const firstProduct = combinedResult.hits[0]
      console.log("First product:")
      console.log("- Title:", firstProduct.title)
      console.log("- Brands:", firstProduct.brands)
      console.log("- All Category Handles:", firstProduct.allCategoryHandles)
    }
    
  } catch (error) {
    console.error("Error debugging frontend search:", error)
    console.error("Stack trace:", error.stack)
  }
}

debugFrontendSearch()
