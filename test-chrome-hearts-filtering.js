const { searchProductsWithAlgolia } = require('./src/lib/util/algolia-filters')

async function testChromeHeartsFiltering() {
  console.log("🧪 Testing Chrome Hearts filtering with sample data structure...")
  
  try {
    // Test 1: Basic Chrome Hearts search
    console.log("\n=== TEST 1: Chrome Hearts Brand Search ===")
    const brandResult = await searchProductsWithAlgolia({
      gender: "men",
      brandSlug: "chrome-hearts",
      page: 1,
      hitsPerPage: 5
    })
    
    console.log(`Found ${brandResult.nbHits} Chrome Hearts men's products`)
    if (brandResult.hits.length > 0) {
      const product = brandResult.hits[0]
      console.log("Sample Chrome Hearts product:")
      console.log("- Title:", product.title)
      console.log("- Brand:", product.brand)
      console.log("- All Category Handles:", product.allCategoryHandles)
    }
    
    // Test 2: Chrome Hearts + Category (caps)
    console.log("\n=== TEST 2: Chrome Hearts + Caps Category ===")
    const capsResult = await searchProductsWithAlgolia({
      gender: "men",
      brandSlug: "chrome-hearts",
      categoryHandle: "caps",
      page: 1,
      hitsPerPage: 5
    })
    
    console.log(`Found ${capsResult.nbHits} Chrome Hearts men's caps`)
    if (capsResult.hits.length > 0) {
      const product = capsResult.hits[0]
      console.log("Sample Chrome Hearts cap:")
      console.log("- Title:", product.title)
      console.log("- Brand:", product.brand)
      console.log("- All Category Handles:", product.allCategoryHandles)
    }
    
    // Test 3: Chrome Hearts + Category (hats)
    console.log("\n=== TEST 3: Chrome Hearts + Hats Category ===")
    const hatsResult = await searchProductsWithAlgolia({
      gender: "men",
      brandSlug: "chrome-hearts",
      categoryHandle: "hats",
      page: 1,
      hitsPerPage: 5
    })
    
    console.log(`Found ${hatsResult.nbHits} Chrome Hearts men's hats`)
    if (hatsResult.hits.length > 0) {
      const product = hatsResult.hits[0]
      console.log("Sample Chrome Hearts hat:")
      console.log("- Title:", product.title)
      console.log("- Brand:", product.brand)
      console.log("- All Category Handles:", product.allCategoryHandles)
    }
    
    // Test 4: Test different category handles from your data
    console.log("\n=== TEST 4: Testing Different Category Handles ===")
    const categoryHandles = ["caps", "hats", "accessories"]
    
    for (const handle of categoryHandles) {
      const result = await searchProductsWithAlgolia({
        gender: "men",
        categoryHandle: handle,
        page: 1,
        hitsPerPage: 1
      })
      console.log(`- mens-${handle}: ${result.nbHits} products`)
    }
    
    // Test 5: Test women's categories
    console.log("\n=== TEST 5: Testing Women's Categories ===")
    for (const handle of categoryHandles) {
      const result = await searchProductsWithAlgolia({
        gender: "women",
        categoryHandle: handle,
        page: 1,
        hitsPerPage: 1
      })
      console.log(`- womens-${handle}: ${result.nbHits} products`)
    }
    
  } catch (error) {
    console.error("❌ Error testing Chrome Hearts filtering:", error)
    console.error("Stack trace:", error.stack)
  }
}

testChromeHeartsFiltering()
