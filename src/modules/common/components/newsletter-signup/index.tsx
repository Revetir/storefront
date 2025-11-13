"use client"

import React, { useState } from "react"
import { clx } from "@medusajs/ui"
import NewsletterInput from "@modules/common/components/newsletter-input"
import MedusaRadio from "@modules/common/components/radio"
import Modal from "@modules/common/components/modal"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type NewsletterSignupProps = {
  variant?: "inline" | "modal"
  isOpen?: boolean
  close?: () => void
}

type FormState = {
  email: string
  genderPreference: "menswear" | "womenswear"
}

type SubmitState = {
  loading: boolean
  error: string | null
  success: boolean
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = "inline",
  isOpen = false,
  close,
}) => {
  const [formState, setFormState] = useState<FormState>({
    email: "",
    genderPreference: "menswear",
  })
  const [submitState, setSubmitState] = useState<SubmitState>({
    loading: false,
    error: null,
    success: false,
  })
  const [showGenderOptions, setShowGenderOptions] = useState(variant === "modal")

  const handleEmailFocus = () => {
    if (variant === "inline") {
      setShowGenderOptions(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formState.email) {
      setSubmitState({ loading: false, error: "Email is required", success: false })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formState.email)) {
      setSubmitState({ loading: false, error: "Please enter a valid email address", success: false })
      return
    }

    setSubmitState({ loading: true, error: null, success: false })

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formState.email,
          gender_preference: formState.genderPreference,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      setSubmitState({ loading: false, error: null, success: true })

      // Close modal after 2 seconds if in modal variant
      if (variant === "modal" && close) {
        setTimeout(() => {
          close()
          // Reset form after modal closes
          setTimeout(() => {
            setFormState({ email: "", genderPreference: "menswear" })
            setSubmitState({ loading: false, error: null, success: false })
            setShowGenderOptions(true)
          }, 300)
        }, 2000)
      }
    } catch (error) {
      setSubmitState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
        success: false,
      })
    }
  }

  const renderForm = () => {
    if (submitState.success) {
      return (
        <div className="text-center py-8">
          <p className="text-sm text-gray-700">
            Thank you. You will receive an email confirmation shortly.
          </p>
        </div>
      )
    }

    return (
      <form onSubmit={handleSubmit} className="w-full">
        {variant === "inline" && !showGenderOptions && (
          <div className="mb-4 text-center">
            <p className="text-xs uppercase mb-2 font-semibold tracking-wide">EMAIL SIGNUP</p>
            <p className="text-xs text-gray-600 mb-3">
              Sign up for newsletters and personalized shopping reminders about your Wishlist and Shopping Bag.
            </p>
          </div>
        )}

        <div className="flex flex-col items-center space-y-4">
          <NewsletterInput
            name="email"
            type="email"
            placeholder="Email address"
            required
            value={formState.email}
            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
            onFocus={handleEmailFocus}
            className="max-w-md"
          />

          {showGenderOptions && (
            <>
              <div className="flex justify-center gap-6">
                <label
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setFormState({ ...formState, genderPreference: "menswear" })}
                >
                  <MedusaRadio checked={formState.genderPreference === "menswear"} />
                  <span className="text-sm">Menswear</span>
                </label>
                <label
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setFormState({ ...formState, genderPreference: "womenswear" })}
                >
                  <MedusaRadio checked={formState.genderPreference === "womenswear"} />
                  <span className="text-sm">Womenswear</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitState.loading}
                className="w-full max-w-md border border-black bg-white text-black py-2 px-4 text-sm font-normal hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitState.loading ? "Subscribing..." : "Subscribe"}
              </button>
            </>
          )}
        </div>

        {submitState.error && (
          <p className="text-red-500 text-xs mt-2 text-center">{submitState.error}</p>
        )}
      </form>
    )
  }

  if (variant === "modal") {
    return (
      <Modal
        isOpen={isOpen}
        close={close || (() => {})}
        size="small"
        panelClassName="!fixed !bottom-32 !left-1/2 !-translate-x-1/2 !top-auto !max-h-[calc(100vh-200px)] !overflow-y-auto"
      >
        <div className="p-6">
          {!submitState.success && (
            <p className="text-sm text-gray-600 text-center mb-6">
              Sign up for new product drops and exclusive discounts.
            </p>
          )}
          {renderForm()}
          {!submitState.success && showGenderOptions && (
            <p className="text-xs text-gray-500 text-center mt-6">
              You may unsubscribe at any time.<br />
              To find out more, please visit our{" "}
              <LocalizedClientLink href="/privacy-policy" className="underline">
                Privacy Policy
              </LocalizedClientLink>
              .
            </p>
          )}
        </div>
      </Modal>
    )
  }

  // Inline variant for mobile footer
  return (
    <div className="w-full py-6 px-4 bg-white flex justify-center">
      <div className="w-full max-w-md">
        {renderForm()}
        {!submitState.success && showGenderOptions && (
          <p className="text-xs text-gray-500 text-center mt-4">
            You may unsubscribe at any time.
          </p>
        )}
      </div>
    </div>
  )
}

export default NewsletterSignup
