"use client"

import React from "react"
import { usePrivacyChoicesContext } from "@lib/context/privacy-choices-context"

interface PrivacyChoicesTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const PrivacyChoicesTrigger: React.FC<PrivacyChoicesTriggerProps> = ({
  children,
  className,
  onClick,
}) => {
  const { openPrivacyChoices } = usePrivacyChoicesContext()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    openPrivacyChoices()
    onClick?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  )
}

export default PrivacyChoicesTrigger 