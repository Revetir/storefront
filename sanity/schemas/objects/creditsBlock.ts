// Object schema: Credits Block
// For extended production credits (Fashion editorials, shoots, etc.)

export const creditsBlock = {
  type: "object",
  name: "creditsBlock",
  title: "Credits Block",
  fields: [
    {
      name: "title",
      title: "Section Title",
      type: "string",
      description: "e.g., 'Credits', 'Production'",
      initialValue: "Credits",
    },
    {
      name: "credits",
      title: "Credit Lines",
      type: "array",
      of: [
        {
          type: "object",
          name: "creditLine",
          fields: [
            {
              name: "role",
              title: "Role",
              type: "string",
              description: "e.g., 'Photography', 'Styling', 'Hair', 'Makeup'",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "names",
              title: "Names",
              type: "array",
              of: [{ type: "string" }],
              description: "Person(s) credited for this role",
            },
            {
              name: "agency",
              title: "Agency/Company",
              type: "string",
              description: "Optional agency or company name",
            },
          ],
          preview: {
            select: { role: "role", names: "names" },
            prepare(selection: Record<string, any>) {
              const nameList = selection.names?.join(", ") || ""
              return {
                title: selection.role || "Credit",
                subtitle: nameList,
              }
            },
          },
        },
      ],
    },
    {
      name: "date",
      title: "Publication Date",
      type: "string",
      description: "Date to display in credits (e.g., 'January 8, 2026')",
    },
    {
      name: "layout",
      title: "Layout Style",
      type: "string",
      options: {
        list: [
          { title: "List (Stacked)", value: "list" },
          { title: "Two Columns", value: "twoColumn" },
          { title: "Inline", value: "inline" },
        ],
      },
      initialValue: "list",
    },
  ],
  preview: {
    select: {
      title: "title",
      credits: "credits",
    },
    prepare(selection: Record<string, any>) {
      const count = selection.credits?.length || 0
      return {
        title: selection.title || "Credits",
        subtitle: `${count} credit lines`,
      }
    },
  },
}
