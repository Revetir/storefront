import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getEditorials, getAllStories, getAllSpotlights, urlFor, type SanityEditorial, type SanityStory, type SanitySpotlight } from "@/lib/sanity";

type EditorialArchiveItem = 
  | (SanityEditorial & { itemType: 'editorial' })
  | (SanityStory & { itemType: 'story' })
  | (SanitySpotlight & { itemType: 'spotlight' });

export default async function EditorialArchive() {
  const [editorials, stories, spotlights] = await Promise.all([
    getEditorials(),
    getAllStories(),
    getAllSpotlights(),
  ]);

  // Combine all content into one array with proper typing
  const allContent: EditorialArchiveItem[] = [
    ...editorials.map(item => ({ ...item, itemType: 'editorial' as const })),
    ...stories.map(item => ({ ...item, itemType: 'story' as const })),
    ...spotlights.map(item => ({ ...item, itemType: 'spotlight' as const })),
  ];

  return (
    <section className="w-full px-4 md:px-16 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-left mb-4">Editorial Archive</h1>
          <p className="text-gray-600 text-lg">
            Discover our curated collection of fashion insights and cultural explorations.
          </p>
        </div>

        {/* Simple Grid of All Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allContent.map((item) => {
            if (item.itemType === 'editorial') {
              return (
                <article key={item._id} className="group">
                  <Link href={`/editorial/${item.slug}`} className="block">
                    {item.image?.asset && (
                      <div className="relative w-full h-[300px] mb-4 overflow-hidden">
                        <Image
                          src={urlFor(item.image).width(800).url()}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold group-hover:text-gray-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-gray-600 text-sm">{item.subtitle}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {item.author}</span>
                        <span>{new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            }

            if (item.itemType === 'story') {
              return (
                <article key={item._id} className="group">
                  <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="block">
                    {item.image?.asset && (
                      <div className="relative w-full h-[300px] mb-4 overflow-hidden">
                        <Image
                          src={urlFor(item.image).width(400).height(400).url()}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold group-hover:text-gray-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                  </a>
                </article>
              );
            }

            if (item.itemType === 'spotlight') {
              return (
                <article key={item._id} className="group">
                  <Link href={`/editorial/spotlight/${item.slug}`} className="block">
                    {item.image?.asset && (
                      <div className="relative w-full h-[300px] mb-4 overflow-hidden">
                        <Image
                          src={urlFor(item.image).width(800).url()}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.isActive && (
                          <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded bg-black text-white">
                            Featured
                          </span>
                        )}
                      </div>
                    )}
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold group-hover:text-gray-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-gray-600 text-sm">{item.subtitle}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {item.author}</span>
                        {item.date && (
                          <span>{new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              );
            }

            return null;
          })}
        </div>

        {/* Empty State */}
        {allContent.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No content available at the moment.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon for new content.</p>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="mt-20 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}