"use client"

import React from "react"

interface AfterpayButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
}

/**
 * Branded Afterpay button component using official Afterpay branding
 * Custom implementation to match full-width styling of Stripe Express Checkout buttons
 * while maintaining proper Afterpay logo proportions
 */
const AfterpayButton: React.FC<AfterpayButtonProps> = ({
  onClick,
  disabled = false,
  isLoading = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label="Cash App Afterpay"
      className="w-full relative flex items-center justify-center h-[48px] cursor-pointer border-0 bg-[#101010] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        <img
          src="/images/afterpay_pay_button.svg"
          alt="Pay with Afterpay"
          className="h-full w-auto max-w-full object-contain"
        />
      )}
    </button>
  )
}

export default AfterpayButton
