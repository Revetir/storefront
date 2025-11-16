"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    request: "",
    name: "",
    email: "",
    orderNumber: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
        })
        setFormData({ request: "", name: "", email: "", orderNumber: "", subject: "", message: "" })
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

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-sm text-gray-600 text-left">
        To view and manage your order, including requesting returns, please visit your Account Orders. For all other inquiries, send us an email using the form below.
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
                Request *
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
                <option value="I want to return an order">I want to return an order</option>
                <option value="I have a question about a product or designer">I have a question about a product or designer</option>
                <option value="I have a question about shipping or returns">I have a question about shipping or returns</option>
                <option value="I want to collaborate with Revetir">I want to collaborate with Revetir</option>
                <option value="I have a general comment">I have a general comment</option>
                <option value="My question doesn't fit into any of these categories">My question doesn't fit into any of these categories</option>
                <option value="My request is URGENT">My request is URGENT</option>
                <option value="I want to delete my account">I want to delete my account</option>
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
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
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
              className="w-full uppercase bg-black text-white py-2 px-6 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
    </>
  )
} 