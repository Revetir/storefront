"use client"

import { useEffect, useState } from "react"

const TARGET_TIMESTAMP_MS = Date.UTC(2026, 3, 4, 16, 0, 0) // April 4, 2026, 16:00:00 UTC

type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const getCountdownParts = (nowMs: number): CountdownParts => {
  const diffMs = Math.max(0, TARGET_TIMESTAMP_MS - nowMs)
  const totalSeconds = Math.floor(diffMs / 1000)

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

export default function AuthenticationCountdown() {
  const [countdown, setCountdown] = useState<CountdownParts>(() =>
    getCountdownParts(Date.now())
  )

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdownParts(Date.now()))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  const formattedCountdown = `${countdown.days}d ${String(countdown.hours).padStart(2, "0")}h ${String(
    countdown.minutes
  ).padStart(2, "0")}m ${String(countdown.seconds).padStart(2, "0")}s`

  return (
    <span
      aria-label="Time remaining until April 4, 2026 at 16:00 UTC"
      title="Countdown to April 4, 2026 at 16:00 UTC"
      className="inline-block tabular-nums font-medium text-black underline decoration-neutral-400 underline-offset-4"
    >
      {formattedCountdown}
    </span>
  )
}
