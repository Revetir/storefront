"use client"

import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useActionState, useState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInvalid = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault()
    const target = e.target as HTMLInputElement

    if (target.name === "email") {
      setErrors(prev => ({ ...prev, email: "Please enter your email address" }))
    } else if (target.name === "password") {
      setErrors(prev => ({ ...prev, password: "Please enter your password" }))
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
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-7">Welcome back</h1>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-4">
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
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
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
        <ErrorMessage error={message} data-testid="login-error-message" />

        <SubmitButton data-testid="sign-in-button" className="w-full mt-6 !bg-black !text-white hover:!bg-neutral-900 transition-colors duration-200">
          Sign in
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Don't have an account?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Create one here
        </button>
        .
      </span>
    </div>
  )
}

export default Login
