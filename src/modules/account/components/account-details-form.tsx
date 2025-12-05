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

  const disableSave =
    submitting ||
    !firstName.trim() ||
    !lastName.trim() ||
    !phone.trim() ||
    !isPasswordSectionValid

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl" data-testid="account-details-form">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.15em] mb-2">Account Information</p>
        <div className="space-y-4">
          {/* Name row: First and Last, side-by-side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First name"
              name="first_name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last name"
              name="last_name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Contact row: Email and shorter Phone field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <Input
              label="Email address"
              name="email"
              type="email"
              required
              value={customer.email}
              disabled
              className="pt-4 pb-1 block w-full h-11 px-4 mt-0 bg-gray-50 border border-gray-300 text-gray-500 appearance-none focus:outline-none focus:ring-0 focus:shadow-none"
            />
            <div className="w-full md:w-3/5">
              <Input
                label="Phone"
                name="phone"
                required
                value={phone}
                onChange={handlePhoneChange}
                maxLength={13}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.15em] mb-2">Account Password</p>
        <div className="space-y-4">
          <Input
            label="Old password"
            name="old_password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            label="New password"
            name="new_password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {showConfirmPassword && (
            <Input
              label="Repeat new password"
              name="confirm_password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}

          {newPassword.length > 0 && (
            <div className="mt-3">
              <div className="h-[2px] w-full bg-gray-200">
                <div
                  className="h-[2px] bg-black transition-all duration-200"
                  style={{ width: `${passwordStrength.level * 100}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] tracking-[0.15em] uppercase text-right">
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
          className="min-w-[200px] px-10 py-3 text-xs tracking-[0.15em] uppercase bg-black text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}

export default AccountDetailsForm
