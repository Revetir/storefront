// Object schema: Bilingual Text Block
// For side-by-side or stacked multilingual content

export const bilingualText = {
  type: "object",
  name: "bilingualText",
  title: "Bilingual Text Block",
  fields: [
    {
      name: "primaryLanguage",
      title: "Primary Language",
      type: "string",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "French", value: "fr" },
          { title: "Japanese", value: "ja" },
          { title: "Chinese", value: "zh" },
          { title: "Korean", value: "ko" },
        ],
      },
      initialValue: "en",
    },
    {
      name: "primaryText",
      title: "Primary Text",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
          ],
        },
      ],
    },
    {
      name: "secondaryLanguage",
      title: "Secondary Language",
      type: "string",
      options: {
        list: [
          { title: "English", value: "en" },
          { title: "French", value: "fr" },
          { title: "Japanese", value: "ja" },
          { title: "Chinese", value: "zh" },
          { title: "Korean", value: "ko" },
        ],
      },
    },
    {
      name: "secondaryText",
      title: "Secondary Text",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
          ],
        },
      ],
    },
    {
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Side by Side", value: "sideBySide" },
          { title: "Stacked (Primary First)", value: "stacked" },
          { title: "Tabs", value: "tabs" },
        ],
      },
      initialValue: "sideBySide",
    },
  ],
  preview: {
    select: {
      primary: "primaryLanguage",
      secondary: "secondaryLanguage",
    },
    prepare(selection: Record<string, any>) {
      return {
        title: "Bilingual Text",
        subtitle: `${selection.primary?.toUpperCase() || "EN"} / ${selection.secondary?.toUpperCase() || "—"}`,
      }
    },
  },
}
