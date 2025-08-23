import { getPrivacyPreferences } from "./privacy-preferences"

export const isSearchEnabled = (): boolean => {
  const preferences = getPrivacyPreferences()
  return preferences?.search ?? true // Default to enabled if no preferences set
}

export const getSearchClient = () => {
  if (!isSearchEnabled()) {
    // Return a mock search client that doesn't actually search
    return {
      search: async () => ({ results: [{ hits: [] }] }),
      initIndex: () => ({
        search: async () => ({ hits: [] }),
      }),
    }
  }
  
  // Return the real search client
  const { searchClient } = require("@lib/config")
  return searchClient
} 