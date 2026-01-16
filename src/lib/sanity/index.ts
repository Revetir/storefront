export { sanityClient, urlFor } from "./client"
export {
  getEditorials,
  getEditorialBySlug,
  getFeaturedEditorials,
  getSpotlight,
  getSpotlightBySlug,
  getStories,
  getStoryBySlug,
  getAllStories,
  getAllSpotlights,
  type SanityEditorial,
  type SanitySpotlight,
  type SanityStory,
} from "./queries"
export { default as PortableTextRenderer } from "./PortableTextRenderer"
