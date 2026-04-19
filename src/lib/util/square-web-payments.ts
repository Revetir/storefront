export type SquareCheckoutMethodType =
  | "square_card"
  | "square_apple_pay"
  | "square_google_pay"

type SquareTokenResultStatus = "OK" | "ERROR" | string

export type SquareTokenResult = {
  status: SquareTokenResultStatus
  token?: string
  details?: {
    method?: string
  }
  errors?: Array<{ message?: string }>
}

export type SquareMethodInstance = {
  tokenize: () => Promise<SquareTokenResult>
  destroy?: () => Promise<boolean>
  attach?: (selector: string, options?: Record<string, any>) => Promise<void>
}

export type SquarePayments = {
  card: (options?: Record<string, any>) => Promise<SquareMethodInstance>
  applePay: (paymentRequest: SquarePaymentRequest) => Promise<SquareMethodInstance>
  googlePay: (paymentRequest: SquarePaymentRequest) => Promise<SquareMethodInstance>
  paymentRequest: (options: {
    countryCode: string
    currencyCode: string
    total: {
      amount: string
      label: string
    }
  }) => SquarePaymentRequest
}

export type SquarePaymentRequest = Record<string, any>

type SquareNamespace = {
  payments: (applicationId: string, locationId: string) => SquarePayments
}

declare global {
  interface Window {
    Square?: SquareNamespace
  }
}

const SCRIPT_ID = "square-web-payments-sdk"
let scriptLoadPromise: Promise<void> | null = null

const CURRENCY_DECIMALS: Record<string, number> = {
  JPY: 0,
  KRW: 0,
  HUF: 0,
  TWD: 0,
  BHD: 3,
  IQD: 3,
  JOD: 3,
  KWD: 3,
  OMR: 3,
  TND: 3,
}

export const getSquareScriptUrl = (isSandbox: boolean) =>
  isSandbox
    ? "https://sandbox.web.squarecdn.com/v1/square.js"
    : "https://web.squarecdn.com/v1/square.js"

export const getCurrencyDecimals = (currencyCode: string) =>
  CURRENCY_DECIMALS[String(currencyCode || "").toUpperCase()] ?? 2

export const formatSquareDisplayAmount = (
  minorAmount: number,
  currencyCode: string
): string => {
  const decimals = getCurrencyDecimals(currencyCode)
  return (minorAmount / 10 ** decimals).toFixed(decimals)
}

export const loadSquareScript = async (isSandbox: boolean): Promise<void> => {
  if (typeof window === "undefined") {
    return
  }

  if (window.Square) {
    return
  }

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve())
        existingScript.addEventListener("error", () =>
          reject(new Error("Failed to load Square Web Payments SDK"))
        )
        return
      }

      const script = document.createElement("script")
      script.id = SCRIPT_ID
      script.type = "text/javascript"
      script.src = getSquareScriptUrl(isSandbox)
      script.async = true
      script.onload = () => resolve()
      script.onerror = () =>
        reject(new Error("Failed to load Square Web Payments SDK"))

      document.head.appendChild(script)
    })
  }

  await scriptLoadPromise
}

// Mirrors the visual treatment used by the PayPal card fields.
export const SQUARE_CARD_STYLE = {
  ".input-container": {
    borderColor: "#d1d5db",
    borderWidth: "1px",
    borderRadius: "0px",
  },
  ".input-container.is-focus": {
    borderColor: "#000000",
    borderWidth: "1px",
  },
  ".input-container.is-error": {
    borderColor: "#ef4444",
    borderWidth: "1px",
  },
  ".message-text": {
    color: "transparent",
  },
  ".message-icon": {
    color: "transparent",
  },
  ".message-text.is-error": {
    color: "#dc2626",
  },
  ".message-icon.is-error": {
    color: "#dc2626",
  },
  input: {
    backgroundColor: "#ffffff",
    color: "#111827",
    fontFamily: "Segoe UI",
    fontSize: "14px",
    fontWeight: "normal",
  },
  "input::placeholder": {
    color: "#6b7280",
  },
  "input.is-error": {
    color: "#dc2626",
  },
} as const

export const resolveSquareSourceType = ({
  selectedMethod,
  tokenMethod,
}: {
  selectedMethod: SquareCheckoutMethodType
  tokenMethod?: string
}): string => {
  const normalizedTokenMethod = String(tokenMethod || "").toLowerCase()
  if (normalizedTokenMethod.includes("apple")) {
    return "Apple Pay"
  }
  if (normalizedTokenMethod.includes("google")) {
    return "Google Pay"
  }
  if (normalizedTokenMethod.includes("card")) {
    return "Card"
  }

  switch (selectedMethod) {
    case "square_apple_pay":
      return "Apple Pay"
    case "square_google_pay":
      return "Google Pay"
    default:
      return "Card"
  }
}

export const readSquareTokenOrThrow = (tokenResult: SquareTokenResult): string => {
  if (tokenResult.status === "OK" && tokenResult.token) {
    return tokenResult.token
  }

  const firstError = tokenResult.errors?.[0]
  throw new Error(firstError?.message || "Failed to tokenize payment details.")
}
