# Editorial Content Migration Guide

This guide helps you transfer your hardcoded articles to Sanity.

## Overview

Your current articles in `src/lib/data/editorials.ts` use inline HTML with styles. In Sanity, you'll use **Portable Text** (a structured rich text format) and styling is handled by the `PortableTextRenderer` component.

## Block Types Available

When editing in Sanity Studio, you have these formatting options:

| Style | Use For | Visual Result |
|-------|---------|---------------|
| **Normal** | Body paragraphs | 18px justified text with generous line height |
| **H2** | Major section headers | 24px bold, left-aligned |
| **H3** | Subsection headers | 20px bold, left-aligned |
| **Lead Text** | Opening statements | 40px centered, prominent intro text |
| **Quote** | Block quotes | Centered italic with borders |
| **Pull Quote** | Featured quotes with attribution | Centered, bordered, italic |

## Inline Formatting

- **Bold** → Use for Chinese characters (新中式) and key terms
- *Italic* → Use for emphasis and foreign terms
- [Links](url) → Use for designer websites and references

---

## Article 1: "The REVETIR Introduction to Neo-Chinese Fashion"

### Metadata to Enter in Sanity:

- **Title**: The REVETIR Introduction to Neo-Chinese Fashion
- **Slug**: introduction-to-neo-chinese-fashion
- **Subtitle**: Exploring the fusion of traditional Chinese aesthetics with contemporary design
- **Author**: Bei Hua
- **Date**: 2025-07-23
- **Featured**: Yes (check this box)
- **Cover Image**: Upload `/images/Neo_Chinese_Fashion_Cover.jpg`

### Content Structure:

1. **Lead Text** block:
   > Right now, there's **nowhere else** in the world where fashion is as *spiritual* and *generational* as it is in China.

2. **Normal** paragraph:
   > On one hand, Chinese ideas and traditions are thousands of years old — protected by a nationalist identity that remains strong despite the increasing influence of globalization. But China is also a country of 1.4 billion and growing, and a rapidly modernizing country, which introduces new tastes and preferences that are constantly being refreshed. This dynamic cultural interplay has defined a new Chinese design ethos — **新中式** or Neo-Chinese style — which seeks to tastefully modernize heritage, without damaging its authenticity...

3. **Normal** paragraph:
   > What exactly makes a design 'Neo-Chinese', and more importantly, good and Neo-Chinese? Good Neo-Chinese design isn't just about replicating symbols of tradition in some arbitrarily modern way...

4. **Normal** paragraph:
   > To truly understand Neo-Chinese fashion, we must first acknowledge its deep historical roots. Chinese clothing traditions span over 5,000 years...

5. **Image**: Upload `/images/neo_chinese_fashion.png`
   - Alt text: "Model wearing Neo-Chinese Fashion"

6. **Normal** paragraph:
   > The philosophy of Neo-Chinese design is built upon three fundamental principles: **和谐 (harmony)**, **含蓄 (subtlety)**, and **传承 (heritage)**...

7. **Normal** paragraph:
   > The technical language of Neo-Chinese fashion includes several key elements...

8. **H2** heading:
   > CONTEMPORARY MASTERS OF NEO-CHINESE FASHION

9. **Normal** paragraph about Ziggy Chen (include link to https://ziggychen.com)

10. **Normal** paragraph about Wang Fengchen (include link to https://fengchenwang.com)

11. **Normal** paragraph about Zhu Chongyun (include link to https://zhuchongyun.com)

12. **Image**: Upload `/images/neo_chinese_fashion_grid.png`

13. **Normal** paragraphs for remaining content...

14. **Pull Quote** block:
    > "Fashion is so much more about relationships than being strictly about garments. I'm not as concerned about what's on the surface, but more about what lies underneath — the inner relationship one has, it's something that's invisible. Fashion can act as a tool to explore the world."
    > — Ziggy Chen

15. **Normal** paragraph (closing):
    > REVETIR is pleased to present a curation of the most innovative and exciting Chinese fashion brands, [available now.](/store)

---

## Article 2: "The Japanese Revolution in Paris Fashion"

### Metadata to Enter in Sanity:

- **Title**: The Japanese Revolution in Paris Fashion
- **Slug**: japanese-revolution-paris-fashion
- **Subtitle**: Tracing the background and philosophy behind the most globally influential Japanese designers ever
- **Author**: Yuniwa Kawamura
- **Date**: 2024-07-15
- **Featured**: Yes
- **Cover Image**: Upload `/images/Japanese_Revolution_Paris_Cover.png`

### Content Structure:

1. **Normal** paragraph (italic disclaimer):
   > *This excerpt from "The Japanese Revolution in Paris Fashion" (Berg 2004) was presented at the international symposium "Cultural Difference and the Creative Processes"...*

2. **Normal** paragraph:
   > I would like to introduce five Japanese designers who are most famous in the West, especially in France...

3. **H2** heading:
   > KENZO

4. **Normal** paragraphs about Kenzo's background and contributions...

5. **H2** heading:
   > ISSEY MIYAKE, YOHJI YAMAMOTO AND REI KAWAKUBO

6. **Normal** paragraphs about the avant-garde designers...

7. **H3** heading:
   > (1) Redefining Sartorial Conventions

8. **Normal** paragraphs...

9. **H3** heading:
   > (2) Using New Tools and Techniques

10. **Normal** paragraphs...

11. **H3** heading:
    > (3) Redefining the Nature of Fashion and the Concept of Beauty

12. **Normal** paragraphs...

13. **H2** heading:
    > HANAE MORI

14. **Normal** paragraphs about Hanae Mori...

15. **H2** heading:
    > CONCLUSION: MARGINALITY AS AN ASSET

16. **Normal** paragraphs for conclusion...

---

## Tips for Data Entry

1. **Copy text directly** from the original HTML, removing all `<p>`, `<span>`, and `style` tags
2. **Preserve bold text** by selecting and making it bold in Sanity
3. **Chinese characters** like 新中式 should be bold
4. **Links** should be added using the link annotation
5. **Images** need to be uploaded to Sanity — they won't reference local paths

## After Migration

Once you've entered the content in Sanity:

1. Set **Featured** to `true` for articles you want on the homepage
2. The old `src/lib/data/editorials.ts` file can be deleted
3. Your pages will automatically fetch from Sanity

## Styling Changes

If you want to adjust how content looks, edit:
- `src/lib/sanity/PortableTextRenderer.tsx` — controls all text styling
- The Tailwind classes define colors, sizes, spacing
