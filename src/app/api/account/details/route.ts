import { NextRequest, NextResponse } from "next/server"
import { updateCustomer } from "@lib/data/customer"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      first_name,
      last_name,
      phone,
      email,
      old_password,
      new_password,
      confirm_password,
    } = body || {}

    if (!first_name || !last_name || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await updateCustomer({
      first_name,
      last_name,
      phone,
    })

    if (new_password || old_password || confirm_password) {
      if (!new_password || typeof new_password !== "string") {
        return NextResponse.json(
          { error: "New password is required" },
          { status: 400 }
        )
      }

      if (new_password.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long" },
          { status: 400 }
        )
      }

      if (!old_password || typeof old_password !== "string") {
        return NextResponse.json(
          { error: "Old password is required" },
          { status: 400 }
        )
      }

      if (!confirm_password || new_password !== confirm_password) {
        return NextResponse.json(
          { error: "Passwords do not match" },
          { status: 400 }
        )
      }

      const passwordEndpoint = process.env.MEDUSA_PASSWORD_CHANGE_ENDPOINT

      if (!passwordEndpoint) {
        return NextResponse.json(
          {
            error:
              "Password change endpoint is not configured on the server.",
          },
          { status: 500 }
        )
      }

      const passwordRes = await fetch(passwordEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          old_password,
          new_password,
        }),
      })

      if (!passwordRes.ok) {
        const data = await passwordRes.json().catch(() => null)
        return NextResponse.json(
          { error: data?.error || "Unable to update password" },
          { status: passwordRes.status },
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: "Unable to save account details" },
      { status: 500 },
    )
  }
}
