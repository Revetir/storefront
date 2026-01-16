import React from "react"
import Link from "next/link"
import { getSpotlight } from "@/lib/sanity"

const EditorialSpotlight = async () => {
  const spotlight = await getSpotlight();

  if (!spotlight) return null;

  const { title, subtitle, slug, ctaText } = spotlight;
  
  // Link to the spotlight's own editorial page
  const spotlightUrl = `/editorial/spotlight/${slug}`;

  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="w-[95%] max-w-none mx-auto text-center space-y-6">
        <Link href={spotlightUrl} className="block space-y-6 cursor-pointer">
          {/* Header Text - Large, Light Weight, Uppercase */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-light uppercase tracking-wide text-gray-900 leading-tight select-none">
            {title}
          </h1>

          {/* Subheader Text - Large, Normal Weight */}
          <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-normal text-gray-900 mx-auto leading-relaxed select-none">
            {subtitle}
          </h2>
        </Link>

        {/* CTA Button */}
        <div className="pt-3">
          <Link
            href={spotlightUrl}
            className="inline-block border border-black text-black font-medium text-sm uppercase px-8 py-3 rounded-lg hover:bg-black hover:text-white transition-colors duration-300"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default EditorialSpotlight
