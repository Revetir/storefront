"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const Hero = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;

    const handleScroll = () => {
      setIsExpanded(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isExpanded]);

  return (
    <section
      style={{
        backgroundColor: "#fff",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily: "Sans-serif",
        userSelect: "none",
      }}
      aria-label="Grand Opening Sale Hero Banner"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "3rem",
        }}
      >
        {/* Sale Image with Split Clickable Areas - Desktop (768px+) */}
        <div className="hidden md:block" style={{ width: "100%", position: "relative", maxWidth: "1240px", margin: "0 auto" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "1240/620" }}>
            <Image
              src="/images/sale_banner.svg"
              alt="Designer Fashion Sale - Up To 80% Off Men and Women's Styles"
              fill
              sizes="(max-width: 1280px) 100vw, 1240px"
              style={{
                objectFit: "contain",
                borderRadius: 8,
              }}
              priority
            />
          </div>

          {/* Left Clickable Area - Men's */}
          <LocalizedClientLink href="/men">
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "100%",
                cursor: "pointer",
              }}
              aria-label="Shop Menswear"
            />
          </LocalizedClientLink>

          {/* Right Clickable Area - Women's */}
          <LocalizedClientLink href="/women">
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                cursor: "pointer",
              }}
              aria-label="Shop Womenswear"
            />
          </LocalizedClientLink>
        </div>

        {/* Sale Image Compact - Mobile (<768px) */}
        <div className="md:hidden" style={{ width: "100%", position: "relative", margin: "0 auto", padding: "0 0.5rem" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Image
              src="/images/sale_banner_vertical_final.svg"
              alt="Designer Fashion Sale - Up To 80% Off Men and Women's Styles"
              width={620}
              height={0}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                borderRadius: 8,
              }}
              priority
            />
          </div>

          {/* Left Clickable Area - Men's */}
          <LocalizedClientLink href="/men">
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "100%",
                cursor: "pointer",
              }}
              aria-label="Shop Menswear"
            />
          </LocalizedClientLink>

          {/* Right Clickable Area - Women's */}
          <LocalizedClientLink href="/women">
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "50%",
                height: "100%",
                cursor: "pointer",
              }}
              aria-label="Shop Womenswear"
            />
          </LocalizedClientLink>
        </div>

        {/* Mobile: Single Expandable Button (below md: 768px) */}
        <nav
          className="md:hidden w-full"
          style={{
            maxWidth: "1280px",
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
            maxWidth: "1280px",
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
              e.currentTarget.style.backgroundColor = "#000";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#000";
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
              e.currentTarget.style.backgroundColor = "#000";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#000";
            }}
            aria-label="Shop womenswear"
          >
            SHOP WOMENSWEAR
          </LocalizedClientLink>
        </nav>
      </div>
    </section>
  );
};

export default Hero;
