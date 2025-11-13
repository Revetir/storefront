"use client"

import React, { useState } from "react"
import { clx } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import Modal from "@modules/common/components/modal"
import { Button } from "@medusajs/ui"

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
          <div className="mb-4">
            <p className="text-xs uppercase mb-2 font-semibold tracking-wide">EMAIL SIGNUP</p>
            <p className="text-xs text-gray-600 mb-3">
              Sign up for newsletters and personalized shopping reminders about your Wishlist and Shopping Bag.
            </p>
          </div>
        )}

        <div className={clx("space-y-4", variant === "modal" && "flex flex-col lg:flex-row lg:items-end lg:gap-4 lg:space-y-0")}>
          <div className={clx("flex-1", variant === "inline" && "w-full")}>
            <Input
              label="Email address"
              name="email"
              type="email"
              required
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              onFocus={handleEmailFocus}
            />
          </div>

          {showGenderOptions && (
            <>
              <div className={clx("flex gap-4", variant === "modal" && "lg:flex-row lg:items-center lg:mb-2")}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="menswear"
                    checked={formState.genderPreference === "menswear"}
                    onChange={(e) => setFormState({ ...formState, genderPreference: e.target.value as "menswear" | "womenswear" })}
                    className="mr-2"
                  />
                  <span className="text-sm">Menswear</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="womenswear"
                    checked={formState.genderPreference === "womenswear"}
                    onChange={(e) => setFormState({ ...formState, genderPreference: e.target.value as "menswear" | "womenswear" })}
                    className="mr-2"
                  />
                  <span className="text-sm">Womenswear</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={submitState.loading}
                className={clx("w-full uppercase text-sm", variant === "modal" && "lg:w-auto")}
              >
                {submitState.loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </>
          )}
        </div>

        {submitState.error && (
          <p className="text-red-500 text-xs mt-2">{submitState.error}</p>
        )}
      </form>
    )
  }

  if (variant === "modal") {
    return (
      <Modal isOpen={isOpen} close={close || (() => {})} size="medium">
        <Modal.Title>
          <div className="text-left pt-2 pb-4">
            <h1 className="text-2xl font-medium uppercase tracking-wide text-black">EMAIL SIGNUP</h1>
          </div>
        </Modal.Title>

        <div className="border-b border-gray-200 w-full mb-4"></div>

        <Modal.Body>
          <div className="w-full max-w-xl mx-auto px-2">
            {!submitState.success && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Sign up for newsletters and personalized shopping reminders about your Wishlist and Shopping Bag.
                </p>
              </div>
            )}
            {renderForm()}
          </div>
        </Modal.Body>
      </Modal>
    )
  }

  // Inline variant for mobile footer
  return (
    <div className="w-full py-6 px-4 bg-white">
      {renderForm()}
    </div>
  )
}

export default NewsletterSignup
