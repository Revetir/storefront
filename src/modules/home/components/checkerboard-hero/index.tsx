"use client"

import { useState } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type HoverSide = "men" | "women" | null

const MEN_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='54' font-family='Arial' font-weight='500' fill='white' stroke='black' stroke-width='1'%3E%E2%99%82%3C/text%3E%3C/svg%3E\") 36 36, pointer"
const WOMEN_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='54' font-family='Arial' font-weight='500' fill='white' stroke='black' stroke-width='1'%3E%E2%99%80%3C/text%3E%3C/svg%3E\") 36 36, pointer"

const CheckerboardHero = () => {
  const [hoveredSide, setHoveredSide] = useState<HoverSide>(null)
  const [hoveredText, setHoveredText] = useState<HoverSide>(null)

  return (
    <section className="w-full px-0 md:px-14 lg:px-24 xl:px-32 2xl:px-40" aria-label="Sale checkerboard hero">
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="relative mx-auto aspect-square w-full max-w-[940px] lg:max-w-[860px] xl:max-w-[820px] 2xl:max-w-[800px]">
          <Image
            src="/images/sale_banner_checkerboard.svg"
            alt="Designer fashion sale checkerboard banner"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1440px) 70vw, 940px"
            className="pointer-events-none select-none object-contain"
            priority
          />

          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/2 overflow-hidden"
            style={{
              opacity: hoveredSide === "men" ? 1 : 0,
              transition: "opacity 180ms ease",
            }}
          >
            <img
              src="/images/sale_banner_checkerboard.svg"
              alt=""
              draggable={false}
              className="absolute h-[200%] w-[200%] max-w-none select-none"
              style={{
                top: "-100%",
                left: 0,
                filter: "invert(1)",
              }}
            />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-1/2 w-1/2 overflow-hidden"
            style={{
              opacity: hoveredSide === "women" ? 1 : 0,
              transition: "opacity 180ms ease",
            }}
          >
            <img
              src="/images/sale_banner_checkerboard.svg"
              alt=""
              draggable={false}
              className="absolute h-[200%] w-[200%] max-w-none select-none"
              style={{
                top: 0,
                left: "-100%",
                filter: "invert(1)",
              }}
            />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-[9] h-1/2 w-1/2 overflow-hidden"
            style={{
              opacity: hoveredText === "men" ? 1 : 0,
              transition: "opacity 180ms ease",
            }}
          >
            <img
              src="/images/sale_banner_checkerboard_text_only.svg"
              alt=""
              draggable={false}
              className="absolute h-[200%] w-[200%] max-w-none select-none"
              style={{
                top: 0,
                left: 0,
                opacity: 1,
                filter:
                  "drop-shadow(0 0 8px rgba(0,0,0,0.4)) drop-shadow(0 0 20px rgba(0,0,0,0.28))",
              }}
            />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 z-[9] h-1/2 w-1/2 overflow-hidden"
            style={{
              opacity: hoveredText === "women" ? 1 : 0,
              transition: "opacity 180ms ease",
            }}
          >
            <img
              src="/images/sale_banner_checkerboard_text_only.svg"
              alt=""
              draggable={false}
              className="absolute h-[200%] w-[200%] max-w-none select-none"
              style={{
                top: "-100%",
                left: "-100%",
                opacity: 1,
                filter:
                  "drop-shadow(0 0 8px rgba(0,0,0,0.4)) drop-shadow(0 0 20px rgba(0,0,0,0.28))",
              }}
            />
          </div>

          <LocalizedClientLink
            href="/men"
            aria-label="Shop menswear"
            className="absolute bottom-0 left-0 z-20 block h-1/2 w-1/2"
            onMouseEnter={() => setHoveredSide("men")}
            onMouseLeave={() => setHoveredSide(null)}
            onFocus={() => setHoveredSide("men")}
            onBlur={() => setHoveredSide(null)}
            style={{ cursor: MEN_CURSOR }}
          >
            <span className="sr-only">Shop menswear</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/women"
            aria-label="Shop womenswear"
            className="absolute right-0 top-0 z-20 block h-1/2 w-1/2"
            onMouseEnter={() => setHoveredSide("women")}
            onMouseLeave={() => setHoveredSide(null)}
            onFocus={() => setHoveredSide("women")}
            onBlur={() => setHoveredSide(null)}
            style={{ cursor: WOMEN_CURSOR }}
          >
            <span className="sr-only">Shop womenswear</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/men"
            aria-label="Shop menswear from sale text"
            className="absolute left-0 top-0 z-10 block h-1/2 w-1/2"
            style={{ cursor: "pointer" }}
          >
            <span className="sr-only">Shop menswear from sale text</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/women"
            aria-label="Shop womenswear from sale text"
            className="absolute bottom-0 right-0 z-10 block h-1/2 w-1/2"
            style={{ cursor: "pointer" }}
          >
            <span className="sr-only">Shop womenswear from sale text</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/men"
            aria-label="Shop menswear from SALE text"
            className="absolute z-[11] block"
            onMouseEnter={() => setHoveredText("men")}
            onMouseLeave={() => setHoveredText(null)}
            onFocus={() => setHoveredText("men")}
            onBlur={() => setHoveredText(null)}
            style={{
              cursor: "pointer",
              left: "11.8%",
              top: "20.5%",
              width: "27%",
              height: "11%",
            }}
          >
            <span className="sr-only">Shop menswear from SALE text</span>
          </LocalizedClientLink>

          <LocalizedClientLink
            href="/women"
            aria-label="Shop womenswear from Up to 90% OFF text"
            className="absolute z-[11] block"
            onMouseEnter={() => setHoveredText("women")}
            onMouseLeave={() => setHoveredText(null)}
            onFocus={() => setHoveredText("women")}
            onBlur={() => setHoveredText(null)}
            style={{
              cursor: "pointer",
              left: "52.8%",
              top: "71.5%",
              width: "45.5%",
              height: "10.5%",
            }}
          >
            <span className="sr-only">Shop womenswear from Up to 90% OFF text</span>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default CheckerboardHero
