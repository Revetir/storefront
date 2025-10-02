"use client";

import React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const Hero = () => {
  const imageUrl =
    "/images/sale_banner_80_off.png";

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
        {/* Sale Image with Split Clickable Areas */}
        <div style={{ width: "100%", position: "relative" }}>
          <img
            src={imageUrl}
            alt="Designer Fashion Sale Up To 80% Off - Men's & Women's Luxury Clothing"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              borderRadius: 8,
            }}
            loading="lazy"
          />
          
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

        {/* Links Container */}
        <nav
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 1280,
            userSelect: "none",
          }}
          aria-label="Shop Menswear or Womenswear links"
        >
          <LocalizedClientLink
            href="/men"
            style={{
              flex: 1,
              padding: "2rem 0",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "600",
              fontSize: "1.75rem",
              color: "#333",
              textDecoration: "none",
              cursor: "pointer",
            }}
            aria-label="Shop Menswear"
          >
            Shop Menswear
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/women"
            style={{
              flex: 1,
              padding: "2rem 0",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "600",
              fontSize: "1.75rem",
              color: "#333",
              textDecoration: "none",
              cursor: "pointer",
            }}
            aria-label="Shop Womenswear"
          >
            Shop Womenswear
          </LocalizedClientLink>
        </nav>
      </div>
    </section>
  );
};

export default Hero;
