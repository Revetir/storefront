import React from "react"
import Image from "next/image"
import Link from "next/link"
import { editorials } from "@/lib/data/editorials"

const EditorialGrid = () => {
  // Get the first two editorials for display (in reverse order)
  const featuredEditorials = [editorials[1], editorials[0]]

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-12 space-y-20">
      {/* Top row: 2 horizontal images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
        {featuredEditorials.map((editorial, index) => (
          <div key={editorial.slug} className="w-full">
            <div className="relative w-full aspect-[4/3] mb-4">
              <Link href={`/editorial/${editorial.slug}`}>
                <Image
                  src={editorial.image || ""}
                  alt={editorial.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </Link>
            </div>
            <div className="tracking-wide">
              <h3 className="text-xl font-medium text-black mb-2 uppercase">
                {editorial.title}
              </h3>
              {editorial.subtitle && (
                <p className="text-gray-800 text-me">
                  {editorial.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row: 3 vertical images (news section) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
        <Link href="https://www.youtube.com/watch?v=9UGXQ4K5VtQ" className="block">
          <div className="w-full">
            <div className="w-full aspect-[5/7] relative mb-4">
              <div
                className="absolute inset-0 bg-white border border-black"
                aria-hidden
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-light uppercase mb-2">NINE FRAMES, a LEMAIRE homage to cinema</h3>
              <p className="text-sm text-gray-600">November 26, 2025</p>
            </div>
          </div>
        </Link>
        <Link href="https://www.yahoo.com/lifestyle/articles/gentle-monster-enchants-futuristic-tea-213000143.html" className="block">
          <div className="w-full">
            <div className="w-full aspect-[5/7] relative mb-4">
              <div
                className="absolute inset-0 bg-white border border-black"
                aria-hidden
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-light uppercase mb-2">Gentle Monster Enchants With Futuristic Tea House</h3>
              <p className="text-sm text-gray-600">November 24, 2025</p>
            </div>
          </div>
        </Link>
        <Link href="https://medium.com/trill-mag/the-end-of-an-era-demnas-last-balenciaga-show-010d75cca738" className="block">
          <div className="w-full">
            <div className="w-full aspect-[5/7] relative mb-4">
              <div
                className="absolute inset-0 bg-white border border-black"
                aria-hidden
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-light uppercase mb-2">The End Of An Era: Demna at Balenciaga</h3>
              <p className="text-sm text-gray-600">November 20, 2025</p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}

export default EditorialGrid
