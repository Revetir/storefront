import React from "react"
import Image from "next/image"
import Link from "next/link"
import { editorials } from "@/lib/data/editorials"

const EditorialSection = () => {
  // Get the first two editorials for display (in reverse order)
  const featuredEditorials = [editorials[1], editorials[0]]

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-12 space-y-12">
      {/* Top row: 2 horizontal images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredEditorials.map((editorial, index) => (
          <div key={editorial.slug} className="w-full">
            <div className="relative h-[560px] w-full mb-4">
              <Link href={`/editorial/${editorial.slug}`}>
                <Image
                  src={editorial.image || ""}
                  alt={editorial.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="rounded-md object-cover"
                />
              </Link>
            </div>
            <div className="px-2 tracking-wide">
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
    </section>
  )
}

export default EditorialSection