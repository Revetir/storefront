"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  className?: string
  style?: React.CSSProperties
  asButton?: boolean
}

const CountdownTimer = ({ className = "", style = {}, asButton = false }: CountdownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("48:00:00")

  useEffect(() => {
    // Initialize target time: 48 hours from deployment (you can adjust this initial date)
    const getTargetTime = (): Date => {
      const stored = localStorage.getItem("countdown-target")
      if (stored) {
        return new Date(stored)
      }
      // Set initial target to 48 hours from now (in EST)
      const initialTarget = new Date()
      initialTarget.setHours(initialTarget.getHours() + 48)
      localStorage.setItem("countdown-target", initialTarget.toISOString())
      return initialTarget
    }

    const updateCountdown = () => {
      const now = new Date()
      let target = getTargetTime()
      const diff = target.getTime() - now.getTime()

      // If we've reached 24 hours (86400000 ms), reset to 48 hours ahead
      if (diff <= 86400000 && diff > 0) {
        const newTarget = new Date()
        newTarget.setHours(newTarget.getHours() + 48)
        localStorage.setItem("countdown-target", newTarget.toISOString())
        target = newTarget
      }

      // If countdown expired, reset to 48 hours ahead
      if (diff <= 0) {
        const newTarget = new Date()
        newTarget.setHours(newTarget.getHours() + 48)
        localStorage.setItem("countdown-target", newTarget.toISOString())
        target = newTarget
      }

      // Recalculate with updated target
      const finalDiff = target.getTime() - now.getTime()

      // Calculate hours, minutes, seconds
      const hours = Math.floor(finalDiff / (1000 * 60 * 60))
      const minutes = Math.floor((finalDiff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((finalDiff % (1000 * 60)) / 1000)

      // Format as HH:MM:SS
      const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      setTimeRemaining(formattedTime)
    }

    // Update immediately
    updateCountdown()

    // Update every second
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  if (asButton) {
    return (
      <button
        className={className}
        style={{
          padding: "0.5rem 1rem",
          textAlign: "center",
          textTransform: "uppercase",
          fontWeight: "300",
          fontSize: "0.75rem",
          color: "#000",
          backgroundColor: "transparent",
          border: "1px solid #000",
          cursor: "default",
          whiteSpace: "nowrap",
          ...style,
        }}
        aria-label="Product launching countdown"
        disabled
      >
        LAUNCHING IN {timeRemaining}
      </button>
    )
  }

  return (
    <span className={className} style={style}>
      {timeRemaining}
    </span>
  )
}

export default CountdownTimer
