import { CategoryMetadata } from "@lib/data/categories"

/**
 * Safely extracts blurb text from category metadata
 * Follows Medusa V2 best practices for metadata access
 */
export function getCategoryBlurb(metadata?: CategoryMetadata): string | undefined {
  return metadata?.blurb?.text
}

/**
 * Safely extracts blurb text from brand metadata
 * Brands use a simple string field, not nested metadata
 */
export function getBrandBlurb(blurb?: string): string | undefined {
  return blurb
}

/**
 * Type guard to check if metadata has a valid blurb
 */
export function hasBlurb(metadata?: CategoryMetadata): boolean {
  return typeof metadata?.blurb?.text === "string" && metadata.blurb.text.length > 0
}
