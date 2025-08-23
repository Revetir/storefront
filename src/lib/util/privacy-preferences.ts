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
    console.error('Error reading privacy preferences:', error)
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
    console.error('Error saving privacy preferences:', error)
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
  if (!preferences.search) {
    console.log('Search cookies disabled - search functionality will be limited')
  }

  // Analytics cookies (future implementation)
  if (!preferences.analytics) {
    // Disable analytics tracking
    console.log('Analytics cookies disabled')
  }

  // Marketing cookies (future implementation)
  if (!preferences.marketing) {
    // Disable marketing tracking
    console.log('Marketing cookies disabled')
  }
} 