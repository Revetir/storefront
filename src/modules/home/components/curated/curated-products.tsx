import Image from "next/image"
import Link from "next/link"

const CuratedProducts = () => {
  return (
    <section className="w-full px-4 md:px-8 py-10 select-none">
      <h2 className="text-2xl font-light mb-6 text-center sm:text-left" style={{ color: '#333' }}>
        SHOP BY WARDROBE
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
    </section>
  )
}

export default CuratedProducts
