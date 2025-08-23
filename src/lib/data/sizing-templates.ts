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
  {
    category: "Merch",
    diagram_component: "GenericDiagram",
    units: "cm",
    measurement_points: {
      width: { x_percent: 50, y_percent: 37.5, offset_x: 0, offset_y: -10, label: "Width" },
      height: { x_percent: 50, y_percent: 62.5, offset_x: 0, offset_y: 10, label: "Height" },
    },
    size_chart: {
      S: { width: 20, height: 25 },
      M: { width: 22, height: 27 },
      L: { width: 24, height: 29 },
      XL: { width: 26, height: 31 },
    }
  }
]


// Simple helper function to map category to sizing template
export const mapCategoryToTemplate = (categoryName: string, categoryId?: string): string => {
  
  const lowerCaseName = categoryName.toLowerCase()
  
  // Simple word-based matching
  if (lowerCaseName.includes("pants") || 
      lowerCaseName.includes("pant") || 
      lowerCaseName.includes("jean") || 
      lowerCaseName.includes("trouser") ||
      lowerCaseName.includes("legging")) {
    return "Pants"
  }
  
  if (lowerCaseName.includes("shirt") && !lowerCaseName.includes("sweatshirts")) {
    return "Shirts"
  }
  
  if (lowerCaseName.includes("sweatshirt") || lowerCaseName.includes("hoodie") || lowerCaseName.includes("crewneck")){
    return "Sweatshirts"
  }
  
  // Default fallback
  return "Generic"
}

// Helper function to get sizing template by category (updated to use mapping)
export const getSizingTemplate = (categoryName: string): SizingTemplate | null => {
  const mappedCategory = mapCategoryToTemplate(categoryName)
  return SIZING_TEMPLATES.find(template => 
    template.category.toLowerCase() === mappedCategory.toLowerCase()
  ) || null
}

// Helper function to get all available categories
export const getAvailableCategories = (): string[] => {
  return SIZING_TEMPLATES.map(template => template.category)
}
