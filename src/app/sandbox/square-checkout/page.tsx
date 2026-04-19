"use client"

import {
  formatSquareDisplayAmount,
  loadSquareScript,
  readSquareTokenOrThrow,
  type SquareMethodInstance,
  type SquarePayments,
} from "@lib/util/square-web-payments"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

const CARD_CONTAINER_ID = "square-sandbox-card-container"

const SANDBOX_ITEM = {
  sku: "SQUARE-SANDBOX-TEE-TEST",
  title: "Square Sandbox Test Item",
  amount: 1,
  currencyCode: "USD",
}

type TestResult = {
  success?: boolean
  wouldCreateOrder?: boolean
  message?: string
  item?: {
    sku?: string
    title?: string
      amountMinor?: number
      amount?: number
      currencyCode?: string
  }
  payment?: {
    id?: string | null
    status?: string | null
    sourceType?: string | null
  }
  cleanup?: {
    attemptedAuthorizationCancel?: boolean
    authorizationCancelled?: boolean
    cancellationStatus?: string | null
  }
  createdAt?: string
}

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === "string" && error.trim()) {
    return error
  }

  return fallback
}

export default function SquareSandboxCheckoutPage() {
  const [sdkReady, setSdkReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [result, setResult] = useState<TestResult | null>(null)

  const squareApplicationId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || ""
  const squareLocationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || ""
  const isSquareSandbox = process.env.NEXT_PUBLIC_SQUARE_IS_SANDBOX === "true"

  const paymentsRef = useRef<SquarePayments | null>(null)
  const cardRef = useRef<SquareMethodInstance | null>(null)

  const displayAmount = useMemo(() => {
    return formatSquareDisplayAmount(
      SANDBOX_ITEM.amount,
      SANDBOX_ITEM.currencyCode
    )
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeSquare = async () => {
      if (!squareApplicationId || !squareLocationId) {
        setErrorMessage(
          "Missing NEXT_PUBLIC_SQUARE_APPLICATION_ID or NEXT_PUBLIC_SQUARE_LOCATION_ID."
        )
        return
      }

      try {
        await loadSquareScript(isSquareSandbox)

        if (!mounted || !window.Square) {
          return
        }

        const payments = window.Square.payments(
          squareApplicationId,
          squareLocationId
        )
        paymentsRef.current = payments

        const card = await payments.card()
        if (!card.attach) {
          throw new Error("Square card attach API is unavailable.")
        }

        await card.attach(`#${CARD_CONTAINER_ID}`)
        cardRef.current = card

        if (mounted) {
          setSdkReady(true)
        }
      } catch (error) {
        if (mounted) {
          setErrorMessage(
            toErrorMessage(
              error,
              "Failed to initialize Square sandbox checkout."
            )
          )
        }
      }
    }

    void initializeSquare()

    return () => {
      mounted = false
      if (cardRef.current?.destroy) {
        void cardRef.current.destroy()
      }
      cardRef.current = null
      paymentsRef.current = null
    }
  }, [isSquareSandbox, squareApplicationId, squareLocationId])

  const runSandboxPaymentTest = useCallback(async () => {
    if (!cardRef.current) {
      setErrorMessage("Card input is not ready yet.")
      return
    }

    setLoading(true)
    setErrorMessage(null)
    setResult(null)

    try {
      const tokenResult = await cardRef.current.tokenize()
      const sourceId = readSquareTokenOrThrow(tokenResult)

      const response = await fetch("/api/square/sandbox-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceId,
          sourceType: tokenResult.details?.method || "Card",
        }),
      })

      const payload = (await response.json().catch(() => ({}))) as TestResult
      if (!response.ok) {
        throw new Error(payload.message || "Sandbox payment test failed.")
      }

      setResult(payload)
    } catch (error) {
      setErrorMessage(
        toErrorMessage(error, "Sandbox payment test failed. Please try again.")
      )
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white text-black px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl uppercase font-medium tracking-wide">
          Square Sandbox Checkout Test
        </h1>

        <div className="border border-gray-300 p-4 space-y-2">
          <h2 className="text-lg font-medium">Predetermined Item</h2>
          <p className="text-sm">
            {SANDBOX_ITEM.title} ({SANDBOX_ITEM.sku})
          </p>
          <p className="text-sm">
            {SANDBOX_ITEM.currencyCode} {displayAmount}
          </p>
          <p className="text-xs text-gray-600">
            This page does not create a Medusa order. It only tests whether a
            Square sandbox authorization succeeds.
          </p>
        </div>

        {!isSquareSandbox && (
          <div className="border border-amber-400 bg-amber-50 text-amber-900 p-3 text-sm">
            NEXT_PUBLIC_SQUARE_IS_SANDBOX is not true. This page is intended for
            sandbox only.
          </div>
        )}

        <div className="border border-gray-300 p-4 space-y-3">
          <label className="block text-sm font-medium">Card Information</label>
          <div
            id={CARD_CONTAINER_ID}
            className="min-h-[44px] border border-gray-300 px-3 py-2"
          />
          <button
            type="button"
            disabled={!sdkReady || loading}
            onClick={runSandboxPaymentTest}
            className="w-full h-10 uppercase rounded-none bg-black text-white disabled:opacity-50"
          >
            {loading ? "Running test..." : "Run Sandbox Payment Test"}
          </button>
        </div>

        {errorMessage && (
          <div className="border border-red-400 bg-red-50 text-red-800 p-3 text-sm">
            {errorMessage}
          </div>
        )}

        {result && (
          <div className="border border-gray-300 p-4 space-y-2 text-sm">
            <p>
              <strong>Would Create Order:</strong>{" "}
              {result.wouldCreateOrder ? "Yes" : "No"}
            </p>
            <p>
              <strong>Message:</strong> {result.message || "N/A"}
            </p>
            <p>
              <strong>Payment ID:</strong> {result.payment?.id || "N/A"}
            </p>
            <p>
              <strong>Payment Status:</strong> {result.payment?.status || "N/A"}
            </p>
            <p>
              <strong>Source Type:</strong>{" "}
              {result.payment?.sourceType || "N/A"}
            </p>
            <p>
              <strong>Authorization Cancelled:</strong>{" "}
              {result.cleanup?.authorizationCancelled ? "Yes" : "No"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
