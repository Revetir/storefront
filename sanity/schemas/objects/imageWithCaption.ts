// Object schema: Image with Caption
// Single image with enhanced caption options

export const imageWithCaption = {
  type: "object",
  name: "imageWithCaption",
  title: "Image with Caption",
  fields: [
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule: any) => Rule.required(),
      fields: [
        { name: "alt", title: "Alt Text", type: "string" },
      ],
    },
    {
      name: "caption",
      title: "Caption",
      type: "text",
      rows: 2,
    },
    {
      name: "credit",
      title: "Photo Credit",
      type: "string",
      description: "e.g., '© Kevin J. Miyazaki 2024', 'Courtesy Anna Sui'",
    },
    {
      name: "size",
      title: "Image Size",
      type: "string",
      options: {
        list: [
          { title: "Small (50%)", value: "small" },
          { title: "Medium (75%)", value: "medium" },
          { title: "Large (100%)", value: "large" },
          { title: "Full Bleed", value: "fullBleed" },
        ],
      },
      initialValue: "large",
    },
    {
      name: "alignment",
      title: "Alignment",
      type: "string",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Center", value: "center" },
          { title: "Right", value: "right" },
        ],
      },
      initialValue: "center",
    },
    {
      name: "captionPosition",
      title: "Caption Position",
      type: "string",
      options: {
        list: [
          { title: "Below Image", value: "below" },
          { title: "Overlay (Bottom)", value: "overlayBottom" },
          { title: "Side (Right)", value: "sideRight" },
        ],
      },
      initialValue: "below",
    },
  ],
  preview: {
    select: {
      media: "image",
      caption: "caption",
    },
    prepare(selection: Record<string, any>) {
      return {
        title: "Image",
        subtitle: selection.caption?.substring(0, 50) || "",
        media: selection.media,
      }
    },
  },
}
