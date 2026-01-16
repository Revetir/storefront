// Object schema: Numbered Gallery
// For numbered image sequences with captions (lookbook style)

export const numberedGallery = {
  type: "object",
  name: "numberedGallery",
  title: "Numbered Gallery",
  fields: [
    {
      name: "title",
      title: "Gallery Title",
      type: "string",
    },
    {
      name: "images",
      title: "Gallery Images",
      type: "array",
      of: [
        {
          type: "object",
          name: "galleryImage",
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule: any) => Rule.required(),
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
            },
            {
              name: "products",
              title: "Featured Products",
              type: "array",
              of: [
                {
                  type: "object",
                  name: "featuredProduct",
                  fields: [
                    { name: "name", title: "Product Name", type: "string" },
                    { name: "brand", title: "Brand", type: "string" },
                    { name: "price", title: "Price", type: "string" },
                    { name: "url", title: "Product URL", type: "url" },
                  ],
                  preview: {
                    select: { title: "name", subtitle: "brand" },
                  },
                },
              ],
              description: "Shoppable product links for this image",
            },
          ],
          preview: {
            select: { media: "image", caption: "caption" },
            prepare(selection: Record<string, any>) {
              return {
                title: selection.caption?.substring(0, 40) || "Image",
                media: selection.media,
              }
            },
          },
        },
      ],
    },
    {
      name: "layout",
      title: "Gallery Layout",
      type: "string",
      options: {
        list: [
          { title: "Single Column", value: "singleColumn" },
          { title: "Two Column Grid", value: "twoColumn" },
          { title: "Slideshow", value: "slideshow" },
        ],
      },
      initialValue: "singleColumn",
    },
    {
      name: "showNumbers",
      title: "Show Numbers",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "numberStyle",
      title: "Number Style",
      type: "string",
      options: {
        list: [
          { title: "01, 02, 03...", value: "padded" },
          { title: "1, 2, 3...", value: "simple" },
          { title: "Roman (I, II, III...)", value: "roman" },
        ],
      },
      initialValue: "padded",
      hidden: ({ parent }: { parent: any }) => !parent?.showNumbers,
    },
  ],
  preview: {
    select: {
      title: "title",
      images: "images",
    },
    prepare(selection: Record<string, any>) {
      const count = selection.images?.length || 0
      return {
        title: selection.title || "Numbered Gallery",
        subtitle: `${count} images`,
      }
    },
  },
}
