// Simple test to check if Algolia search is working
const { searchProductsWithAlgolia } = require('./src/lib/util/algolia-filters')

async function testFiltering() {
  console.log("Testing Algolia filtering...")
  
  try {
    // Test 1: Basic search
    console.log("\n1. Basic search...")
    const basic = await searchProductsWithAlgolia({ page: 1, hitsPerPage: 2 })
    console.log(`Found ${basic.nbHits} products`)
    
    if (basic.hits.length > 0) {
      const product = basic.hits[0]
      console.log("Sample product:")
      console.log("- Title:", product.title)
      console.log("- Brand:", product.brand)
      console.log("- Gender:", product.gender)
      console.log("- All Category Handles:", product.allCategoryHandles)
      console.log("- Min Price US:", product.minPriceUs)
      console.log("- Min Price EU:", product.minPriceEu)
    }
    
    // Test 2: Gender filter
    console.log("\n2. Gender filter (men)...")
    const men = await searchProductsWithAlgolia({ 
      gender: "men", 
      page: 1, 
      hitsPerPage: 2 
    })
    console.log(`Found ${men.nbHits} men's products`)
    
    // Test 3: Category filter
    console.log("\n3. Category filter (men's shirts)...")
    const shirts = await searchProductsWithAlgolia({ 
      gender: "men", 
      categoryHandle: "shirts", 
      page: 1, 
      hitsPerPage: 2 
    })
    console.log(`Found ${shirts.nbHits} men's shirts`)
    
    // Test 4: Brand filter
    console.log("\n4. Brand filter (men's Balenciaga)...")
    const balenciaga = await searchProductsWithAlgolia({ 
      gender: "men", 
      brandSlug: "balenciaga", 
      page: 1, 
      hitsPerPage: 2 
    })
    console.log(`Found ${balenciaga.nbHits} men's Balenciaga products`)
    
    // Test 5: Combined filter
    console.log("\n5. Combined filter (men's Balenciaga shirts)...")
    const combined = await searchProductsWithAlgolia({ 
      gender: "men", 
      brandSlug: "balenciaga", 
      categoryHandle: "shirts", 
      page: 1, 
      hitsPerPage: 2 
    })
    console.log(`Found ${combined.nbHits} men's Balenciaga shirts`)
    
  } catch (error) {
    console.error("Error:", error.message)
    console.error("Stack:", error.stack)
  }
}

testFiltering()
