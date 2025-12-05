"use client"

import { useActionState, useState } from "react"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInvalid = (
    e: React.FormEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault()
    const target = e.target as HTMLInputElement | HTMLSelectElement

    if (target.name === "email") {
      setErrors(prev => ({ ...prev, email: "Please enter your email address" }))
    } else if (target.name === "first_name") {
      setErrors(prev => ({ ...prev, first_name: "Please enter your first name" }))
    } else if (target.name === "last_name") {
      setErrors(prev => ({ ...prev, last_name: "Please enter your last name" }))
    } else if (target.name === "password") {
      setErrors(prev => ({ ...prev, password: "Please enter a password" }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-4">
        Create your account
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Members enjoy exclusive discounts and personalized service
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-4">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First name<span className="text-red-500">*</span>
            </label>
            <input
              id="first_name"
              name="first_name"
              autoComplete="given-name"
              required
              data-testid="first-name-input"
              onInvalid={handleInvalid}
              onChange={handleChange}
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errors.first_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.first_name && (
              <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last name<span className="text-red-500">*</span>
            </label>
            <input
              id="last_name"
              name="last_name"
              autoComplete="family-name"
              required
              data-testid="last-name-input"
              onInvalid={handleInvalid}
              onChange={handleChange}
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errors.last_name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.last_name && (
              <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              data-testid="email-input"
              onInvalid={handleInvalid}
              onChange={handleChange}
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              data-testid="phone-input"
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              required
              data-testid="password-input"
              onInvalid={handleInvalid}
              onChange={handleChange}
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          By creating an account, you agree to REVETIR&apos;s{" "}
          <LocalizedClientLink href="/privacy-policy" className="underline">
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink href="/terms-conditions" className="underline">
            Terms &amp; Conditions
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton
          className="w-full mt-6 !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200"
          data-testid="register-button"
        >
          Join
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
