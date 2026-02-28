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

const MEDUSA_RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504])
const MEDUSA_MAX_RETRIES = 2
const MEDUSA_BASE_RETRY_DELAY_MS = 150

const isRetryableMedusaError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false
  }

  const err = error as {
    status?: number
    statusText?: string
    message?: string
    response?: { status?: number; statusText?: string }
  }

  const status = err.status ?? err.response?.status
  const statusText = (err.statusText ?? err.response?.statusText ?? "").toLowerCase()
  const message = (err.message ?? "").toLowerCase()

  if (typeof status === "number" && MEDUSA_RETRYABLE_STATUS_CODES.has(status)) {
    return true
  }

  return (
    statusText.includes("backend read error") ||
    message.includes("backend read error") ||
    message.includes("fetch failed") ||
    message.includes("network")
  )
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const originalSdkFetch = sdk.client.fetch.bind(sdk.client)

;(sdk.client as any).fetch = async <T>(...args: [string, Record<string, unknown>?]): Promise<T> => {
  for (let attempt = 0; ; attempt++) {
    try {
      return await originalSdkFetch<T>(...args)
    } catch (error) {
      if (!isRetryableMedusaError(error) || attempt >= MEDUSA_MAX_RETRIES) {
        throw error
      }

      const backoffMs =
        MEDUSA_BASE_RETRY_DELAY_MS * 2 ** attempt + Math.floor(Math.random() * 100)
      await wait(backoffMs)
    }
  }
}

// In design mode, use dummy Algolia credentials to avoid errors
const DESIGN_MODE = process.env.NEXT_PUBLIC_DESIGN_MODE === "true"

export const searchClient: SearchClient = algoliasearch(
  DESIGN_MODE ? "dummy-app-id" : (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "dummy-app-id"),
  DESIGN_MODE ? "dummy-api-key" : (process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || "dummy-api-key")
)
