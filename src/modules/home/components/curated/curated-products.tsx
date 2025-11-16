import Image from "next/image"
import Link from "next/link"

const CuratedProducts = () => {
  return (
    <section className="w-full px-4 md:px-8 py-10 select-none">
      {/* Mobile/Tablet Header - with SHOP ALL button */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <h2 className="text-3xl font-light" style={{ color: '#333' }}>
          CURATED WARDROBES
        </h2>
        <Link href="/coming-soon">
          <button
            style={{
              padding: "0.5rem 1rem",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "300",
              fontSize: "0.75rem",
              color: "#000",
              backgroundColor: "transparent",
              border: "1px solid #000",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
            aria-label="Shop all curated wardrobes"
          >
            SHOP ALL
          </button>
        </Link>
      </div>

      {/* Desktop Header - matches NEW ARRIVALS styling */}
      <h2 className="hidden lg:block text-4xl font-medium tracking-tight mb-6">
        CURATED WARDROBES
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
    </section>
  )
}

export default CuratedProducts
