// Object schema: Product Feature Block
// For shoppable product showcases within editorial content

export const productFeature = {
  type: "object",
  name: "productFeature",
  title: "Product Feature",
  fields: [
    {
      name: "title",
      title: "Section Title",
      type: "string",
      description: "e.g., 'Featured In This Image'",
    },
    {
      name: "products",
      title: "Products",
      type: "array",
      of: [
        {
          type: "object",
          name: "product",
          fields: [
            { name: "name", title: "Product Name", type: "string", validation: (Rule: any) => Rule.required() },
            { name: "brand", title: "Brand", type: "string" },
            { name: "price", title: "Price", type: "string" },
            { name: "salePrice", title: "Sale Price", type: "string", description: "Optional sale price. When set, will display with strikethrough styling on original price." },
            { name: "url", title: "Product URL", type: "url" },
            { 
              name: "image", 
              title: "Product Image", 
              type: "image", 
              options: { hotspot: true } 
            },
            { name: "description", title: "Description", type: "text", rows: 2 },
          ],
          preview: {
            select: { title: "name", subtitle: "brand", media: "image" },
          },
        },
      ],
    },
    {
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "Horizontal Scroll", value: "horizontalScroll" },
          { title: "List", value: "list" },
          { title: "Featured Single", value: "featuredSingle" },
        ],
      },
      initialValue: "grid",
    },
    {
      name: "showPrices",
      title: "Show Prices",
      type: "boolean",
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: "title",
      products: "products",
    },
    prepare(selection: Record<string, any>) {
      const count = selection.products?.length || 0
      return {
        title: selection.title || "Product Feature",
        subtitle: `${count} products`,
      }
    },
  },
}
