"use client"

import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  computeReplyEtaSeconds,
  formatDurationHHMMSS,
} from "@modules/customer-care/utils/contact-reply-eta"

const LISTING_ISSUE_REQUEST = "I want to report a listing as inaccurate or an item as inauthentic"
const PRODUCT_DESIGNER_REQUEST = "I have a question about a product or designer"
const AUTO_RESET_INTERVAL_MS = 60 * 60 * 1000
const MIN_DISPLAY_SECONDS = 3 * 60 * 60

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    request: "",
    name: "",
    email: "",
    orderNumber: "",
    productSku: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [replyEta, setReplyEta] = useState("04:00:00")
  const replyEtaDeadlineMsRef = useRef<number>(0)
  const replyEtaBaselineMsRef = useRef<number>(0)

  useEffect(() => {
    const resetReplyEtaDeadline = () => {
      const nowUtcMs = Date.now()
      replyEtaBaselineMsRef.current = nowUtcMs
      replyEtaDeadlineMsRef.current = nowUtcMs + computeReplyEtaSeconds(nowUtcMs) * 1000
    }

    const refreshReplyEtaCountdown = () => {
      const nowMs = Date.now()
      const elapsedSinceBaselineMs = nowMs - replyEtaBaselineMsRef.current
      let remainingSeconds = Math.max(0, Math.ceil((replyEtaDeadlineMsRef.current - nowMs) / 1000))

      if (elapsedSinceBaselineMs >= AUTO_RESET_INTERVAL_MS || remainingSeconds < MIN_DISPLAY_SECONDS) {
        resetReplyEtaDeadline()
        remainingSeconds = Math.max(0, Math.ceil((replyEtaDeadlineMsRef.current - nowMs) / 1000))
      }

      setReplyEta(formatDurationHHMMSS(remainingSeconds))
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        resetReplyEtaDeadline()
        refreshReplyEtaCountdown()
      }
    }

    const handleFocus = () => {
      resetReplyEtaDeadline()
      refreshReplyEtaCountdown()
    }

    resetReplyEtaDeadline()
    refreshReplyEtaCountdown()

    const intervalId = window.setInterval(refreshReplyEtaCountdown, 1000)
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Validate email on blur
    if (name === "email" && value) {
      if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, [name]: "Please enter a valid email address" }))
      }
    }
  }

  const handleInvalid = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.preventDefault()
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

    if (target.name === "email") {
      if (!target.value) {
        setErrors(prev => ({ ...prev, [target.name]: "Please enter your email address" }))
      } else if (!validateEmail(target.value)) {
        setErrors(prev => ({ ...prev, [target.name]: "Please enter a valid email address" }))
      }
    } else {
      const label = target.labels?.[0]?.textContent?.replace(" *", "") || target.name
      setErrors(prev => ({ ...prev, [target.name]: `Please enter your ${label.toLowerCase()}` }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: "" })

    const usesProductSku =
      formData.request === LISTING_ISSUE_REQUEST || formData.request === PRODUCT_DESIGNER_REQUEST
    const orderReference = usesProductSku ? formData.productSku : formData.orderNumber

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          orderNumber: orderReference,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
        })
        setFormData({
          request: "",
          name: "",
          email: "",
          orderNumber: "",
          productSku: "",
          subject: "",
          message: "",
        })
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "An error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const usesProductSku =
    formData.request === LISTING_ISSUE_REQUEST || formData.request === PRODUCT_DESIGNER_REQUEST
  const orderFieldName = usesProductSku ? "productSku" : "orderNumber"
  const orderFieldLabel = usesProductSku ? "Product SKU" : "Order Number"

  return (
    <>
      <h1 className="text-[12px] font-medium uppercase text-black mb-4">Contact Us</h1>
      <p className="mb-8 inline-flex items-baseline gap-2 whitespace-nowrap text-[clamp(2.15rem,7vw,3.25rem)] font-medium leading-[0.94] tracking-[-0.03em] text-black">
        <span>We&apos;ll reply within</span>
        <span className="tabular-nums">{replyEta}</span>
      </p>

      {/* Contact Form */}
      <div className="bg-white p-6">
          {submitStatus.type && (
            <div
              className={`p-4 mb-6 ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-1">
                Request*
              </label>
              <select
                id="request"
                name="request"
                value={formData.request}
                onChange={handleInputChange}
                onInvalid={handleInvalid}
                required
                  className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.request ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="" disabled>How can we help you?</option>    
                <option value="I want to modify or cancel my order">I want to modify or cancel my order</option>
                <option value="I want to return my order">I want to return my order</option>                            
                <option value="I have a question about a product or designer">I have a question about a product or designer</option>
                <option value="I have a question about shipping or returns">I have a question about shipping or returns</option>
                <option value={LISTING_ISSUE_REQUEST}>{LISTING_ISSUE_REQUEST}</option>
                <option value="I want to collaborate with REVETIR">I want to collaborate with REVETIR</option>                
                <option value="My question doesn't fit into any of these categories">My question doesn't fit into any of these categories</option>
              </select>
              {errors.request && (
                <p className="text-red-500 text-xs mt-1">Please enter your request</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
              <div className="md:col-span-7">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onInvalid={handleInvalid}
                  required
                  className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">Please enter your full name</p>
                )}
              </div>

              <div className="md:col-span-3">
                <label htmlFor={orderFieldName} className="block text-sm font-medium text-gray-700 mb-1">
                  {orderFieldLabel}
                </label>
                <input
                  type="text"
                  id={orderFieldName}
                  name={orderFieldName}
                  value={formData[orderFieldName]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                onInvalid={handleInvalid}
                required
                  className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message*
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                onInvalid={handleInvalid}
                required
                rows={6}
                  className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">Please enter a message</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full uppercase bg-black text-white py-2 px-6 hover:bg-neutral-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
    </>
  )
} 
