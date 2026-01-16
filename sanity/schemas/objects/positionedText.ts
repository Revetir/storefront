// Object schema: Positioned Text Block
// For custom text layouts with flexible width and alignment options

export const positionedText = {
  type: "object",
  name: "positionedText",
  title: "Positioned Text Block",
  fields: [
    {
      name: "width",
      title: "Width",
      type: "string",
      description: "How wide should the text block be?",
      options: {
        list: [
          { title: "Narrow (40% of content)", value: "narrow" },
          { title: "Medium (60% of content)", value: "medium" },
          { title: "Wide (80% of content)", value: "wide" },
          { title: "Full Content Width", value: "full" },
          { title: "Wide Viewport (80vw)", value: "viewport-wide" },
          { title: "Extra Wide Viewport (90vw)", value: "viewport-extrawide" },
          { title: "Full Viewport Width", value: "viewport-full" },
        ],
        layout: "radio",
      },
      initialValue: "medium",
    },
    {
      name: "alignment",
      title: "Alignment",
      type: "string",
      description: "How should the text block be aligned?",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "left",
    },
    {
      name: "textAlign",
      title: "Text Alignment",
      type: "string",
      description: "How should the text inside the block be aligned?",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "left",
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
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Lead", value: "lead" },
            { title: "Small", value: "small" },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      width: "width",
      alignment: "alignment",
    },
    prepare(selection: Record<string, any>) {
      const widthLabels: Record<string, string> = {
        narrow: "40%",
        medium: "60%",
        wide: "80%",
        full: "100%",
        "viewport-wide": "80vw",
        "viewport-extrawide": "90vw",
        "viewport-full": "100vw",
      }
      return {
        title: "Positioned Text Block",
        subtitle: `${widthLabels[selection.width] || "60%"}, ${selection.alignment || "left"}`,
      }
    },
  },
}
