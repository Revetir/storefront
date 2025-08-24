import React from "react";

const Hero = () => {
  const imageUrl =
    "/images/opening_sale_banner.gif";

  return (
    <section
      style={{
        backgroundColor: "#fff",
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily: "Sans-serif",
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
        {/* Sale Image */}
        <div style={{ width: "100vw" }}>
          <a href="/store" style={{ display: "block", textDecoration: "none" }}>
            <img
              src={imageUrl}
              alt="Grand Opening Sale Up To 80% Off"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: 8,
              }}
              loading="lazy"
            />
          </a>
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
          <a
            href="/categories/men"
            style={{
              flex: 1,
              padding: "2rem 0",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: "1.25rem",
              color: "#000",
              textDecoration: "none",
              cursor: "pointer",
            }}
            aria-label="Shop Menswear"
          >
            Shop Menswear
          </a>
          <a
            href="/categories/women"
            style={{
              flex: 1,
              padding: "2rem 0",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: "1.25rem",
              color: "#000",
              textDecoration: "none",
              cursor: "pointer",
            }}
            aria-label="Shop Womenswear"
          >
            Shop Womenswear
          </a>
        </nav>
      </div>
    </section>
  );
};

export default Hero;
