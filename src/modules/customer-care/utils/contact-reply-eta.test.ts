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
    label: "Weekday near close carries into next day",
    nowIso: "2025-01-08T03:30:00.000Z", // Tue 22:30 ET
    expectedSeconds: 16 * 60 * 60, // 00:30 today + overnight + 03:30 next day
  },
  {
    label: "After close includes overnight wait",
    nowIso: "2025-01-08T04:10:00.000Z", // Tue 23:10 ET
    expectedSeconds: 15 * 60 * 60 + 50 * 60,
  },
  {
    label: "Sunday waits for Monday opening",
    nowIso: "2025-01-05T17:00:00.000Z", // Sun 12:00 ET
    expectedSeconds: 27 * 60 * 60,
  },
  {
    label: "Saturday late-night carries over Sunday to Monday",
    nowIso: "2025-01-05T04:30:00.000Z", // Sat 23:30 ET
    expectedSeconds: 39 * 60 * 60 + 30 * 60,
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

