"use client"

import Image from "next/image"
import { SanityEditorial, SanityStory, SanitySpotlight } from "@/lib/sanity/queries"
import { urlFor } from "@/lib/sanity"

type Article = SanityEditorial | SanityStory | SanitySpotlight

interface HeroSectionProps {
  article: Article
}

function TitleRenderer({ 
  title, 
  titleStyle, 
  titleLines,
  className = ""
}: { 
  title: string
  titleStyle?: string
  titleLines?: string[]
  className?: string
}) {
  const baseClasses = "font-light tracking-tight"
  
  switch (titleStyle) {
    case 'splitLines':
      if (titleLines && titleLines.length > 0) {
        return (
          <h1 className={`${baseClasses} ${className}`}>
            {titleLines.map((line, i) => (
              <span key={i} className="block text-6xl md:text-8xl lg:text-9xl leading-[0.85] mb-2">
                {line}
              </span>
            ))}
          </h1>
        )
      }
      return <h1 className={`text-6xl md:text-8xl ${baseClasses} ${className}`}>{title}</h1>
    
    case 'oversized':
      return (
        <h1 className={`text-7xl md:text-9xl lg:text-[12rem] leading-[0.8] ${baseClasses} tracking-tighter ${className}`}>
          {title}
        </h1>
      )
    
    case 'stacked':
      const words = title.split(' ')
      return (
        <h1 className={`${baseClasses} ${className}`}>
          {words.map((word, i) => (
            <span key={i} className="block text-5xl md:text-7xl leading-[1.1]">
              {word}
            </span>
          ))}
        </h1>
      )
    
    case 'allCaps':
      return (
        <h1 className={`text-5xl md:text-7xl uppercase tracking-[0.2em] ${baseClasses} ${className}`}>
          {title}
        </h1>
      )
    
    default:
      return (
        <h1 className={`text-5xl md:text-7xl lg:text-8xl ${baseClasses} ${className}`}>
          {title}
        </h1>
      )
  }
}

function Byline({ 
  author, 
  photographer, 
  light = false 
}: { 
  author: string
  photographer?: string
  light?: boolean
}) {
  const textColor = light ? "text-gray-300" : "text-gray-600"
  const labelColor = light ? "text-gray-400" : "text-gray-400"
  
  return (
    <div className={`text-xs uppercase ${textColor}`}>
      <span className={labelColor}>By </span>
      <span className="font-medium">{author}</span>
      {photographer && (
        <>
          <span className={`mx-3 ${labelColor}`}>•</span>
          <span className={labelColor}>Illustrations </span>
          <span className="font-medium">{photographer}</span>
        </>
      )}
    </div>
  )
}

