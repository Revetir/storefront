import { sanityClient } from "./client"

// Types
export interface SanityEditorial {
  _id: string
  slug: string
  title: string
  subtitle?: string
  category?: string
  tags?: string[]
  author: string
  photographer?: string
  date: string
  featured?: boolean
  isBilingual?: boolean
  secondaryLanguage?: string
  heroLayout?: 'standard' | 'split' | 'oversized' | 'fullBleed' | 'overlay' | 'blackBackground' | 'minimal' | 'immersive'
  heroTextPosition?: 'left' | 'right'
  titleStyle?: 'normal' | 'oversized' | 'splitLines' | 'stacked' | 'allCaps'
  titleLines?: string[]
  image?: {
    asset: {
      _ref: string
      url: string
    }
    alt?: string
    credit?: string
  }
  heroVideo?: {
    asset: {
      url: string
    }
  }
  content: any[] // Portable Text blocks
  seoTitle?: string
  seoDescription?: string
}

export interface SanitySpotlight {
  _id: string
  // Core fields (used on homepage and editorial page)
  title: string
  subtitle?: string
  ctaText: string
  isActive: boolean
  slug: string
  category?: string
  tags?: string[]
  author: string
  photographer?: string
  date: string
  isBilingual?: boolean
  secondaryLanguage?: string
  heroLayout?: 'standard' | 'split' | 'oversized' | 'fullBleed' | 'overlay' | 'blackBackground' | 'minimal' | 'immersive'
  heroTextPosition?: 'left' | 'right'
  titleStyle?: 'normal' | 'oversized' | 'splitLines' | 'stacked' | 'allCaps'
  titleLines?: string[]
  image?: {
    asset: {
      _ref: string
      url: string
    }
    alt?: string
    credit?: string
  }
  heroVideo?: {
    asset: {
      url: string
    }
  }
  content?: any[]
  seoTitle?: string
  seoDescription?: string
  ogImage?: {
    asset?: {
      url: string
    }
  }
}

export interface SanityStory {
  _id: string
  slug: string
  title: string
  subtitle?: string
  category?: string
  tags?: string[]
  author: string
  photographer?: string
  date: string
  featured?: boolean
  isBilingual?: boolean
  secondaryLanguage?: string
  heroLayout?: string
  heroTextPosition?: string
  titleStyle?: string
  titleLines?: string[]
  image?: {
    asset?: {
      _ref: string
      url: string
    }
    alt?: string
    credit?: string
  }
  heroVideo?: {
    asset?: {
      url: string
    }
  }
  content?: any[]
  seoTitle?: string
  seoDescription?: string
  ogImage?: {
    asset?: {
      url: string
    }
  }
  externalUrl?: string
}

// Queries
const editorialFields = `
  _id,
  "slug": slug.current,
  title,
  subtitle,
  category,
  tags,
  author,
  photographer,
  date,
  featured,
  isBilingual,
  secondaryLanguage,
  heroLayout,
  heroTextPosition,
  titleStyle,
  titleLines,
  image {
    asset-> {
      _ref,
      url
    },
    alt,
    credit
  },
  heroVideo {
    asset-> {
      url
    }
  },
  content,
  seoTitle,
  seoDescription
`

export async function getEditorials(): Promise<SanityEditorial[]> {
  return sanityClient.fetch(
    `*[_type == "editorials"] | order(date desc) {
      ${editorialFields}
    }`
  )
}

export async function getEditorialBySlug(slug: string): Promise<SanityEditorial | null> {
  return sanityClient.fetch(
    `*[_type == "editorials" && slug.current == $slug][0] {
      ${editorialFields}
    }`,
    { slug }
  )
}

export async function getFeaturedEditorials(limit: number = 2): Promise<SanityEditorial[]> {
  return sanityClient.fetch(
    `*[_type == "editorials" && featured == true] | order(date desc)[0...$limit] {
      ${editorialFields}
    }`,
    { limit }
  )
}

const spotlightFields = `
  _id,
  title,
  subtitle,
  ctaText,
  isActive,
  "slug": slug.current,
  category,
  tags,
  author,
  photographer,
  date,
  isBilingual,
  secondaryLanguage,
  heroLayout,
  heroTextPosition,
  titleStyle,
  titleLines,
  image {
    asset-> {
      _ref,
      url
    },
    alt,
    credit
  },
  heroVideo {
    asset-> {
      url
    }
  },
  content,
  seoTitle,
  seoDescription,
  ogImage {
    asset-> {
      url
    }
  }
`

export async function getSpotlight(): Promise<SanitySpotlight | null> {
  return sanityClient.fetch(
    `*[_type == "spotlights" && isActive == true][0] {
      ${spotlightFields}
    }`
  )
}

export async function getSpotlightBySlug(slug: string): Promise<SanitySpotlight | null> {
  return sanityClient.fetch(
    `*[_type == "spotlights" && slug.current == $slug][0] {
      ${spotlightFields}
    }`,
    { slug }
  )
}

export async function getStories(limit: number = 3): Promise<SanityStory[]> {
  return sanityClient.fetch(
    `*[_type == "stories"] | order(date desc)[0...$limit] {
      _id,
      "slug": slug.current,
      title,
      subtitle,
      category,
      tags,
      author,
      photographer,
      date,
      featured,
      isBilingual,
      secondaryLanguage,
      heroLayout,
      heroTextPosition,
      titleStyle,
      titleLines,
      image {
        asset-> {
          _ref,
          url
        },
        alt,
        credit
      },
      heroVideo {
        asset-> {
          url
        }
      },
      content,
      seoTitle,
      seoDescription,
      ogImage {
        asset-> {
          url
        }
      }
    }`,
    { limit }
  )
}

export async function getStoryBySlug(slug: string): Promise<SanityStory | null> {
  return sanityClient.fetch(
    `*[_type == "stories" && slug.current == $slug][0] {
      _id,
      "slug": slug.current,
      title,
      subtitle,
      category,
      tags,
      author,
      photographer,
      date,
      featured,
      isBilingual,
      secondaryLanguage,
      heroLayout,
      heroTextPosition,
      titleStyle,
      titleLines,
      image {
        asset-> {
          _ref,
          url
        },
        alt,
        credit
      },
      heroVideo {
        asset-> {
          url
        }
      },
      content,
      seoTitle,
      seoDescription,
      ogImage {
        asset-> {
          url
        }
      }
    }`,
    { slug }
  )
}

export async function getAllStories(): Promise<SanityStory[]> {
  return sanityClient.fetch(
    `*[_type == "stories"] | order(date desc) {
      _id,
      "slug": slug.current,
      title,
      subtitle,
      category,
      tags,
      author,
      photographer,
      date,
      featured,
      isBilingual,
      secondaryLanguage,
      heroLayout,
      heroTextPosition,
      titleStyle,
      titleLines,
      image {
        asset-> {
          _ref,
          url
        },
        alt,
        credit
      },
      heroVideo {
        asset-> {
          url
        }
      },
      content,
      seoTitle,
      seoDescription,
      ogImage {
        asset-> {
          url
        }
      }
    }`
  )
}

export async function getAllSpotlights(): Promise<SanitySpotlight[]> {
  return sanityClient.fetch(
    `*[_type == "spotlights"] | order(date desc) {
      ${spotlightFields}
    }`
  )
}
