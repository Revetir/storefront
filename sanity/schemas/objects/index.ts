// Object schemas index
// Central export for all editorial content block types

export { attributedQuote } from './attributedQuote'
export { twoColumnGrid } from './twoColumnGrid'
export { imageGrid } from './imageGrid'
export { positionedText } from './positionedText'
export { fullWidthImage } from './fullWidthImage'
export { videoEmbed } from './videoEmbed'
export { accordion } from './accordion'
export { interview } from './interview'
export { numberedGallery } from './numberedGallery'
export { authorBio } from './authorBio'
export { creditsBlock } from './creditsBlock'
export { spacer } from './spacer'
export { bilingualText } from './bilingualText'
export { callout } from './callout'
export { pullQuote } from './pullQuote'
export { productFeature } from './productFeature'
export { imageWithCaption } from './imageWithCaption'
export { hoverRevealGallery } from './hoverRevealGallery'

// Re-export all as array for easy registration
import { attributedQuote } from './attributedQuote'
import { twoColumnGrid } from './twoColumnGrid'
import { imageGrid } from './imageGrid'
import { positionedText } from './positionedText'
import { fullWidthImage } from './fullWidthImage'
import { videoEmbed } from './videoEmbed'
import { accordion } from './accordion'
import { interview } from './interview'
import { numberedGallery } from './numberedGallery'
import { authorBio } from './authorBio'
import { creditsBlock } from './creditsBlock'
import { spacer } from './spacer'
import { bilingualText } from './bilingualText'
import { callout } from './callout'
import { pullQuote } from './pullQuote'
import { productFeature } from './productFeature'
import { imageWithCaption } from './imageWithCaption'
import { hoverRevealGallery } from './hoverRevealGallery'

export const editorialObjects = [
  attributedQuote,
  twoColumnGrid,
  imageGrid,
  positionedText,
  fullWidthImage,
  videoEmbed,
  accordion,
  interview,
  numberedGallery,
  authorBio,
  creditsBlock,
  spacer,
  bilingualText,
  callout,
  pullQuote,
  productFeature,
  imageWithCaption,
  hoverRevealGallery,
]
