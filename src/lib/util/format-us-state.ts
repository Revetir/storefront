// Formats Medusa US province codes like "us-fl" to "FL" for display.
const US_STATE_CODE_MAP: Record<string, string> = {
  "us-al": "AL",
  "us-ak": "AK",
  "us-az": "AZ",
  "us-ar": "AR",
  "us-ca": "CA",
  "us-co": "CO",
  "us-ct": "CT",
  "us-de": "DE",
  "us-fl": "FL",
  "us-ga": "GA",
  "us-hi": "HI",
  "us-id": "ID",
  "us-il": "IL",
  "us-in": "IN",
  "us-ia": "IA",
  "us-ks": "KS",
  "us-ky": "KY",
  "us-la": "LA",
  "us-me": "ME",
  "us-md": "MD",
  "us-ma": "MA",
  "us-mi": "MI",
  "us-mn": "MN",
  "us-ms": "MS",
  "us-mo": "MO",
  "us-mt": "MT",
  "us-ne": "NE",
  "us-nv": "NV",
  "us-nh": "NH",
  "us-nj": "NJ",
  "us-nm": "NM",
  "us-ny": "NY",
  "us-nc": "NC",
  "us-nd": "ND",
  "us-oh": "OH",
  "us-ok": "OK",
  "us-or": "OR",
  "us-pa": "PA",
  "us-ri": "RI",
  "us-sc": "SC",
  "us-sd": "SD",
  "us-tn": "TN",
  "us-tx": "TX",
  "us-ut": "UT",
  "us-vt": "VT",
  "us-va": "VA",
  "us-wa": "WA",
  "us-wv": "WV",
  "us-wi": "WI",
  "us-wy": "WY",
  "us-dc": "DC",
}

export function formatUSState(province?: string) {
  if (!province) return ""

  const key = province.toLowerCase()
  if (US_STATE_CODE_MAP[key]) {
    return US_STATE_CODE_MAP[key]
  }

  if (key.startsWith("us-") && key.length === 5) {
    return key.slice(3).toUpperCase()
  }

  if (/^[a-z]{2}$/i.test(province)) {
    return province.toUpperCase()
  }

  return province
}
