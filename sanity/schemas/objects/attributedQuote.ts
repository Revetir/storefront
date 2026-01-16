// Object schema: Quote with Attribution
// Used for pullquotes and attributed quotes in editorial content

export const attributedQuote = {
  type: "object",
  name: "attributedQuote",
  title: "Quote with Attribution",
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
      description: "e.g., 'Ziggy Chen'",
    },
    {
      name: "style",
      title: "Quote Style",
      type: "string",
      options: {
        list: [
          { title: "Pull Quote (Large, Centered)", value: "pullQuote" },
          { title: "Block Quote (Indented)", value: "blockQuote" },
          { title: "Inline Quote", value: "inline" },
        ],
        layout: "radio",
      },
      initialValue: "pullQuote",
    },
  ],
  preview: {
    select: {
      quote: "quote",
      attribution: "attribution",
    },
    prepare(selection: Record<string, any>) {
      return {
        title: selection.quote?.substring(0, 50) + "...",
        subtitle: `— ${selection.attribution || "Unknown"}`,
      }
    },
  },
}
