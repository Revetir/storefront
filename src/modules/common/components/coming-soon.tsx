"use client"

import CountdownTimer from "./countdown-timer"

const ComingSoon = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "Sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          fontWeight: "300",
          color: "#333",
          marginBottom: "1rem",
          textTransform: "uppercase",
        }}
      >
        A new way to shop is almost here...
      </h1>
      <p
        style={{
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          fontWeight: "300",
          color: "#333",
        }}
      >
        <CountdownTimer />
      </p>
    </div>
  )
}

export default ComingSoon
