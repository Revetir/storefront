"use client";

import React, { useState } from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

const Hero = () => {
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  const imageUrl = "/images/opening_sale_banner.gif";

  return (
    <section
      style={{
        backgroundColor: "#fff",
        fontFamily: "Sans-serif",
        width: "100%",
        padding: "2rem 0",
      }}
      aria-label="Grand Opening Sale Hero Banner"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "3rem",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1rem",
        }}
      >
        {/* Full-Width Interactive Sale Banner */}
        <div 
          style={{ 
            width: "100vw", 
            position: "relative",
            marginLeft: "calc(-50vw + 50%)",
            marginRight: "calc(-50vw + 50%)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "auto",
              overflow: "hidden",
            }}
          >
            {/* Sale Banner Image */}
            <img
              src={imageUrl}
              alt="Grand Opening Sale Up To 80% Off"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                transition: "transform 0.3s ease, filter 0.3s ease",
                transform: hoveredSide ? "scale(1.02)" : "scale(1)",
                filter: hoveredSide ? "brightness(1.05)" : "brightness(1)",
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
                  backgroundColor: hoveredSide === 'left' ? "rgba(0, 0, 0, 0.05)" : "transparent",
                  transition: "background-color 0.3s ease",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setHoveredSide('left')}
                onMouseLeave={() => setHoveredSide(null)}
                aria-label="Shop Menswear"
              >
                {/* Subtle hover indicator */}
                {hoveredSide === 'left' && (
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      left: "20px",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      opacity: 1,
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    Men's
                  </div>
                )}
              </div>
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
                  backgroundColor: hoveredSide === 'right' ? "rgba(0, 0, 0, 0.05)" : "transparent",
                  transition: "background-color 0.3s ease",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={() => setHoveredSide('right')}
                onMouseLeave={() => setHoveredSide(null)}
                aria-label="Shop Womenswear"
              >
                {/* Subtle hover indicator */}
                {hoveredSide === 'right' && (
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      backgroundColor: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      opacity: 1,
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    Women's
                  </div>
                )}
              </div>
            </LocalizedClientLink>

            {/* Subtle Center Divider */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "1px",
                height: "70%",
                backgroundColor: hoveredSide ? "rgba(255, 255, 255, 0.4)" : "transparent",
                transition: "background-color 0.3s ease",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Enhanced Links Container with Synchronized Hover Effects */}
        <nav
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 1280,
            userSelect: "none",
            gap: "1rem",
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
              fontWeight: "bold",
              fontSize: hoveredSide === 'left' ? "1.4rem" : "1.25rem",
              color: hoveredSide === 'left' ? "#333" : "#000",
              textDecoration: "none",
              cursor: "pointer",
              backgroundColor: hoveredSide === 'left' ? "#f8f8f8" : "transparent",
              borderRadius: "12px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: hoveredSide === 'left' ? "scale(1.05)" : "scale(1)",
              boxShadow: hoveredSide === 'left' 
                ? "0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(0, 0, 0, 0.1)" 
                : "0 2px 8px rgba(0, 0, 0, 0.05)",
              border: hoveredSide === 'left' ? "2px solid rgba(0, 0, 0, 0.1)" : "2px solid transparent",
            }}
            onMouseEnter={() => setHoveredSide('left')}
            onMouseLeave={() => setHoveredSide(null)}
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
              fontWeight: "bold",
              fontSize: hoveredSide === 'right' ? "1.4rem" : "1.25rem",
              color: hoveredSide === 'right' ? "#333" : "#000",
              textDecoration: "none",
              cursor: "pointer",
              backgroundColor: hoveredSide === 'right' ? "#f8f8f8" : "transparent",
              borderRadius: "12px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: hoveredSide === 'right' ? "scale(1.05)" : "scale(1)",
              boxShadow: hoveredSide === 'right' 
                ? "0 8px 25px rgba(0, 0, 0, 0.15), 0 0 0 2px rgba(0, 0, 0, 0.1)" 
                : "0 2px 8px rgba(0, 0, 0, 0.05)",
              border: hoveredSide === 'right' ? "2px solid rgba(0, 0, 0, 0.1)" : "2px solid transparent",
            }}
            onMouseEnter={() => setHoveredSide('right')}
            onMouseLeave={() => setHoveredSide(null)}
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
