import Medusa from "@medusajs/js-sdk"
import { 
  liteClient as algoliasearch, 
  LiteClient as SearchClient,
} from "algoliasearch/lite"

// Get backend URL from environment variables
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL

if (!MEDUSA_BACKEND_URL) {
  throw new Error("MEDUSA_BACKEND_URL environment variable is required")
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

export const searchClient: SearchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "", 
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || ""
)
