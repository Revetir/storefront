const US_SALE_COUNTRIES = new Set(["us", "ca"])
const EU_SALE_COUNTRIES = new Set([
  "gb",
  "de",
  "fr",
  "it",
  "es",
  "nl",
  "be",
  "at",
  "ie",
  "pt",
  "fi",
  "dk",
  "se",
  "no",
  "ch",
  "lu",
  "mt",
  "cy",
  "ee",
  "lv",
  "lt",
  "pl",
  "cz",
  "sk",
  "hu",
  "si",
  "hr",
  "ro",
  "bg",
  "gr",
])

export const getSaleFacetForCountryCode = (countryCode?: string) => {
  const normalizedCountry = countryCode?.toLowerCase()

  if (normalizedCountry && EU_SALE_COUNTRIES.has(normalizedCountry)) {
    return "on_sale_eu"
  }

  if (normalizedCountry && US_SALE_COUNTRIES.has(normalizedCountry)) {
    return "on_sale_us"
  }

  return "on_sale_us"
}
