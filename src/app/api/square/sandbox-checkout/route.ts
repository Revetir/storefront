import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"

const SANDBOX_ITEM = {
  sku: "SQUARE-SANDBOX-TEE-TEST",
  title: "Square Sandbox Test Item",
  amountMinor: 100,
  currencyCode: "USD",
}

const SUCCESSFUL_PAYMENT_STATUSES = new Set(["APPROVED", "COMPLETED"])

const toErrorMessage = (value: unknown) => {
  if (typeof value === "string" && value.trim()) {
    return value
  }

  if (value instanceof Error && value.message) {
    return value.message
  }

  return "Unknown error"
}

const parseSquareError = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return "Square API request failed"
  }

  const record = payload as { errors?: Array<{ detail?: string; code?: string }> }
  const firstError = record.errors?.[0]
  if (!firstError) {
    return "Square API request failed"
  }

  return firstError.detail || firstError.code || "Square API request failed"
}

const isSandboxMode = () => {
  return (
    process.env.SQUARE_IS_SANDBOX === "true" ||
    process.env.SQUARE_ENVIRONMENT === "sandbox" ||
    process.env.NEXT_PUBLIC_SQUARE_IS_SANDBOX === "true"
  )
}

export async function POST(req: NextRequest) {
  try {
    const accessToken = process.env.SQUARE_ACCESS_TOKEN
    const locationId =
      process.env.SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
    const squareVersion = process.env.SQUARE_API_VERSION || "2026-01-22"

    if (!isSandboxMode()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sandbox mode is not enabled. Set SQUARE_IS_SANDBOX=true before using this test endpoint.",
        },
        { status: 400 }
      )
    }

    if (!accessToken || !locationId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing Square server configuration. Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID.",
        },
        { status: 500 }
      )
    }

    const body = (await req.json().catch(() => ({}))) as {
      sourceId?: string
      sourceType?: string
      idempotencyKey?: string
    }
    const sourceId = body.sourceId?.trim()

    if (!sourceId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing sourceId token from Square Web Payments SDK.",
        },
        { status: 400 }
      )
    }

    const createPaymentResponse = await fetch(
      "https://connect.squareupsandbox.com/v2/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Square-Version": squareVersion,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_id: sourceId,
          location_id: locationId,
          idempotency_key: body.idempotencyKey || randomUUID(),
          autocomplete: false,
          amount_money: {
            amount: SANDBOX_ITEM.amountMinor,
            currency: SANDBOX_ITEM.currencyCode,
          },
          note: "Revetir local Square sandbox checkout dry run (no order creation)",
          reference_id: SANDBOX_ITEM.sku,
          customer_details: {
            customer_initiated: true,
            seller_keyed_in: false,
          },
        }),
      }
    )

    const createPaymentPayload = await createPaymentResponse
      .json()
      .catch(() => ({}))

    if (!createPaymentResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: parseSquareError(createPaymentPayload),
          rawStatus: createPaymentResponse.status,
        },
        { status: 400 }
      )
    }

    const payment = (createPaymentPayload as any)?.payment as
      | { id?: string; status?: string; source_type?: string }
      | undefined
    const paymentStatus = String(payment?.status || "").toUpperCase()
    const wouldCreateOrder = SUCCESSFUL_PAYMENT_STATUSES.has(paymentStatus)

    let authorizationCancelled = false
    let cancellationStatus: string | null = null

    if (payment?.id && paymentStatus === "APPROVED") {
      const cancelResponse = await fetch(
        `https://connect.squareupsandbox.com/v2/payments/${payment.id}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Square-Version": squareVersion,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      )

      const cancelPayload = await cancelResponse.json().catch(() => ({}))
      if (cancelResponse.ok) {
        authorizationCancelled = true
        cancellationStatus = String(
          (cancelPayload as any)?.payment?.status || "CANCELED"
        ).toUpperCase()
      } else {
        cancellationStatus = "CANCEL_FAILED"
      }
    }

    return NextResponse.json({
      success: wouldCreateOrder,
      wouldCreateOrder,
      message: wouldCreateOrder
        ? "Payment authorized in sandbox. An order would be created in real checkout."
        : "Payment was not authorized. An order would not be created.",
      item: SANDBOX_ITEM,
      payment: {
        id: payment?.id || null,
        status: paymentStatus || null,
        sourceType: payment?.source_type || body.sourceType || null,
      },
      cleanup: {
        attemptedAuthorizationCancel: paymentStatus === "APPROVED",
        authorizationCancelled,
        cancellationStatus,
      },
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error),
      },
      { status: 500 }
    )
  }
}

