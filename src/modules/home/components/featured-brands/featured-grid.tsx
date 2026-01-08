import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const FeaturedGrid = () => {
  return (
    <section className="w-full select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-y-16 lg:gap-y-20 md:gap-x-16 lg:gap-x-32 max-w-7xl mx-auto">
        <div className="w-full">
          <LocalizedClientLink href="/men/brands/common-divisor">
            <div className="block w-full">
              <div className="relative w-full aspect-square mb-4">
                <video
                  src="/images/common_divisor_cover.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="object-cover w-full h-full"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="">
                <h3 className="text-xl font-medium text-black mb-2 uppercase">COMMON/DIVISOR</h3>
                <span className="inline-block border border-black text-black font-medium text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:bg-black hover:text-white transition-colors duration-300">
                  Shop Menswear
                </span>
              </div>
            </div>
          </LocalizedClientLink>
        </div>
        <div className="w-full">
          <LocalizedClientLink href="/women/brands/rebel-wave">
            <div className="block w-full">
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src="/images/rebel_wave_cover.png"
                  alt="Featured Brand: Rebel Wave"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="px-2 tracking-wide">
                <h3 className="text-xl font-medium text-black mb-2 uppercase">Rebel Wave</h3>
                <span className="inline-block border border-black text-black font-medium text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:bg-black hover:text-white transition-colors duration-300">
                  Shop Womenswear
                </span>
              </div>
            </div>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default FeaturedGrid
