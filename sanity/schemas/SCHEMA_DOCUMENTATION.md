# Editorial Schema Documentation

This document provides comprehensive documentation for the modular Sanity CMS editorial schema.

## Overview

The editorial schema has been restructured into modular components for maintainability:

```
sanity/schemas/
├── editorials.ts          # Main document schema (imports from objects/)
├── index.ts               # Schema registry
├── objects/               # Modular content block schemas
│   ├── index.ts           # Exports all objects
│   ├── accordion.ts
│   ├── attributedQuote.ts
│   ├── authorBio.ts
│   ├── bilingualText.ts
│   ├── callout.ts
│   ├── creditsBlock.ts
│   ├── fullWidthImage.ts
│   ├── imageGrid.ts
│   ├── imageWithCaption.ts
│   ├── interview.ts
│   ├── numberedGallery.ts
│   ├── positionedText.ts
│   ├── productFeature.ts
│   ├── pullQuote.ts
│   ├── spacer.ts
│   ├── twoColumnGrid.ts
│   └── videoEmbed.ts
└── SCHEMA_DOCUMENTATION.md
```

---

## Document Fields

### Metadata Group

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | **Required.** Article title |
| `slug` | slug | **Required.** URL-friendly identifier |
| `subtitle` | string | Optional subtitle/deck |
| `category` | string | Content category (culture, fashion, music, art, market, interview, profile, lookbook) |
| `tags` | array[string] | Searchable tags |
| `author` | string | **Required.** Author name |
| `photographer` | string | Photographer credit |
| `date` | date | **Required.** Publication date |
| `featured` | boolean | Featured on homepage flag |
| `isBilingual` | boolean | Enable dual-language content |
| `secondaryLanguage` | string | Secondary language code (fr, ja, zh, ko) |

### Hero Layout Group

| Field | Type | Description |
|-------|------|-------------|
| `heroLayout` | string | Layout style (standard, split, oversized, fullBleed, overlay, blackBackground, minimal, immersive) |
| `heroTextPosition` | string | Text position for split layout (left, right) |
| `titleStyle` | string | Title display style (normal, oversized, splitLines, stacked, allCaps) |
| `titleLines` | array[string] | Individual title lines for splitLines style |
| `image` | image | Cover/hero image with alt and credit |
| `heroVideo` | file | Optional hero video |

### SEO Group

| Field | Type | Description |
|-------|------|-------------|
| `seoTitle` | string | Override title for SEO |
| `seoDescription` | text | Meta description (max 160 chars) |
| `ogImage` | image | Social sharing image |

---

## Content Blocks

### Text & Typography

#### Standard Block (`block`)
Rich text with styles: Normal, H2, H3, H4, Quote, Lead Text, Small, Caption, Dropcap

Marks:
- Decorators: Bold, Italic, Underline, Strike, Code, Highlight
- Annotations: Link, Internal Link, Footnote

#### Positioned Text (`positionedText`)
Text block with custom alignment and width.
- **position**: left, right, center
- **width**: narrow (40%), medium (60%), wide (80%), full

#### Pull Quote (`pullQuote`)
Large, visually prominent quotes.
- **style**: largeCentered, leftAligned, withBorder, minimal, oversized
- **size**: normal, large, xlarge

#### Attributed Quote (`attributedQuote`)
Quote with attribution line.
- **style**: pullQuote, blockQuote, inline

#### Bilingual Text (`bilingualText`)
Side-by-side or stacked multilingual content.
- **layout**: sideBySide, stacked, tabs
- **languages**: en, fr, ja, zh, ko

#### Callout (`callout`)
Highlighted content boxes.
- **style**: note, tip, warning, featured, quoteCard
- **backgroundColor**: lightGray, cream, black, accent, none

---

### Images & Media

#### Image with Caption (`imageWithCaption`)
Single image with enhanced caption options.
- **size**: small (50%), medium (75%), large (100%), fullBleed
- **alignment**: left, center, right
- **captionPosition**: below, overlayBottom, sideRight

#### Full Width Image (`fullWidthImage`)
Immersive full-bleed images.
- **aspectRatio**: natural, 16:9, 4:3, 1:1, 2:3
- **overlayText**: Optional text overlay
- **overlayPosition**: center, bottomLeft, bottomRight, topLeft

