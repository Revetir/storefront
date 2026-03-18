export const SALE_QUERY_PARAM = "sale"

const FALSE_VALUES = new Set(["0", "false", "off", "no"])
const TRUE_VALUES = new Set(["1", "true", "on", "yes"])

type SearchParamsLike = {
  has(name: string): boolean
  get(name: string): string | null
}

export const isSaleQueryEnabled = (
  searchParams: SearchParamsLike,
  key: string = SALE_QUERY_PARAM
): boolean => {
  if (!searchParams.has(key)) {
    return false
  }

  return isSaleValueEnabled(searchParams.get(key))
}

export const isSaleValueEnabled = (value?: string | null): boolean => {
  if (value === undefined || value === null) {
    return false
  }

  if (value === "") {
    return true
  }

  const normalized = value.trim().toLowerCase()
  if (FALSE_VALUES.has(normalized)) {
    return false
  }

  if (TRUE_VALUES.has(normalized)) {
    return true
  }

  return true
}

export const isSaleEnabledFromServerSearchParams = (
  searchParams: Record<string, string | string[] | undefined>,
  key: string = SALE_QUERY_PARAM
) => {
  const hasKey = Object.prototype.hasOwnProperty.call(searchParams, key)
  if (!hasKey) {
    return false
  }

  const rawValue = searchParams[key]
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue

  if (value === undefined) {
    return true
  }

  return isSaleValueEnabled(value)
}

export const setSaleQuery = (
  params: URLSearchParams,
  enabled: boolean,
  key: string = SALE_QUERY_PARAM
) => {
  if (enabled) {
    params.set(key, "")
    return
  }

  params.delete(key)
}

export const serializeQueryParamsWithFlags = (
  params: URLSearchParams,
  flagKeys: string[] = [SALE_QUERY_PARAM]
) => {
  const flags = new Set(flagKeys)
  const parts: string[] = []

  params.forEach((value, key) => {
    const encodedKey = encodeURIComponent(key)

    if (flags.has(key) && (value === "" || TRUE_VALUES.has(value.toLowerCase()))) {
      parts.push(encodedKey)
      return
    }

    parts.push(`${encodedKey}=${encodeURIComponent(value)}`)
  })

  return parts.join("&")
}

export const buildPathWithQueryFlags = (
  pathname: string,
  params: URLSearchParams,
  flagKeys: string[] = [SALE_QUERY_PARAM]
) => {
  const query = serializeQueryParamsWithFlags(params, flagKeys)
  return query ? `${pathname}?${query}` : pathname
}
