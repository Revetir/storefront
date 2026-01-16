import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const FeaturedGrid = () => {
  return (
    <section className="w-full select-none px-4 sm:px-6 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 md:gap-y-16 lg:gap-y-20 md:gap-x-16 lg:gap-x-32 max-w-7xl mx-auto">
        <div className="w-full">
          <LocalizedClientLink href="/men/brands/common-divisor">
            <div className="block w-full">
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src="/images/common_divisor_featured_cover.jpg"
                  alt="Featured Brand: Common Divisor"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="">
                <h3 className="text-xl font-medium text-black mb-2 uppercase">COMMON/DIVISOR</h3>
                <span className="inline-block border border-black text-black font-medium text-sm uppercase px-8 py-3 rounded-lg hover:bg-black hover:text-white transition-colors duration-300">
                  Shop Menswear
                </span>
              </div>
            </div>
          </LocalizedClientLink>
        </div>
        <div className="w-full">
          <LocalizedClientLink href="/women">
          {/*TODO: /brands/taichiism */}
            <div className="block w-full">
              <div className="relative w-full aspect-square mb-4">
                <Image
                  src="/images/taichiism_featured_cover.jpg"
                  alt="Featured Brand: Taichiism"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="px-2 tracking-wide">
                <h3 className="text-xl font-medium text-black mb-2 uppercase">Taichiism</h3>
                <span className="inline-block border border-black text-black font-medium text-sm uppercase px-8 py-3 rounded-lg hover:bg-black hover:text-white transition-colors duration-300">
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
