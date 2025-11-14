"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const BottomCTA = () => {
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!isExpanded) return

    const handleScroll = () => {
      setIsExpanded(false)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isExpanded])

  return (
    <div
      style={{
        maxWidth: "1280px",
        margin: "4rem auto 0",
        padding: "0 1rem",
        userSelect: "none",
      }}
    >
      {/* Mobile: Single Expandable Button (below md: 768px) */}
      <nav
        className="md:hidden w-full"
        style={{
          userSelect: "none",
        }}
        aria-label="Shop menswear or womenswear"
      >
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              width: "100%",
              padding: "1rem 1.5rem",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "300",
              fontSize: "clamp(1rem, 4vw, 1.5rem)",
              color: "#000",
              backgroundColor: "transparent",
              border: "1px solid #000",
              cursor: "pointer",
              transition: "all 300ms ease-in-out",
            }}
            aria-label="Shop all collections"
            aria-expanded={isExpanded}
          >
            <span
              style={{
                display: "inline-block",
                transition: "opacity 300ms ease-in-out, transform 300ms ease-in-out",
              }}
            >
              SHOP ALL
            </span>
          </button>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              border: "1px solid #000",
              animation: "fadeIn 300ms ease-in-out",
            }}
            role="group"
            aria-label="Shop by category"
          >
            <LocalizedClientLink
              href="/men"
              style={{
                flex: "1 1 50%",
                width: "50%",
                padding: "1rem 0.5rem",
                textAlign: "center",
                textTransform: "uppercase",
                fontWeight: "300",
                fontSize: "clamp(0.75rem, 3vw, 1.25rem)",
                color: "#000",
                textDecoration: "none",
                cursor: "pointer",
                borderRight: "1px solid #000",
                transition: "background-color 200ms ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              aria-label="Shop menswear"
            >
              MENSWEAR
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/women"
              style={{
                flex: "1 1 50%",
                width: "50%",
                padding: "1rem 0.5rem",
                textAlign: "center",
                textTransform: "uppercase",
                fontWeight: "300",
                fontSize: "clamp(0.75rem, 3vw, 1.25rem)",
                color: "#000",
                textDecoration: "none",
                cursor: "pointer",
                transition: "background-color 200ms ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              aria-label="Shop womenswear"
            >
              WOMENSWEAR
            </LocalizedClientLink>
          </div>
        )}
      </nav>

      {/* Desktop: Two Separate Buttons (md: 768px and above) */}
      <nav
        className="hidden md:flex w-full gap-6"
        style={{
          userSelect: "none",
        }}
        aria-label="Shop menswear or womenswear"
      >
        <LocalizedClientLink
          href="/men"
          style={{
            flex: 1,
            padding: "1.5rem 1rem",
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "300",
            fontSize: "clamp(1.25rem, 2vw, 2rem)",
            color: "#000",
            textDecoration: "none",
            cursor: "pointer",
            border: "1px solid #000",
            transition: "background-color 200ms ease, color 200ms ease",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.backgroundColor = "#000"
            e.currentTarget.style.color = "#fff"
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "#000"
          }}
          aria-label="Shop menswear"
        >
          SHOP MENSWEAR
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/women"
          style={{
            flex: 1,
            padding: "1.5rem 1rem",
            textAlign: "center",
            textTransform: "uppercase",
            fontWeight: "300",
            fontSize: "clamp(1.25rem, 2vw, 2rem)",
            color: "#000",
            textDecoration: "none",
            cursor: "pointer",
            border: "1px solid #000",
            transition: "background-color 200ms ease, color 200ms ease",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.backgroundColor = "#000"
            e.currentTarget.style.color = "#fff"
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.backgroundColor = "transparent"
            e.currentTarget.style.color = "#000"
          }}
          aria-label="Shop womenswear"
        >
          SHOP WOMENSWEAR
        </LocalizedClientLink>
      </nav>
    </div>
  )
}

export default BottomCTA
