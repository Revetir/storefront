// Object schema: Two-Column Grid
// For "About museum" style layouts with image + text side by side

export const twoColumnGrid = {
  type: "object",
  name: "twoColumnGrid",
  title: "Two-Column Grid (Image + Text)",
  fields: [
    {
      name: "imagePosition",
      title: "Image Position",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "left",
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt Text", type: "string" },
        { name: "caption", title: "Caption", type: "string" },
        { name: "credit", title: "Photo Credit", type: "string", description: "e.g., '© Kevin J. Miyazaki 2024'" },
      ],
    },
    {
      name: "text",
      title: "Text Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H3", value: "h3" },
            { title: "Small", value: "small" },
          ],
        },
      ],
    },
    {
      name: "verticalAlign",
      title: "Vertical Alignment",
      type: "string",
      options: {
        list: [
          { title: "Top", value: "top" },
          { title: "Center", value: "center" },
          { title: "Bottom", value: "bottom" },
        ],
      },
      initialValue: "top",
    },
    {
      name: "columnRatio",
      title: "Column Ratio",
      type: "string",
      options: {
        list: [
          { title: "Equal (50/50)", value: "equal" },
          { title: "Image Larger (60/40)", value: "imageLarger" },
          { title: "Text Larger (40/60)", value: "textLarger" },
        ],
      },
      initialValue: "equal",
    },
    {
      name: "breakoutWidth",
      title: "Layout Width",
      type: "string",
      description: "How wide the two-column layout should be",
      options: {
        list: [
          { title: "Content Width", value: "content" },
          { title: "Wide", value: "wide" },
          { title: "Extra Wide", value: "extrawide" },
        ],
      },
      initialValue: "wide",
    },
  ],
  preview: {
    select: {
      media: "image",
      position: "imagePosition",
    },
    prepare(selection: Record<string, any>) {
      return {
        title: "Two-Column Grid",
        subtitle: `Image on ${selection.position || "left"}`,
        media: selection.media,
      }
    },
  },
}
