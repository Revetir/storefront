// Object schema: Hover Reveal Gallery
// Editorial grid where images reveal text overlays on hover
// Ideal for list-style content, retrospectives, and curated collections

export const hoverRevealGallery = {
  type: "object",
  name: "hoverRevealGallery",
  title: "Hover Reveal Gallery",
  fields: [
    {
      name: "title",
      title: "Gallery Title",
      type: "string",
      description: "Optional title displayed above the gallery",
    },
    {
      name: "subtitle",
      title: "Gallery Subtitle",
      type: "text",
      rows: 2,
      description: "Optional introductory text below the title",
    },
    {
      name: "images",
      title: "Gallery Images",
      type: "array",
      of: [
        {
          type: "object",
          name: "hoverImage",
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
            },
            {
              name: "overlayTitle",
              title: "Overlay Title",
              type: "string",
              description: "Bold title shown on hover (e.g., year, category, or name)",
            },
            {
              name: "overlayText",
              title: "Overlay Text",
              type: "text",
              rows: 4,
              description: "Description text revealed on hover",
            },
            {
              name: "credit",
              title: "Photo Credit",
              type: "string",
            },
          ],
          preview: {
            select: { 
              media: "image", 
              title: "overlayTitle",
              subtitle: "overlayText" 
            },
            prepare(selection: Record<string, any>) {
              return {
                title: selection.title || "Untitled",
                subtitle: selection.subtitle?.substring(0, 50) + "..." || "",
                media: selection.media,
              }
            },
          },
        },
      ],
      validation: (Rule: any) => Rule.min(1).max(12),
    },
    {
      name: "layout",
      title: "Grid Layout",
      type: "string",
      options: {
        list: [
          { title: "Two Columns", value: "twoColumn" },
          { title: "Three Columns", value: "threeColumn" },
          { title: "Four Columns", value: "fourColumn" },
          { title: "Masonry (Variable Heights)", value: "masonry" },
        ],
      },
      initialValue: "threeColumn",
    },
    {
      name: "aspectRatio",
      title: "Image Aspect Ratio",
      type: "string",
      options: {
        list: [
          { title: "Square (1:1)", value: "square" },
          { title: "Portrait (3:4)", value: "portrait" },
          { title: "Landscape (4:3)", value: "landscape" },
          { title: "Wide (16:9)", value: "wide" },
          { title: "Natural (Preserve Original)", value: "natural" },
        ],
      },
      initialValue: "square",
      hidden: ({ parent }: any) => parent?.layout === "masonry",
    },
    {
      name: "gap",
      title: "Gap Between Images",
      type: "string",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Minimal", value: "minimal" },
          { title: "Small", value: "small" },
          { title: "Medium", value: "medium" },
        ],
      },
      initialValue: "minimal",
    },
    {
      name: "overlayStyle",
      title: "Overlay Style",
      type: "string",
      options: {
        list: [
          { title: "Dark (Black, 70% opacity)", value: "dark" },
          { title: "Light (White, 70% opacity)", value: "light" },
          { title: "Gradient (Bottom fade)", value: "gradient" },
          { title: "Blur (Frosted glass)", value: "blur" },
        ],
      },
      initialValue: "dark",
    },
    {
      name: "overlayPosition",
      title: "Text Position in Overlay",
      type: "string",
      options: {
        list: [
          { title: "Center", value: "center" },
          { title: "Bottom Left", value: "bottomLeft" },
          { title: "Bottom Center", value: "bottomCenter" },
        ],
      },
      initialValue: "center",
    },
    {
      name: "showNumbering",
      title: "Show Image Numbers",
      type: "boolean",
      initialValue: false,
      description: "Display 01, 02, 03... on each image",
    },
    {
      name: "closingText",
      title: "Closing Text",
      type: "array",
      of: [{ type: "block" }],
      description: "Optional text block displayed below the gallery",
    },
    {
      name: "breakoutWidth",
      title: "Gallery Width",
      type: "string",
      options: {
        list: [
          { title: "Content Width", value: "content" },
          { title: "Wide (80vw)", value: "wide" },
          { title: "Extra Wide (90vw)", value: "extrawide" },
          { title: "Full Width (100vw)", value: "full" },
        ],
      },
      initialValue: "wide",
    },
  ],
  preview: {
    select: {
      title: "title",
      images: "images",
      layout: "layout",
    },
    prepare(selection: Record<string, any>) {
      const count = selection.images?.length || 0
      return {
        title: selection.title || "Hover Reveal Gallery",
        subtitle: `${count} images • ${selection.layout || "grid"}`,
      }
    },
  },
}
