export interface PrivacyPreferences {
  essential: boolean
  search: boolean
  analytics: boolean
  marketing: boolean
}

const PRIVACY_PREFERENCES_KEY = 'privacy-preferences'

export const getPrivacyPreferences = (): PrivacyPreferences | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(PRIVACY_PREFERENCES_KEY)
    if (stored) {
      return JSON.parse(stored) as PrivacyPreferences
    }
  } catch (error) {
    // Silent error handling
  }

  return null
}

export const savePrivacyPreferences = (preferences: PrivacyPreferences): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(PRIVACY_PREFERENCES_KEY, JSON.stringify(preferences))
  } catch (error) {
    // Silent error handling
  }
}

export const hasPrivacyPreferences = (): boolean => {
  return getPrivacyPreferences() !== null
}

export const getDefaultPrivacyPreferences = (): PrivacyPreferences => {
  return {
    essential: true, // Essential cookies are always enabled
    search: true, // Search functionality is essential for e-commerce
    analytics: false, // Currently disabled
    marketing: false, // Currently disabled
  }
}

export const shouldShowPrivacyBanner = (): boolean => {
  return !hasPrivacyPreferences()
}

// Function to actually control cookie usage based on preferences
export const applyPrivacyPreferences = (preferences: PrivacyPreferences): void => {
  if (typeof window === 'undefined') {
    return
  }

  // Essential cookies are always enabled (handled by Medusa)

  // Search cookies (Algolia) - handled by search-privacy.ts
  // Analytics cookies (future implementation)
  // Marketing cookies (future implementation)
} 