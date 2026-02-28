import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount?: number | null
  currency_code?: string | null
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "en-US",
}: ConvertToLocaleParams) => {
  const hasNumericAmount =
    typeof amount === "number" && Number.isFinite(amount)
  const normalizedCurrency =
    typeof currency_code === "string" ? currency_code.trim() : ""

  if (!hasNumericAmount) {
    return ""
  }

  if (normalizedCurrency && !isEmpty(normalizedCurrency)) {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: normalizedCurrency.toUpperCase(),
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    } catch {
      return amount.toString()
    }
  }

  return amount.toString()
}
