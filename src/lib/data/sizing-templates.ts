export interface MeasurementPoint {
  x_percent: number
  y_percent: number
  offset_x: number
  offset_y: number
  label: string
}

export interface SizingTemplate {
  category: string
  diagram_component: string
  measurement_points: Record<string, MeasurementPoint>
  size_chart: Record<string, Record<string, number>>
  units: "cm" | "inches"
}

// Sizing templates for different product categories
export const SIZING_TEMPLATES: SizingTemplate[] = [
  {
    category: "Shirts",
    diagram_component: "TShirtDiagram",
    units: "cm",
    measurement_points: {
      chest: { x_percent: 50, y_percent: 27, offset_x: 0, offset_y: -10, label: "Chest" },
      waist: { x_percent: 50, y_percent: 40, offset_x: 0, offset_y: -10, label: "Waist" },
      length: { x_percent: 50, y_percent: 67, offset_x: 0, offset_y: 10, label: "Length" },
      shoulder: { x_percent: 30, y_percent: 47, offset_x: -10, offset_y: 0, label: "Shoulder" },
    },
    size_chart: {
      S: { chest: 36, waist: 32, length: 26, shoulder: 16 },
      M: { chest: 38, waist: 34, length: 27, shoulder: 17 },
      L: { chest: 40, waist: 36, length: 28, shoulder: 18 },
      XL: { chest: 42, waist: 38, length: 29, shoulder: 19 },
    }
  },
  {
    category: "Sweatshirts",
    diagram_component: "SweatshirtsDiagram",
    units: "cm",
    measurement_points: {
      chest: { x_percent: 50, y_percent: 27, offset_x: 0, offset_y: -10, label: "Chest" },
      waist: { x_percent: 50, y_percent: 40, offset_x: 0, offset_y: -10, label: "Waist" },
      length: { x_percent: 50, y_percent: 67, offset_x: 0, offset_y: 10, label: "Length" },
      shoulder: { x_percent: 30, y_percent: 47, offset_x: -10, offset_y: 0, label: "Shoulder" },
    },
    size_chart: {
      S: { chest: 38, waist: 34, length: 27, shoulder: 17 },
      M: { chest: 40, waist: 36, length: 28, shoulder: 18 },
      L: { chest: 42, waist: 38, length: 29, shoulder: 19 },
      XL: { chest: 44, waist: 40, length: 30, shoulder: 20 },
    }
  },
  {
    category: "Pants",
    diagram_component: "TrousersDiagram",
    units: "cm",
    measurement_points: {
      waist: { x_percent: 46, y_percent: 8, offset_x: 0, offset_y: -15, label: "Waist" },
      hip: { x_percent: 69, y_percent: 27, offset_x: 0, offset_y: -15, label: "Rise" },
      inseam: { x_percent: 44, y_percent: 53, offset_x: 15, offset_y: 0, label: "Inseam" },
      hem: { x_percent: 38, y_percent: 82, offset_x: 0, offset_y: 15, label: "Hem" },
    },
    size_chart: {
      S: { waist: 32, hip: 36, inseam: 30, hem: 16 },
      M: { waist: 34, hip: 38, inseam: 31, hem: 17 },
      L: { waist: 36, hip: 40, inseam: 32, hem: 18 },
      XL: { waist: 38, hip: 42, inseam: 33, hem: 19 },
    }
  },
  // Shoes categories render a conversion chart (EU/US/UK/JP) in the modal
  // The modal provides a custom renderer; size_chart remains empty
  {
    category: "Shoes Unisex",
    diagram_component: "ShoesUnisex",
    units: "cm",
    measurement_points: {},
    size_chart: {}
  },
  {
    category: "Shoes Men",
    diagram_component: "ShoesMen",
    units: "cm",
    measurement_points: {},
    size_chart: {}
  },
  {
    category: "Shoes Women",
    diagram_component: "ShoesWomen",
    units: "cm",
    measurement_points: {},
    size_chart: {}
  },
  {
    category: "Generic",
    diagram_component: "GenericDiagram",
    units: "cm",
    measurement_points: {},
    size_chart: {}
  }
]


// Map category to sizing template using hierarchical lookup
export const mapCategoryToTemplate = (categoryName: string, categoryId?: string): string => {
  console.log('  🔎 mapCategoryToTemplate - Input:', { categoryName, categoryId })
  try {
    // Lazy import to avoid circular deps
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CategoryMaster } = require("@lib/data/category-master") as typeof import("@lib/data/category-master")

    // getTemplateForCategory now uses hierarchical lookup by default
    const template = CategoryMaster.getTemplateForCategory({
      id: categoryId,
      name: categoryName
    })

    console.log('    Template result:', template || 'Generic (fallback)')
    return template || "Generic"
  } catch (e) {
    console.log('    Error in mapCategoryToTemplate:', e)
    return "Generic"
  }
}

// Helper function to get sizing template by category
// NOTE: categoryName should already be a mapped template category from getProductTemplateCategory
export const getSizingTemplate = (templateCategory: string): SizingTemplate | null => {
  console.log(`  📋 getSizingTemplate: looking for "${templateCategory}" in templates`)

  // templateCategory is already mapped, so just find the matching template
  const found = SIZING_TEMPLATES.find(template =>
    template.category.toLowerCase() === templateCategory.toLowerCase()
  ) || null

  console.log(`  📋 getSizingTemplate: ${found ? `found ${found.category} (${found.diagram_component})` : 'NOT FOUND, returning null'}`)
  return found
}

// Helper function to get all available categories
export const getAvailableCategories = (): string[] => {
  return SIZING_TEMPLATES.map(template => template.category)
}
