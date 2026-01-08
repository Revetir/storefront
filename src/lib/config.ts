import Medusa from "@medusajs/js-sdk"
import { 
  liteClient as algoliasearch, 
  LiteClient as SearchClient,
} from "algoliasearch/lite"

// Get backend URL from environment variables with fallback logic
const getBackendUrl = (): string => {
  // Try different environment variable names
  const backendUrl = process.env.MEDUSA_BACKEND_URL ||
                    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

  if (!backendUrl) {
    // For production, we know the URL, so let's hardcode it as a fallback
    return "https://application-production-0ced.up.railway.app"
  }

  return backendUrl
}

const MEDUSA_BACKEND_URL = getBackendUrl()

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

// In design mode, use dummy Algolia credentials to avoid errors
const DESIGN_MODE = process.env.NEXT_PUBLIC_DESIGN_MODE === "true"

export const searchClient: SearchClient = algoliasearch(
  DESIGN_MODE ? "dummy-app-id" : (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "dummy-app-id"),
  DESIGN_MODE ? "dummy-api-key" : (process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || "dummy-api-key")
)
