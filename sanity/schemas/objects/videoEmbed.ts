// Object schema: Video Embed
// For embedded videos (YouTube, Vimeo, or direct file)

export const videoEmbed = {
  type: "object",
  name: "videoEmbed",
  title: "Video Embed",
  fields: [
    {
      name: "videoType",
      title: "Video Type",
      type: "string",
      options: {
        list: [
          { title: "YouTube", value: "youtube" },
          { title: "Vimeo", value: "vimeo" },
          { title: "File Upload", value: "file" },
        ],
        layout: "radio",
      },
      initialValue: "youtube",
    },
    {
      name: "url",
      title: "Video URL",
      type: "url",
      description: "YouTube or Vimeo URL",
      hidden: ({ parent }: { parent: any }) => parent?.videoType === "file",
    },
    {
      name: "videoFile",
      title: "Video File",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }: { parent: any }) => parent?.videoType !== "file",
    },
    {
      name: "posterImage",
      title: "Poster Image",
      type: "image",
      options: { hotspot: true },
      description: "Thumbnail shown before video plays",
    },
    {
      name: "caption",
      title: "Caption",
      type: "string",
    },
    {
      name: "autoplay",
      title: "Autoplay (muted)",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "loop",
      title: "Loop Video",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Full Width", value: "fullWidth" },
          { title: "Contained", value: "contained" },
          { title: "Inline", value: "inline" },
        ],
      },
      initialValue: "fullWidth",
    },
  ],
  preview: {
    select: {
      media: "posterImage",
      caption: "caption",
      videoType: "videoType",
    },
    prepare(selection: Record<string, any>) {
      return {
        title: `Video (${selection.videoType || "youtube"})`,
        subtitle: selection.caption || "",
        media: selection.media,
      }
    },
  },
}
