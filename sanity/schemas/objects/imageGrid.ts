// Object schema: Image Grid
// Flexible grid layouts for multiple images

export const imageGrid = {
  type: "object",
  name: "imageGrid",
  title: "Image Grid",
  fields: [
    {
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Two Columns (50/50)", value: "twoColumn" },
          { title: "Three Columns", value: "threeColumn" },
          { title: "Four Columns", value: "fourColumn" },
          { title: "Asymmetric (Large + Small)", value: "asymmetric" },
          { title: "Masonry", value: "masonry" },
          { title: "Three Images + Quote (2x2 Grid)", value: "threeWithQuote" },
        ],
      },
      initialValue: "twoColumn",
    },
    {
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Alt Text", type: "string" },
            { name: "caption", title: "Caption", type: "string" },
            { name: "credit", title: "Photo Credit", type: "string" },
          ],
        },
      ],
      validation: (Rule: any) => Rule.max(6),
    },
    {
      name: "gap",
      title: "Gap Between Images",
      type: "string",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Small", value: "small" },
          { title: "Medium", value: "medium" },
          { title: "Large", value: "large" },
        ],
      },
      initialValue: "small",
    },
    {
      name: "showCaptions",
      title: "Show Captions",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "verticalAlign",
      title: "Vertical Alignment",
      type: "string",
      description: "How to align images of different heights within the grid",
      options: {
        list: [
          { title: "Top", value: "top" },
          { title: "Center", value: "center" },
          { title: "Bottom", value: "bottom" },
        ],
      },
      initialValue: "top",
      hidden: ({ parent }: any) => parent?.layout === "masonry" || parent?.layout === "threeWithQuote",
    },
    {
      name: "breakoutWidth",
      title: "Grid Width",
      type: "string",
      description: "How wide the grid should be relative to the content",
      options: {
        list: [
          { title: "Content Width", value: "content" },
          { title: "Wide (slightly wider)", value: "wide" },
          { title: "Extra Wide", value: "extrawide" },
          { title: "Full Width", value: "full" },
        ],
      },
      initialValue: "content",
    },
    {
      name: "quote",
      title: "Quote Text",
      type: "text",
      description: "Quote to display in the 4th grid position (only for Three Images + Quote layout)",
      hidden: ({ parent }: any) => parent?.layout !== "threeWithQuote",
    },
    {
      name: "quoteAttribution",
      title: "Quote Attribution",
      type: "string",
      description: "Attribution for the quote (optional)",
      hidden: ({ parent }: any) => parent?.layout !== "threeWithQuote",
    },
    {
      name: "quoteAlignment",
      title: "Quote Vertical Alignment",
      type: "string",
      options: {
        list: [
          { title: "Top", value: "top" },
          { title: "Center", value: "center" },
          { title: "Bottom", value: "bottom" },
        ],
      },
      initialValue: "center",
      hidden: ({ parent }: any) => parent?.layout !== "threeWithQuote",
    },
  ],
  preview: {
    select: {
      layout: "layout",
      images: "images",
      quote: "quote",
    },
    prepare(selection: Record<string, any>) {
      const count = selection.images?.length || 0
      const subtitle = selection.layout === "threeWithQuote" && selection.quote
        ? `${selection.layout} — "${selection.quote.slice(0, 30)}..."`
        : selection.layout
      return {
        title: `Image Grid (${count} images)`,
        subtitle,
      }
    },
  },
}
