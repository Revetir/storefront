// Object schema: Callout / Highlight Box
// For emphasized content blocks, tips, notes, or featured text

export const callout = {
  type: "object",
  name: "callout",
  title: "Callout / Highlight Box",
  fields: [
    {
      name: "style",
      title: "Callout Style",
      type: "string",
      options: {
        list: [
          { title: "Note", value: "note" },
          { title: "Tip", value: "tip" },
          { title: "Warning", value: "warning" },
          { title: "Featured", value: "featured" },
          { title: "Quote Card", value: "quoteCard" },
        ],
        layout: "radio",
      },
      initialValue: "note",
    },
    {
      name: "title",
      title: "Title",
      type: "string",
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
        },
      ],
    },
    {
      name: "backgroundColor",
      title: "Background Color",
      type: "string",
      options: {
        list: [
          { title: "Light Gray", value: "lightGray" },
          { title: "Cream", value: "cream" },
          { title: "Black", value: "black" },
          { title: "Accent", value: "accent" },
          { title: "None (Border Only)", value: "none" },
        ],
      },
      initialValue: "lightGray",
    },
  ],
  preview: {
    select: {
      title: "title",
      style: "style",
    },
    prepare(selection: Record<string, any>) {
      return {
        title: selection.title || "Callout",
        subtitle: selection.style || "note",
      }
    },
  },
}