#### Image Grid (`imageGrid`)
Multiple images in configurable layouts.
- **layout**: twoColumn, threeColumn, fourColumn, asymmetric, masonry
- **gap**: none, small, medium, large
- **showCaptions**: boolean

#### Two-Column Grid (`twoColumnGrid`)
Image + text side by side.
- **imagePosition**: left, right
- **verticalAlign**: top, center, bottom
- **columnRatio**: equal (50/50), imageLarger (60/40), textLarger (40/60)

#### Numbered Gallery (`numberedGallery`)
Numbered image sequences (lookbook style).
- **layout**: singleColumn, twoColumn, slideshow
- **showNumbers**: boolean
- **numberStyle**: padded (01, 02), simple (1, 2), roman (I, II)
- Products can be linked to each image for shoppable content

#### Video Embed (`videoEmbed`)
Embedded videos from YouTube, Vimeo, or file upload.
- **videoType**: youtube, vimeo, file
- **layout**: fullWidth, contained, inline
- **autoplay**: boolean (muted)
- **loop**: boolean

---

### Structural & Interactive

#### Accordion (`accordion`)
Expandable content sections.
- **style**: azIndex, faq, chapters, minimal
- **allowMultipleOpen**: boolean

#### Interview (`interview`)
Structured Q&A format.
- **participants**: Array with name, role, abbreviation
- **exchanges**: Speaker + rich text content
- **style**: standard, boldNames, alternating

#### Spacer (`spacer`)
Visual separation and pacing.
- **type**: space, line, decorative, dots
- **size**: small, medium, large, xlarge

---

### Credits & Attribution

#### Author Bio (`authorBio`)
Author information block.
- **name**, **role**, **bio**, **image**
- **socialLinks**: twitter, instagram, website, linkedin

#### Credits Block (`creditsBlock`)
Extended production credits.
- **credits**: Array of role + names + optional agency
- **layout**: list, twoColumn, inline

#### Product Feature (`productFeature`)
Shoppable product showcases.
- **products**: name, brand, price, url, image, description
- **layout**: grid, horizontalScroll, list, featuredSingle
- **showPrices**: boolean

---

## Usage Examples

### Basic Editorial
```typescript
{
  title: "The Art of Minimalism",
  heroLayout: "standard",
  content: [
    { _type: "block", style: "lead", children: [...] },
    { _type: "fullWidthImage", image: {...}, aspectRatio: "16:9" },
    { _type: "block", children: [...] },
    { _type: "pullQuote", quote: "Less is more.", style: "largeCentered" }
  ]
}
```

### Fashion Editorial with Products
```typescript
{
  title: "Spring Collection",
  heroLayout: "fullBleed",
  category: "lookbook",
  content: [
    { _type: "numberedGallery", showNumbers: true, images: [
      { image: {...}, products: [{ name: "Silk Dress", brand: "Maison", price: "$890" }] }
    ]},
    { _type: "creditsBlock", credits: [
      { role: "Photography", names: ["John Doe"] },
      { role: "Styling", names: ["Jane Smith"] }
    ]}
  ]
}
```

### Interview Article
```typescript
{
  title: "In Conversation with...",
  heroLayout: "split",
  heroTextPosition: "left",
  category: "interview",
  content: [
    { _type: "interview", 
      participants: [
        { name: "SSENSE", abbreviation: "SS", role: "Interviewer" },
        { name: "Designer Name", abbreviation: "DN", role: "Designer" }
      ],
      exchanges: [
        { speaker: "SS", text: [...] },
        { speaker: "DN", text: [...] }
      ]
    }
  ]
}
```

---

## Responsive Considerations

All content blocks should be styled with mobile-first responsive design:

| Block | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| twoColumnGrid | Stack vertically | Side by side | Side by side |
| imageGrid | Single column | 2 columns | As specified |
| positionedText | Full width | As specified | As specified |
| interview | Full width | Full width | Centered container |

---

## Migration Notes

If upgrading from the previous schema:
1. Existing `attributedQuote` blocks remain compatible
2. Inline images now support `credit` field
3. New blocks can be added incrementally to existing content

---

## Adding New Content Blocks

1. Create new file in `sanity/schemas/objects/`
2. Export the schema object
3. Add export to `objects/index.ts`
4. Import in `editorials.ts` and add to content array

Example:
```typescript
// objects/newBlock.ts
export const newBlock = {
  type: "object",
  name: "newBlock",
  title: "New Block",
  fields: [...],
  preview: {...}
}
```
