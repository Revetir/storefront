import React from "react"
import Image from "next/image"
import Link from "next/link"
import { editorials } from "@/lib/data/editorials"

const EditorialSection = () => {
  // Get the first two editorials for display
  const featuredEditorials = editorials.slice(0, 2)

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-12 space-y-12" style={{opacity: '0.95'}}>
      {/* Top row: 2 horizontal images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featuredEditorials.map((editorial, index) => (
          <div key={editorial.slug} className="w-full">
            <div className="relative h-[560px] w-full mb-4">
              <Link href={`/editorial/${editorial.slug}`}>
                <Image
                  src={editorial.image || ""}
                  alt={editorial.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </Link>
            </div>
            <div className="px-2 tracking-wide">
              <h3 className="text-xl font-medium text-gray-600 mb-2 uppercase" style={{fontSize: '1.1rem', fontWeight: '500', color: '#666'}}>
                {editorial.title}
              </h3>
              {editorial.subtitle && (
                <p className="text-gray-600 text-sm" style={{fontSize: '0.9rem', lineHeight: '1.4', color: '#888'}}>
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