"use client"

import React from "react"
import { isSearchEnabled } from "@lib/util/search-privacy"
import { usePrivacyChoicesContext } from "@lib/context/privacy-choices-context"

const SearchDisabledBanner: React.FC = () => {
  const { openPrivacyChoices } = usePrivacyChoicesContext()
  
  if (isSearchEnabled()) {
    return null
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Search functionality is limited
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Search cookies are currently disabled. To enable full search functionality, 
              please update your privacy preferences.
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={openPrivacyChoices}
              className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100 px-3 py-2 rounded-md text-sm font-medium border border-yellow-300 transition-colors"
            >
              Update Privacy Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchDisabledBanner 