"use client"

import { useState, useMemo, FormEvent, ChangeEvent } from "react"
import Input from "@modules/common/components/input"
import { HttpTypes } from "@medusajs/types"

type Props = {
  customer: HttpTypes.StoreCustomer
}

const AccountDetailsForm = ({ customer }: Props) => {
  const [firstName, setFirstName] = useState(customer.first_name ?? "")
  const [lastName, setLastName] = useState(customer.last_name ?? "")
  const [phone, setPhone] = useState(customer.phone ?? "")

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const showConfirmPassword = newPassword.length > 0

  const passwordStrength = useMemo(() => {
    if (!newPassword) {
      return { label: "", level: 0 }
    }

    let score = 0
    if (newPassword.length >= 8) score += 1
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1
    if (/\d/.test(newPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1

    if (score <= 1) {
      return { label: "WEAK", level: 0.33 }
    }
    if (score === 2 || score === 3) {
      return { label: "MEDIUM", level: 0.66 }
    }
    return { label: "STRONG", level: 1 }
  }, [newPassword])

  const isPasswordSectionValid = useMemo(() => {
    if (!newPassword && !oldPassword && !confirmPassword) {
      return true
    }

    if (newPassword.length < 8) {
      return false
    }

    if (!oldPassword) {
      return false
    }

    if (!confirmPassword || newPassword !== confirmPassword) {
      return false
    }

    return true
  }, [oldPassword, newPassword, confirmPassword])

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Allow only digits and limit length similar to checkout validation (8-13 digits)
    const digitsOnly = e.target.value.replace(/[^0-9]/g, "")
    const limited = digitsOnly.slice(0, 13)
    setPhone(limited)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!isPasswordSectionValid) {
      setError("Please fix the password fields before saving.")
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch("/api/account/details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
          email: customer.email,
          old_password: oldPassword || undefined,
          new_password: newPassword || undefined,
          confirm_password: confirmPassword || undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || "Unable to save changes.")
        setSubmitting(false)
        return
      }

      setSuccess(true)
      setSubmitting(false)
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError("Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  const disableSave = submitting

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl" data-testid="account-details-form">
      <div className="mb-8">
        <p className="text-xs uppercase mb-2">Contact Information</p>
        <div className="space-y-4">
          {/* Name row: First and Last, side-by-side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input
                type="text"
                name="first_name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input
                type="text"
                name="last_name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact row: Email and shorter Phone field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                name="email"
                value={customer.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <div className="w-full md:w-3/5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={13}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs uppercase mb-2">Change Password</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old password</label>
            <input
              type="password"
              name="old_password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              name="new_password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          {showConfirmPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repeat new password</label>
              <input
                type="password"
                name="confirm_password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          )}

          {newPassword.length > 0 && (
            <div className="mt-3">
              <div className="h-[2px] w-full bg-gray-200">
                <div
                  className="h-[2px] bg-black transition-all duration-200"
                  style={{ width: `${passwordStrength.level * 100}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] uppercase text-right">
                {passwordStrength.label}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 text-xs text-red-600" data-testid="account-details-error">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-xs text-green-600" data-testid="account-details-success">
          Changes saved.
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={disableSave}
          className="min-w-[200px] px-10 py-3 text-xs tracking-[0.15em] uppercase bg-black text-white"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}

export default AccountDetailsForm
