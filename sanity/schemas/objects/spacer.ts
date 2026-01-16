// Object schema: Spacer / Divider
// For visual separation and pacing control

export const spacer = {
  type: "object",
  name: "spacer",
  title: "Spacer / Divider",
  fields: [
    {
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Empty Space", value: "space" },
          { title: "Horizontal Line", value: "line" },
          { title: "Wide Line", value: "wideLine" },
          { title: "Decorative Divider", value: "decorative" },
          { title: "Three Dots", value: "dots" },
        ],
        layout: "radio",
      },
      initialValue: "space",
    },
    {
      name: "size",
      title: "Size",
      type: "string",
      options: {
        list: [
          { title: "Small", value: "small" },
          { title: "Medium", value: "medium" },
          { title: "Large", value: "large" },
          { title: "Extra Large", value: "xlarge" },
        ],
      },
      initialValue: "medium",
    },
  ],
  preview: {
    select: {
      type: "type",
      size: "size",
    },
    prepare(selection: Record<string, any>) {
      return {
        title: `Spacer (${selection.type || "space"})`,
        subtitle: selection.size || "medium",
      }
    },
  },
}
