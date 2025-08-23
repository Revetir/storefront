/**
 * Utility functions for generating consistent meta descriptions
 * across category and brand pages for SEO optimization
 */

export interface MetaDescriptionParams {
    name: string
    type: 'category' | 'brand'
  }
  
  /**
   * Generates a meta description for category pages
   * Template: "Buy designer [category_name] with Free Shipping & Returns in the USA. Shop authentic luxury designers at incredible discounts on REVETIR."
   */
  export function generateCategoryMetaDescription(categoryName: string): string {
    return `Buy designer ${categoryName} with Free Shipping & Returns in the USA. Shop authentic luxury ${categoryName} at incredible discounts on REVETIR.`
  }
  
  /**
   * Generates a meta description for brand pages
   * Template: "Buy [brand_name] clothing, shoes, and accessories with Free Shipping & Returns in the USA. Shop authentic [brand_name] at incredible discounts on REVETIR."
   */
  export function generateBrandMetaDescription(brandName: string): string {
    return `Buy ${brandName} clothing, shoes, and accessories with Free Shipping & Returns in the USA. Shop authentic ${brandName} at incredible discounts on REVETIR.`
  }
  
  /**
   * Generic function to generate meta descriptions based on type
   */
  export function generateMetaDescription(params: MetaDescriptionParams): string {
    const { name, type } = params
    
    switch (type) {
      case 'category':
        return generateCategoryMetaDescription(name)
      case 'brand':
        return generateBrandMetaDescription(name)
      default:
        return generateCategoryMetaDescription(name) // fallback to category
    }
  }