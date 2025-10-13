import React from "react"
import Image from "next/image"
import Link from "next/link"

const NewsSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-12 space-y-20">
      {/* Bottom row: 3 vertical images */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="https://www.youtube.com/watch?v=9UGXQ4K5VtQ" className="block">
          <div className="w-full">
            <div className="w-full h-[400px] relative mb-4">
              <Image
                src="/images/lemaire_nine_frames.png"
                alt="Lemaire Nine Frames Video Thumbnail"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                className="rounded-md object-cover"
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">NINE FRAMES, a LEMAIRE homage to cinema</h3>
              <p className="text-sm text-gray-600">October 13, 2025</p>
            </div>
          </div>
        </Link>
        <Link href="https://www.yahoo.com/lifestyle/articles/gentle-monster-enchants-futuristic-tea-213000143.html" className="block">
          <div className="w-full">
            <div className="w-full h-[400px] relative mb-4">
              <Image
                src="/images/gentle_monster_tea_house.png"
                alt="Gentle Monster Tea House Article"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                className="rounded-md object-cover"
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">Gentle Monster Enchants With Futuristic Tea House</h3>
              <p className="text-sm text-gray-600">October 12, 2025</p>
            </div>
          </div>
        </Link>
        <Link href="https://medium.com/trill-mag/the-end-of-an-era-demnas-last-balenciaga-show-010d75cca738" className="block">
          <div className="w-full">
            <div className="w-full h-[400px] relative mb-4">
              <Image
                src="/images/demna_final_show_goodbye.png"
                alt="Demna Leaves Balenciaga News Article"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                className="rounded-md object-cover"
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">The End Of An Era: Demna at Balenciaga</h3>
              <p className="text-sm text-gray-600">October 10, 2025</p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}

export default NewsSection 