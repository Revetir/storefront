import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEditorialBySlug, getStoryBySlug, urlFor, PortableTextRenderer, type SanityEditorial, type SanityStory } from "@/lib/sanity";
import HeroSection from "./components/HeroSection";

interface EditorialPageProps {
  params: Promise<{ slug: string; countryCode: string }>;
}

type Article = SanityEditorial | SanityStory;

export async function generateMetadata({ params }: EditorialPageProps): Promise<Metadata> {
  const { slug } = await params;
  let article: Article | null = await getEditorialBySlug(slug);
  
  // If no editorial found, check for story
  if (!article) {
    article = await getStoryBySlug(slug);
  }

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The requested article could not be found.",
    };
  }

  const imageUrl = article.image?.asset ? urlFor(article.image).width(1200).url() : undefined;
  const seoTitle = article.seoTitle || article.title;
  const seoDescription = article.seoDescription || article.subtitle || article.title;
  
  return {
    title: `${seoTitle} | REVETIR`,
    description: seoDescription,
    authors: [{ name: article.author }],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: article.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function EditorialPage({ params }: EditorialPageProps) {
  const { slug } = await params;
  let article: Article | null = await getEditorialBySlug(slug);
  
  // If no editorial found, check for story
  if (!article) {
    article = await getStoryBySlug(slug);
  }
  
  if (!article) return notFound();

  const isDarkHero = ['blackBackground', 'fullBleed', 'overlay', 'immersive'].includes(article?.heroLayout || '');

  return (
    <article className="editorial-article">
      <HeroSection article={article} />
      <div className={`editorial-content ${isDarkHero ? 'pt-16' : ''}`}>
        <PortableTextRenderer content={article.content || []} />
      </div>
    </article>
  );
}