function SocialShare({ light = false }: { light?: boolean }) {
  const iconColor = light ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  
  return (
    <div className="flex items-center gap-4">
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconColor} transition-colors`}
        aria-label="Share on Facebook"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconColor} transition-colors`}
        aria-label="Share on X"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      <a 
        href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${iconColor} transition-colors`}
        aria-label="Share on Pinterest"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
        </svg>
      </a>
    </div>
  )
}

export default function HeroSection({ article }: HeroSectionProps) {
  const { 
    title, 
    subtitle, 
    author, 
    photographer,
    date, 
    image, 
    heroLayout = 'standard',
    heroTextPosition = 'left',
    titleStyle,
    titleLines,
    category
  } = article
  
  const imageUrl = image?.asset ? urlFor(image).width(1920).url() : null

  switch (heroLayout) {
    case 'blackBackground':
      return (
        <header className="bg-black text-white min-h-[80vh] flex flex-col justify-end px-6 md:px-12 lg:px-20 py-16">
          {category && (
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-8">{category}</p>
          )}
          <TitleRenderer 
            title={title} 
            titleStyle={titleStyle} 
            titleLines={titleLines}
            className="text-white mb-6"
          />
          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-8 font-light leading-relaxed">
              {subtitle}
            </p>
          )}
          <Byline author={author} photographer={photographer} light />
          <SocialShare light />
          {imageUrl && (
            <div className="mt-16 -mx-6 md:-mx-12 lg:-mx-20">
              <Image
                src={imageUrl}
                alt={image?.alt || title}
                width={2560}
                height={1706}
                className="w-full h-auto"
                priority
                quality={90}
              />
            </div>
          )}
        </header>
      )

    case 'fullBleed':
      return (
        <header className="relative min-h-screen flex items-end">
          {imageUrl && (
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={image?.alt || title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          )}
          <div className="relative z-10 px-6 md:px-12 lg:px-20 py-16 text-white w-full">
            {category && (
              <p className="text-xs uppercase tracking-[0.3em] text-gray-300 mb-8">{category}</p>
            )}
            <TitleRenderer 
              title={title} 
              titleStyle={titleStyle} 
              titleLines={titleLines}
              className="text-white mb-6"
            />
            {subtitle && (
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mb-8 font-light">
                {subtitle}
              </p>
            )}
            <Byline author={author} photographer={photographer} light />
          <SocialShare light />
          </div>
        </header>
      )

    case 'split':
      const textOnLeft = heroTextPosition === 'left'
      return (
        <header className="min-h-screen grid md:grid-cols-2">
          <div className={`flex flex-col justify-center px-8 md:px-12 lg:px-16 py-16 ${textOnLeft ? 'order-1' : 'order-2'}`}>
            {category && (
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-8">{category}</p>
            )}
            <TitleRenderer 
              title={title} 
              titleStyle={titleStyle} 
              titleLines={titleLines}
              className="mb-6"
            />
            {subtitle && (
              <p className="text-xl md:text-2xl text-gray-600 mb-6 font-light leading-relaxed">
                {subtitle}
              </p>
            )}
            <Byline author={author} photographer={photographer} />
          <div className="mt-3">
          <SocialShare />
          </div>
          </div>
          <div className={`relative min-h-[50vh] md:min-h-full ${textOnLeft ? 'order-2' : 'order-1'}`}>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={image?.alt || title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </header>
      )

    case 'overlay':
      return (
        <header className="relative min-h-[70vh] flex items-center justify-center text-center">
          {imageUrl && (
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={image?.alt || title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}
          <div className="relative z-10 px-6 md:px-12 max-w-5xl text-white">
            {category && (
              <p className="text-xs uppercase tracking-[0.3em] text-gray-200 mb-8">{category}</p>
            )}
            <TitleRenderer 
              title={title} 
              titleStyle={titleStyle} 
              titleLines={titleLines}
              className="text-white mb-6"
            />
            {subtitle && (
              <p className="text-xl md:text-2xl text-gray-100 mb-6 font-light">
                {subtitle}
              </p>
            )}
            <div className="flex flex-col items-center">
              <Byline author={author} photographer={photographer} light />
          <div className="mt-3">
          <SocialShare light />
          </div>
            </div>
          </div>
        </header>
      )

    case 'immersive':
      return (
        <header className="relative h-screen flex flex-col">
          {imageUrl && (
            <div className="absolute inset-0">
              <Image
                src={imageUrl}
                alt={image?.alt || title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
            </div>
          )}
          <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-6 text-white">
            {category && (
              <p className="text-xs uppercase tracking-[0.3em] text-gray-200 mb-8">{category}</p>
            )}
            <TitleRenderer 
              title={title} 
              titleStyle={titleStyle} 
              titleLines={titleLines}
              className="text-white mb-6"
            />
            {subtitle && (
              <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mb-8 font-light">
                {subtitle}
              </p>
            )}
          </div>
          <div className="relative z-10 px-6 md:px-12 py-8 text-white flex justify-between items-end">
            <Byline author={author} photographer={photographer} light />
          <SocialShare light />
            <div className="animate-bounce">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </header>
      )

    case 'oversized':
      return (
        <header className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
          {category && (
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-8">{category}</p>
          )}
          <TitleRenderer 
            title={title} 
            titleStyle="oversized" 
            titleLines={titleLines}
            className="mb-8"
          />
          {subtitle && (
            <p className="text-2xl md:text-3xl text-gray-600 max-w-4xl mb-6 font-light leading-relaxed">
              {subtitle}
            </p>
          )}
          <Byline author={author} photographer={photographer} />
          <div className="mt-3">
          <SocialShare />
          </div>
          {imageUrl && (
            <div className="mt-16">
              <Image
                src={imageUrl}
                alt={image?.alt || title}
                width={1920}
                height={1080}
                className="w-full h-auto"
                priority
              />
              {image?.credit && (
                <p className="text-xs text-gray-400 mt-3 italic">Photo: {image.credit}</p>
              )}
            </div>
          )}
        </header>
      )

    case 'minimal':
      return (
        <header className="px-6 md:px-12 lg:px-20 py-8 md:py-12 max-w-5xl mx-auto text-center">
          {category && (
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-12">{category}</p>
          )}
          <TitleRenderer 
            title={title} 
            titleStyle={titleStyle} 
            titleLines={titleLines}
            className="mb-8"
          />
          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="flex flex-col items-center">
            <Byline author={author} photographer={photographer} />
          <div className="mt-3">
          <SocialShare />
          </div>
          </div>
        </header>
      )

    case 'standard':
    default:
      return (
        <header className="px-6 md:px-12 lg:px-20 py-12">
          {category && (
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">{category}</p>
          )}
          <TitleRenderer 
            title={title} 
            titleStyle={titleStyle} 
            titleLines={titleLines}
            className="mb-4"
          />
          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-4 font-light leading-relaxed">
              {subtitle}
            </p>
          )}
          <Byline author={author} photographer={photographer} />
          <div className="mt-3">
          <SocialShare />
          </div>
          {imageUrl && (
            <div className="mt-12">
              <Image
                src={imageUrl}
                alt={image?.alt || title}
                width={2560}
                height={1706}
                className="w-full h-auto"
                priority
                quality={90}
              />
              {image?.credit && (
                <p className="text-xs text-gray-400 mt-3 italic">Photo: {image.credit}</p>
              )}
            </div>
          )}
        </header>
      )
  }
}
