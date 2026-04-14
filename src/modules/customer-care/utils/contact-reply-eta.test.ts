import assert from "node:assert/strict"
import { computeReplyEtaSeconds, formatDurationHHMMSS } from "./contact-reply-eta"

type EtaCase = {
  label: string
  nowIso: string
  expectedSeconds: number
}

const CASES: EtaCase[] = [
  {
    label: "Weekday during online hours",
    nowIso: "2025-01-07T17:00:00.000Z", // Tue 12:00 ET
    expectedSeconds: 4 * 60 * 60,
  },
  {
    label: "Weekday near close while open returns flat SLA",
    nowIso: "2025-01-08T03:30:00.000Z", // Tue 22:30 ET
    expectedSeconds: 4 * 60 * 60,
  },
  {
    label: "After close includes overnight wait",
    nowIso: "2025-01-08T04:10:00.000Z", // Tue 23:10 ET
    expectedSeconds: 15 * 60 * 60 + 50 * 60,
  },
  {
    label: "Sunday during online hours uses Sunday SLA",
    nowIso: "2025-01-05T17:00:00.000Z", // Sun 12:00 ET
    expectedSeconds: 6 * 60 * 60,
  },
  {
    label: "Sunday before opening waits for Sunday opening plus Sunday SLA",
    nowIso: "2025-01-05T12:00:00.000Z", // Sun 07:00 ET
    expectedSeconds: 10 * 60 * 60,
  },
  {
    label: "Saturday late-night carries over to Sunday opening",
    nowIso: "2025-01-05T04:30:00.000Z", // Sat 23:30 ET
    expectedSeconds: 17 * 60 * 60 + 30 * 60,
  },
]

for (const testCase of CASES) {
  const nowMs = new Date(testCase.nowIso).getTime()
  const actualSeconds = computeReplyEtaSeconds(nowMs)

  assert.equal(
    actualSeconds,
    testCase.expectedSeconds,
    `${testCase.label}: expected ${testCase.expectedSeconds}, got ${actualSeconds}`
  )
}

assert.equal(formatDurationHHMMSS(27 * 60 * 60), "27:00:00")
assert.equal(formatDurationHHMMSS(0), "00:00:00")
assert.equal(formatDurationHHMMSS(3661), "01:01:01")

console.log("contact-reply-eta tests passed")
