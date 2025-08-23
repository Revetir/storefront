import React from "react";
import Link from "next/link";
import Image from "next/image";
import { editorials, Editorial } from "@/lib/data/editorials";

export default function EditorialArchive() {
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

        {/* Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {editorials.map((article: Editorial) => (
            <article key={article.slug} className="group">
              <Link href={`/editorial/${article.slug}`} className="block">
                {/* Image */}
                {article.image && (
                  <div className="relative w-full h-[300px] mb-4 overflow-hidden rounded-lg">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold group-hover:text-gray-600 transition-colors">
                    {article.title}
                  </h2>
                  {article.subtitle && (
                    <p className="text-gray-600 text-sm">
                      {article.subtitle}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {article.author}</span>
                    <span>{new Date(article.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {editorials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No editorials available at the moment.</p>
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