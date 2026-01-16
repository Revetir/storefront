import React from "react"
import Image from "next/image"
import Link from "next/link"
import { getFeaturedEditorials, getStories, urlFor, type SanityEditorial, type SanityStory } from "@/lib/sanity"

const EditorialGrid = async () => {
  const editorials = await getFeaturedEditorials(2);
  const stories = await getStories(3);

  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-12 space-y-20">
      {/* Top row: 2 horizontal images - Editorials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
        {editorials.map((editorial) => (
          <div key={editorial.slug} className="w-full">
            <div className="relative w-full aspect-[4/3] mb-4">
              <Link href={`/editorial/${editorial.slug}`}>
                {editorial.image?.asset ? (
                  <Image
                    src={urlFor(editorial.image).width(1200).url()}
                    alt={editorial.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    quality={90}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-100" />
                )}
              </Link>
            </div>
            <div className="tracking-wide">
              <Link href={`/editorial/${editorial.slug}`} className="block">
                <h3 className="text-xl font-medium text-black mb-2 uppercase hover:opacity-80 transition-opacity">
                  {editorial.title}
                </h3>
                {editorial.subtitle && (
                  <p className="text-gray-800 text-md">
                    {editorial.subtitle}
                  </p>
                )}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row: 3 vertical images - Stories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
        {stories.map((story) => (
          <Link key={story._id} href={`/editorial/${story.slug}`} className="block">
            <div className="w-full">
              <div className="w-full aspect-[5/7] relative mb-4">
                {story.image?.asset ? (
                  <Image
                    src={urlFor(story.image).width(600).height(840).url()}
                    alt={story.title}
                    fill
                    className="object-cover"
                    quality={90}
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-white border border-black"
                    aria-hidden
                  />
                )}
              </div>
              <div className="text-left">
                <h3 className="text-xl font-medium text-black mb-2 uppercase">{story.title}</h3>
                {story.subtitle && (
                  <p className="text-gray-800 text-md">{story.subtitle}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default EditorialGrid
