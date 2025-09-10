import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const FeaturedBrands = () => {
  return (
    <section className="w-full px-4 md:px-8 lg:px-16 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="relative h-[800px] w-full">
          <Image
            src="/images/rebel_wave_cover.png"
            alt="Featured Brand: Rebel Wave"
            fill
            className="object-cover rounded-md"
          />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-sm font-medium mb-2">Featured Brand</p>
            <h3 className="text-2xl font-bold mb-4">Rebel Wave</h3>
            <LocalizedClientLink href="/men/brands/rebel-wave">
              <button className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Shop All
              </button>
            </LocalizedClientLink>
          </div>
        </div>
        <div className="relative h-[800px] w-full">
          <video
            src="/images/common_divisor_cover.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="object-cover rounded-md w-full h-full"
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-sm font-medium mb-2">Featured Brand</p>
            <h3 className="text-2xl font-bold mb-4">COMMON/DIVISOR</h3>
            <LocalizedClientLink href="/men/brands/common-divisor">
              <button className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Shop All
              </button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedBrands
