"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CuratedProducts = () => {
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
    <section className="w-full px-4 md:px-8 py-10 select-none">
      <h2 className="text-2xl font-light mb-6 text-left" style={{ color: '#333' }}>
        Shop By Wardrobe
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/coming-soon">
          <div className="flex flex-col">
              <div className="relative w-full h-[800px]">
                <Image
                  src="/images/streetwear_outfit.jpg"
                  alt="Model wearing Streetwear outfit"
                  fill
                  className="object-cover rounded-md"
                  priority={true}
                  quality={80}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            <h3 className="text-center mt-2 text-lg font-medium uppercase">Streetwear</h3>
          </div>
        </Link>
        <Link href="/coming-soon">
          <div className="flex flex-col">
            <div className="relative w-full h-[800px]">
              <Image
                src="/images/dark_luxury_outfit.jpg"
                alt="Model wearing Dark Luxury outfit"
                fill
                className="object-cover rounded-md"
                priority={true}
                quality={80}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <h3 className="text-center mt-2 text-lg font-medium uppercase">Dark Luxury</h3>
          </div>
        </Link>
        <Link href="/coming-soon">
          <div className="flex flex-col">
            <div className="relative w-full h-[800px]">
              <Image
                src="/images/retro_americana_outfit.jpg"
                alt="Model wearing Retro Americana outfit"
                fill
                className="object-cover rounded-md"
                quality={80}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <h3 className="text-center mt-2 text-lg font-medium uppercase">Retro Americana</h3>
          </div>
        </Link>
        <Link href="/coming-soon">
          <div className="flex flex-col">
            <div className="relative w-full h-[800px]">
              <Image
                src="/images/minimalist_outfit.png"
                alt="Model wearing Minimalist outfit"
                fill
                className="object-cover rounded-md"
                quality={80}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <h3 className="text-center mt-2 text-lg font-medium uppercase">Minimalist</h3>
          </div>
        </Link>
      </div>

      {/* CTA Buttons - Matching Hero Pattern */}
      <div style={{ maxWidth: "1280px", margin: "3rem auto 0", padding: "0 1rem" }}>
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
                padding: "1.5rem 2rem",
                textAlign: "center",
                textTransform: "uppercase",
                fontWeight: "300",
                fontSize: "clamp(1.25rem, 5vw, 2rem)",
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
                  padding: "1.5rem 0.5rem",
                  textAlign: "center",
                  textTransform: "uppercase",
                  fontWeight: "300",
                  fontSize: "clamp(0.875rem, 3.5vw, 1.5rem)",
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
                  padding: "1.5rem 0.5rem",
                  textAlign: "center",
                  textTransform: "uppercase",
                  fontWeight: "300",
                  fontSize: "clamp(0.875rem, 3.5vw, 1.5rem)",
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
              padding: "2rem 1.5rem",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "300",
              fontSize: "clamp(1.5rem, 2.5vw, 2.5rem)",
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
              padding: "2rem 1.5rem",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "300",
              fontSize: "clamp(1.5rem, 2.5vw, 2.5rem)",
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
    </section>
  )
}

export default CuratedProducts
