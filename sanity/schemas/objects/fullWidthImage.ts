// Object schema: Full Width Image
// For immersive, full-bleed images with optional overlays

export const fullWidthImage = {
  type: "object",
  name: "fullWidthImage",
  title: "Full Width Image",
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
      type: "string",
    },
    {
      name: "credit",
      title: "Photo Credit",
      type: "string",
      description: "e.g., '© Kevin J. Miyazaki 2024' or 'Courtesy Anna Sui'",
    },
    {
      name: "aspectRatio",
      title: "Aspect Ratio",
      type: "string",
      options: {
        list: [
          { title: "Natural", value: "natural" },
          { title: "16:9 (Cinematic)", value: "16:9" },
          { title: "4:3", value: "4:3" },
          { title: "1:1 (Square)", value: "1:1" },
          { title: "2:3 (Portrait)", value: "2:3" },
        ],
      },
      initialValue: "natural",
    },
    {
      name: "overlayText",
      title: "Overlay Text",
      type: "string",
      description: "Optional text overlay on the image",
    },
    {
      name: "overlayPosition",
      title: "Overlay Position",
      type: "string",
      options: {
        list: [
          { title: "Center", value: "center" },
          { title: "Bottom Left", value: "bottomLeft" },
          { title: "Bottom Right", value: "bottomRight" },
          { title: "Top Left", value: "topLeft" },
        ],
      },
      initialValue: "center",
      hidden: ({ parent }: { parent: any }) => !parent?.overlayText,
    },
  ],
  preview: {
    select: {
      media: "image",
      caption: "caption",
    },
    prepare(selection: Record<string, any>) {
      return {
        title: "Full Width Image",
        subtitle: selection.caption || "",
        media: selection.media,
      }
    },
  },
}
