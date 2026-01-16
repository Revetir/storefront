// Spotlight schema for Sanity Studio
// Full editorial content type that can be featured on the homepage
// Combines homepage display fields with complete editorial content

export default {
  name: "spotlights",
  title: "Spotlights",
  type: "document",
  groups: [
    { name: "homepage", title: "Homepage Display", default: true },
    { name: "content", title: "Content" },
    { name: "hero", title: "Hero Layout" },
    { name: "meta", title: "Metadata" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // ============== HOMEPAGE DISPLAY & CORE INFO ==============
    {
      name: "title",
      title: "Title",
      type: "string",
      group: "homepage",
      description: "Displayed as the large headline on homepage and as the title on the editorial page",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "subtitle",
      title: "Subtitle",
      type: "text",
      group: "homepage",
      description: "Displayed below the title on homepage and on the editorial page",
    },
    {
      name: "ctaText",
      title: "CTA Button Text",
      type: "string",
      group: "homepage",
      description: "Text for the call-to-action button on homepage",
      initialValue: "VIEW EDITORIAL",
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      group: "homepage",
      description: "Only one spotlight should be active at a time",
      initialValue: false,
    },

    // ============== METADATA ==============
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "meta",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      group: "meta",
      options: {
        list: [
          { title: "Culture", value: "culture" },
          { title: "Fashion", value: "fashion" },
          { title: "Music", value: "music" },
          { title: "Art", value: "art" },
          { title: "Market", value: "market" },
          { title: "Interview", value: "interview" },
          { title: "Profile", value: "profile" },
          { title: "Lookbook", value: "lookbook" },
        ],
      },
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      group: "meta",
      options: { layout: "tags" },
    },
    {
      name: "author",
      title: "Author",
      type: "string",
      group: "meta",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "photographer",
      title: "Photographer",
      type: "string",
      group: "meta",
    },
    {
      name: "date",
      title: "Publication Date",
      type: "date",
      group: "meta",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "isBilingual",
      title: "Bilingual Content",
      type: "boolean",
      group: "meta",
      initialValue: false,
      description: "Enable for articles with dual-language content",
    },
    {
      name: "secondaryLanguage",
      title: "Secondary Language",
      type: "string",
      group: "meta",
      options: {
        list: [
          { title: "French", value: "fr" },
          { title: "Japanese", value: "ja" },
          { title: "Chinese", value: "zh" },
          { title: "Korean", value: "ko" },
        ],
      },
      hidden: ({ parent }: { parent: any }) => !parent?.isBilingual,
    },

    // ============== HERO LAYOUT ==============
    {
      name: "heroLayout",
      title: "Hero Layout Style",
      type: "string",
      group: "hero",
      options: {
        list: [
          { title: "Standard (Image Above Title)", value: "standard" },
          { title: "Split (Text + Image Side by Side)", value: "split" },
          { title: "Oversized Title (Large Typography)", value: "oversized" },
          { title: "Full Bleed Image", value: "fullBleed" },
          { title: "Text Overlay on Image", value: "overlay" },
          { title: "Black Background", value: "blackBackground" },
          { title: "Minimal (Title Only)", value: "minimal" },
          { title: "Immersive (Full Screen)", value: "immersive" },
        ],
        layout: "radio",
      },
      initialValue: "standard",
    },
    {
      name: "heroTextPosition",
      title: "Text Position (for Split Layout)",
      type: "string",
      group: "hero",
      options: {
        list: [
          { title: "Left (Image on Right)", value: "left" },
          { title: "Right (Image on Left)", value: "right" },
        ],
        layout: "radio",
      },
      initialValue: "left",
      hidden: ({ parent }: { parent: any }) => parent?.heroLayout !== "split",
    },
    {
      name: "titleStyle",
      title: "Title Display Style",
      type: "string",
      group: "hero",
      options: {
        list: [
          { title: "Normal", value: "normal" },
          { title: "Oversized (Full Width)", value: "oversized" },
          { title: "Split Lines (Break into Multiple Lines)", value: "splitLines" },
          { title: "Stacked", value: "stacked" },
          { title: "All Caps", value: "allCaps" },
        ],
        layout: "radio",
      },
      initialValue: "normal",
    },
    {
      name: "titleLines",
      title: "Title Lines (for Split Lines style)",
      type: "array",
      of: [{ type: "string" }],
      group: "hero",
      description: "Each line of the title displayed separately",
      hidden: ({ parent }: { parent: any }) => parent?.titleStyle !== "splitLines",
    },
    {
      name: "image",
      title: "Cover/Hero Image",
      type: "image",
      group: "hero",
      options: {
        hotspot: true,
      },
      fields: [
        { name: "alt", title: "Alt Text", type: "string" },
        { name: "credit", title: "Photo Credit", type: "string" },
      ],
    },
    {
      name: "heroVideo",
      title: "Hero Video (Optional)",
      type: "file",
      group: "hero",
      options: { accept: "video/*" },
      description: "Video to use instead of or alongside hero image",
    },

    // ============== CONTENT ==============
    {
      name: "content",
      group: "content",
      title: "Content",
      type: "array",
      of: [
        // Standard text block with rich formatting
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
            { title: "Lead Text", value: "lead" },
            { title: "Small", value: "small" },
            { title: "Caption", value: "caption" },
            { title: "Dropcap", value: "dropcap" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Underline", value: "underline" },
              { title: "Strike", value: "strike-through" },
              { title: "Code", value: "code" },
              { title: "Highlight", value: "highlight" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  { name: "href", type: "url", title: "URL" },
                  { name: "blank", type: "boolean", title: "Open in new tab", initialValue: true },
                ],
              },
              {
                name: "internalLink",
                type: "object",
                title: "Internal Link",
                fields: [
                  { name: "reference", type: "reference", to: [{ type: "editorials" }, { type: "spotlights" }] },
                ],
              },
              {
                name: "footnote",
                type: "object",
                title: "Footnote",
                fields: [
                  { name: "note", type: "text", title: "Footnote Text" },
                ],
              },
            ],
          },
        },
        // Basic inline image
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Alt Text", type: "string" },
            { name: "caption", title: "Caption", type: "string" },
            { name: "credit", title: "Photo Credit", type: "string" },
          ],
        },
        // All modular content blocks (referenced by type name)
        { type: "attributedQuote" },
        { type: "twoColumnGrid" },
        { type: "imageGrid" },
        { type: "positionedText" },
        { type: "fullWidthImage" },
        { type: "videoEmbed" },
        { type: "accordion" },
        { type: "interview" },
        { type: "numberedGallery" },
        { type: "authorBio" },
        { type: "creditsBlock" },
        { type: "spacer" },
        { type: "bilingualText" },
        { type: "callout" },
        { type: "pullQuote" },
        { type: "productFeature" },
        { type: "imageWithCaption" },
        { type: "hoverRevealGallery" },
      ],
    },

    // ============== SEO ==============
    {
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
      description: "Override the default title for SEO",
    },
    {
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 3,
      group: "seo",
      validation: (Rule: any) => Rule.max(160),
    },
    {
      name: "ogImage",
      title: "Open Graph Image",
      type: "image",
      group: "seo",
      description: "Image for social sharing (defaults to hero image)",
    },
  ],
  preview: {
    select: {
      title: "title",
      author: "author",
      media: "image",
      isActive: "isActive",
    },
    prepare(selection: Record<string, any>) {
      const { title, author, media, isActive } = selection
      return {
        title: title || 'Untitled',
        subtitle: `${isActive ? '✓ Active | ' : ''}${author ? `By ${author}` : ''}`,
        media,
      }
    },
  },
}
