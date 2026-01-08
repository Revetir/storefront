import React from "react"
import Link from "next/link"

const EditorialSpotlight = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-16 md:py-24 bg-white">
      <div className="mx-auto text-center space-y-6">
        <Link href="/editorial" className="block space-y-6 cursor-pointer">
          {/* Header Text - Large, Light Weight, Uppercase */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-light uppercase tracking-wide text-gray-900 leading-tight select-none">
            Dance Like Everyone's Watching
          </h1>

          {/* Subheader Text - Large, Normal Weight */}
          <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-normal text-gray-900 mx-auto leading-relaxed select-none">
            Dancer and choreographer Mauro van de Kerkhof models the latest SS26 menswear from Auralee, Dries van Noten, Comme des Garçons, and more.
          </h2>
        </Link>

        {/* CTA Button */}
        <div className="pt-3">
          <Link
            href="/editorial"
            className="inline-block border border-black text-black font-medium text-sm tracking-wider uppercase px-8 py-3 rounded-lg hover:bg-black hover:text-white transition-colors duration-300"
          >
            VIEW EDITORIAL
          </Link>
        </div>
      </div>
    </section>
  )
}

export default EditorialSpotlight
