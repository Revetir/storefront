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
  // TODO: Add category templates here after designing visual diagrams and coordinate systems
  //
  // Each template requires the following before implementation:
  // 1. High-resolution diagram image saved to /public/images/{category}_sizing_diagram.png
  // 2. Accurate x_percent/y_percent coordinates for each measurement point (tested on all viewports)
  // 3. Offset adjustments (offset_x, offset_y) to prevent text overlap on diagram
  // 4. Category assignment in category-master.ts via CategoryMaster.setTemplate()
  //
  // Template structure:
  // {
  //   category: "CategoryName",              // Must match assignment in category-master.ts
  //   diagram_component: "DiagramName",      // Used to identify which diagram image to load
  //   units: "cm",                           // All measurements stored in centimeters
  //   measurement_points: {
  //     measurementKey: {
  //       x_percent: 50,                     // Horizontal position (0-100)
  //       y_percent: 30,                     // Vertical position (0-100)
  //       offset_x: 0,                       // Pixel adjustment for fine-tuning
  //       offset_y: -10,                     // Pixel adjustment for fine-tuning
  //       label: "Display Name"              // User-facing label
  //     }
  //   },
  //   size_chart: {                          // Optional: fallback if product has no metadata
  //     S: { measurementKey: valueInCm },
  //     M: { measurementKey: valueInCm },
  //     // ... etc
  //   }
  // }
  //
  // Common measurement keys by category:
  // - Shirts/Tops: chest, waist, length, shoulder
  // - Pants/Jeans/Shorts: waist, hip, inseam, hem
  // - Jackets/Coats: chest, sleeve, length, shoulder
  // - Sweaters: chest, waist, length, shoulder
  //

  // Pants template with SVG diagram
  {
    category: "Pants",
    diagram_component: "PantsDiagram",
    units: "cm",
    measurement_points: {
      waist: {
        x_percent: 50,
        y_percent: 9.5,
        offset_x: 0,
        offset_y: 0,
        label: "Waist"
      },
      rise: {
        x_percent: 79.7,
        y_percent: 21.1,
        offset_x: 0,
        offset_y: 0,
        label: "Rise"
      },
      inseam: {
        x_percent: 59,
        y_percent: 53.6,
        offset_x: 0,
        offset_y: 0,
        label: "Inseam"
      },
      leg_opening: {
        x_percent: 32.8,
        y_percent: 88.8,
        offset_x: 0,
        offset_y: 0,
        label: "Leg Opening"
      }
    },
    size_chart: {}
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
  }
]


// Map category to sizing template using hierarchical lookup
export const mapCategoryToTemplate = (categoryName: string, categoryId?: string): string | undefined => {
  try {
    // Lazy import to avoid circular deps
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { CategoryMaster } = require("@lib/data/category-master") as typeof import("@lib/data/category-master")

    // getTemplateForCategory now uses hierarchical lookup by default
    const template = CategoryMaster.getTemplateForCategory({
      id: categoryId,
      name: categoryName
    })

    return template
  } catch (e) {
    return undefined
  }
}

// Helper function to get sizing template by category
// NOTE: categoryName should already be a mapped template category from getProductTemplateCategory
export const getSizingTemplate = (templateCategory: string): SizingTemplate | null => {
  // templateCategory is already mapped, so just find the matching template
  const found = SIZING_TEMPLATES.find(template =>
    template.category.toLowerCase() === templateCategory.toLowerCase()
  ) || null

  return found
}

// Helper function to get all available categories
export const getAvailableCategories = (): string[] => {
  return SIZING_TEMPLATES.map(template => template.category)
}
