// Object schema: Interview / Q&A Format
// For structured interview content with Q&A formatting

export const interview = {
  type: "object",
  name: "interview",
  title: "Interview / Q&A Section",
  fields: [
    {
      name: "participants",
      title: "Participants",
      type: "array",
      of: [
        {
          type: "object",
          name: "participant",
          fields: [
            { name: "name", title: "Name", type: "string", validation: (Rule: any) => Rule.required() },
            { name: "role", title: "Role", type: "string", description: "e.g., 'Interviewer', 'Designer'" },
            { name: "abbreviation", title: "Abbreviation", type: "string", description: "e.g., 'SS' for SSENSE" },
          ],
          preview: {
            select: { title: "name", subtitle: "role" },
          },
        },
      ],
    },
    {
      name: "exchanges",
      title: "Q&A Exchanges",
      type: "array",
      of: [
        {
          type: "object",
          name: "exchange",
          fields: [
            {
              name: "speaker",
              title: "Speaker",
              type: "string",
              description: "Name or abbreviation of the speaker",
            },
            {
              name: "text",
              title: "Text",
              type: "array",
              of: [
                {
                  type: "block",
                  styles: [{ title: "Normal", value: "normal" }],
                  marks: {
                    decorators: [
                      { title: "Bold", value: "strong" },
                      { title: "Italic", value: "em" },
                    ],
                    annotations: [
                      {
                        name: "editorialNote",
                        type: "object",
                        title: "Editorial Note",
                        description: "Bracketed note from editor, e.g., [We're looking at her work...]",
                        fields: [
                          { name: "note", title: "Note", type: "text" },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          ],
          preview: {
            select: { speaker: "speaker" },
            prepare(selection: Record<string, any>) {
              return { title: selection.speaker || "Speaker" }
            },
          },
        },
      ],
    },
    {
      name: "style",
      title: "Interview Style",
      type: "string",
      options: {
        list: [
          { title: "Standard (Name: Text)", value: "standard" },
          { title: "Bold Names", value: "boldNames" },
          { title: "Alternating Colors", value: "alternating" },
        ],
      },
      initialValue: "boldNames",
    },
  ],
  preview: {
    select: {
      participants: "participants",
    },
    prepare(selection: Record<string, any>) {
      const names = selection.participants?.map((p: any) => p.name).join(", ") || "Interview"
      return {
        title: "Interview",
        subtitle: names,
      }
    },
  },
}
