import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSpotlightBySlug, urlFor, PortableTextRenderer, type SanitySpotlight } from "@/lib/sanity";
import HeroSection from "../../[slug]/components/HeroSection";

interface SpotlightPageProps {
  params: Promise<{ slug: string; countryCode: string }>;
}

export async function generateMetadata({ params }: SpotlightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const spotlight = await getSpotlightBySlug(slug);

  if (!spotlight) {
    return {
      title: "Spotlight Not Found",
      description: "The requested spotlight could not be found.",
    };
  }

  const imageUrl = spotlight.image?.asset ? urlFor(spotlight.image).width(1200).url() : undefined;
  const seoTitle = spotlight.seoTitle || spotlight.title;
  const seoDescription = spotlight.seoDescription || spotlight.subtitle || spotlight.title;
  
  return {
    title: `${seoTitle} | REVETIR`,
    description: seoDescription,
    authors: [{ name: spotlight.author }],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "article",
      publishedTime: spotlight.date,
      authors: [spotlight.author],
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: spotlight.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function SpotlightPage({ params }: SpotlightPageProps) {
  const { slug } = await params;
  const spotlight = await getSpotlightBySlug(slug);
  
  if (!spotlight) return notFound();

  const isDarkHero = ['blackBackground', 'fullBleed', 'overlay', 'immersive'].includes(spotlight?.heroLayout || '');

  return (
    <article className="editorial-article">
      <HeroSection article={spotlight} />
      <div className={`editorial-content ${isDarkHero ? 'pt-16' : ''}`}>
        <PortableTextRenderer content={spotlight.content || []} />
      </div>
    </article>
  );
}
