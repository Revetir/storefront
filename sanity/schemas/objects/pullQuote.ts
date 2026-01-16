// Object schema: Pull Quote
// Large, visually prominent quotes for breaking up text

export const pullQuote = {
  type: "object",
  name: "pullQuote",
  title: "Pull Quote",
  fields: [
    {
      name: "quote",
      title: "Quote Text",
      type: "text",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "attribution",
      title: "Attribution",
      type: "string",
    },
    {
      name: "style",
      title: "Visual Style",
      type: "string",
      options: {
        list: [
          { title: "Large Centered", value: "largeCentered" },
          { title: "Left Aligned", value: "leftAligned" },
          { title: "With Border", value: "withBorder" },
          { title: "Minimal", value: "minimal" },
          { title: "Oversized", value: "oversized" },
        ],
      },
      initialValue: "largeCentered",
    },
    {
      name: "size",
      title: "Text Size",
      type: "string",
      options: {
        list: [
          { title: "Normal", value: "normal" },
          { title: "Large", value: "large" },
          { title: "Extra Large", value: "xlarge" },
        ],
      },
      initialValue: "large",
    },
  ],
  preview: {
    select: {
      quote: "quote",
      attribution: "attribution",
    },
    prepare(selection: Record<string, any>) {
      return {
        title: `"${selection.quote?.substring(0, 40)}..."`,
        subtitle: selection.attribution ? `— ${selection.attribution}` : "Pull Quote",
      }
    },
  },
}
