// Object schema: Accordion / Expandable Sections
// For A-Z glossaries, FAQs, or collapsible content

export const accordion = {
  type: "object",
  name: "accordion",
  title: "Accordion / Expandable Sections",
  fields: [
    {
      name: "title",
      title: "Section Title",
      type: "string",
      description: "Optional title above the accordion",
    },
    {
      name: "style",
      title: "Accordion Style",
      type: "string",
      options: {
        list: [
          { title: "A-Z Index", value: "azIndex" },
          { title: "FAQ", value: "faq" },
          { title: "Chapters", value: "chapters" },
          { title: "Minimal", value: "minimal" },
        ],
      },
      initialValue: "minimal",
    },
    {
      name: "items",
      title: "Accordion Items",
      type: "array",
      of: [
        {
          type: "object",
          name: "accordionItem",
          fields: [
            {
              name: "heading",
              title: "Heading",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "content",
              title: "Content",
              type: "array",
              of: [
                {
                  type: "block",
                  styles: [
                    { title: "Normal", value: "normal" },
                    { title: "Small", value: "small" },
                  ],
                },
                {
                  type: "image",
                  options: { hotspot: true },
                },
              ],
            },
          ],
          preview: {
            select: { title: "heading" },
          },
        },
      ],
    },
    {
      name: "allowMultipleOpen",
      title: "Allow Multiple Open",
      type: "boolean",
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: "title",
      items: "items",
    },
    prepare(selection: Record<string, any>) {
      const count = selection.items?.length || 0
      return {
        title: selection.title || "Accordion",
        subtitle: `${count} items`,
      }
    },
  },
}
