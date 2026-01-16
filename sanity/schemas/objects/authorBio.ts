// Object schema: Author Bio Block
// For author information and credits at end of articles

export const authorBio = {
  type: "object",
  name: "authorBio",
  title: "Author Bio",
  fields: [
    {
      name: "name",
      title: "Author Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "role",
      title: "Role",
      type: "string",
      description: "e.g., 'Writer', 'Contributing Editor'",
    },
    {
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 3,
    },
    {
      name: "image",
      title: "Author Photo",
      type: "image",
      options: { hotspot: true },
    },
    {
      name: "socialLinks",
      title: "Social Links",
      type: "array",
      of: [
        {
          type: "object",
          name: "socialLink",
          fields: [
            {
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "Twitter/X", value: "twitter" },
                  { title: "Instagram", value: "instagram" },
                  { title: "Website", value: "website" },
                  { title: "LinkedIn", value: "linkedin" },
                ],
              },
            },
            { name: "url", title: "URL", type: "url" },
          ],
          preview: {
            select: { title: "platform" },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "image",
    },
  },
}
