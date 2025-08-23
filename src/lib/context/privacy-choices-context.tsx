"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { usePrivacyChoices } from "@lib/hooks/use-privacy-choices"
import PrivacyChoicesModal from "@modules/common/components/privacy-choices-modal"

interface PrivacyChoicesContextType {
  openPrivacyChoices: () => void
}

const PrivacyChoicesContext = createContext<PrivacyChoicesContextType | null>(null)

interface PrivacyChoicesProviderProps {
  children: ReactNode
}

export const PrivacyChoicesProvider: React.FC<PrivacyChoicesProviderProps> = ({ 
  children 
}) => {
  const { isOpen, open, close } = usePrivacyChoices()

  const openPrivacyChoices = () => {
    open()
  }

  return (
    <PrivacyChoicesContext.Provider value={{ openPrivacyChoices }}>
      {children}
      <PrivacyChoicesModal isOpen={isOpen} close={close} />
    </PrivacyChoicesContext.Provider>
  )
}

export const usePrivacyChoicesContext = () => {
  const context = useContext(PrivacyChoicesContext)
  if (!context) {
    throw new Error("usePrivacyChoicesContext must be used within a PrivacyChoicesProvider")
  }
  return context
} 