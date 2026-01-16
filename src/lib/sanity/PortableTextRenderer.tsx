"use client"

import { PortableText, PortableTextComponents } from "@portabletext/react"
import Image from "next/image"
import { urlFor } from "./client"

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) return null
      return (
        <figure className="my-10 mb-8 text-center">
          <Image
            src={urlFor(value).width(1200).quality(100).url()}
            alt={value.alt || "Editorial image"}
            width={1200}
            height={900}
            className="w-full h-auto max-w-[600px] mx-auto"
          />
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-600 mt-3 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    attributedQuote: ({ value }) => {
      const styles: Record<string, string> = {
        pullQuote: "text-center py-12 my-20",
        blockQuote: "border-l-4 border-black pl-8 py-4 my-12",
        inline: "bg-gray-50 p-8 my-12",
      }
      const style = value.style || "blockQuote"
      return (
        <div className={styles[style] || styles.blockQuote}>
          <p className={`${style === "pullQuote" ? "text-2xl md:text-3xl" : "text-xl"} leading-relaxed mb-4 italic text-gray-800`}>
            &ldquo;{value.quote}&rdquo;
          </p>
          {value.attribution && (
            <p className="text-sm uppercase tracking-widest text-gray-500">
              — {value.attribution}
            </p>
          )}
        </div>
      )
    },
    pullQuote: ({ value }) => {
      const style = value.style || "largeCentered"
      const size = value.size || "large"
      
      const sizeClasses: Record<string, string> = {
        normal: "text-2xl md:text-3xl",
        large: "text-3xl md:text-4xl lg:text-5xl",
        xlarge: "text-4xl md:text-6xl lg:text-7xl",
      }

      if (style === "oversized") {
        return (
          <div className="my-24 md:my-32 py-16 -mx-5 md:-mx-20 lg:-mx-40 px-5 md:px-20 lg:px-40 text-center">
            <p className="text-4xl md:text-6xl lg:text-8xl leading-[0.9] font-light text-gray-900 tracking-tight">
              &ldquo;{value.quote}&rdquo;
            </p>
            {value.attribution && (
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mt-8">
                — {value.attribution}
              </p>
            )}
          </div>
        )
      }

      if (style === "withBorder") {
        return (
          <div className="my-20 py-12 border-t-[3px] border-b-[3px] border-black text-center">
            <p className={`${sizeClasses[size]} leading-tight font-light text-gray-900`}>
              &ldquo;{value.quote}&rdquo;
            </p>
            {value.attribution && (
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mt-6">
                — {value.attribution}
              </p>
            )}
          </div>
        )
      }

      if (style === "leftAligned" || style === "minimal") {
        return (
          <div className="my-16 py-8 border-l-4 border-gray-900 pl-8">
            <p className={`${sizeClasses[size]} leading-snug font-light text-gray-800`}>
              &ldquo;{value.quote}&rdquo;
            </p>
            {value.attribution && (
              <p className="text-sm uppercase tracking-widest text-gray-500 mt-4">
                — {value.attribution}
              </p>
            )}
          </div>
        )
      }
      
      return (
        <div className="my-20 md:my-28 py-12 text-center">
          <p className={`${sizeClasses[size]} leading-tight font-light text-gray-900 max-w-4xl mx-auto`}>
            &ldquo;{value.quote}&rdquo;
          </p>
          {value.attribution && (
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mt-6">
              — {value.attribution}
            </p>
          )}
        </div>
      )
    },
    callout: ({ value }) => {
      const bgColors: Record<string, string> = {
        lightGray: "bg-gray-100",
        cream: "bg-amber-50",
        black: "bg-black text-white",
        accent: "bg-gray-900 text-white",
        none: "",
      }
      
      if (value.style === "featured") {
        return (
          <div className="mt-16 mb-20 -mx-5 md:-mx-20 lg:-mx-40 px-8 md:px-24 lg:px-48 py-16 bg-black text-white">
            {value.title && (
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-6">{value.title}</p>
            )}
            <div className="text-lg leading-relaxed text-gray-200">
              <PortableText value={value.content} components={components} />
            </div>
          </div>
        )
      }
      
      if (value.style === "quoteCard") {
        return (
          <div className={`mt-16 mb-20 p-10 md:p-14 text-center ${bgColors[value.backgroundColor] || bgColors.cream}`}>
            {value.title && (
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-6">{value.title}</p>
            )}
            <div className="text-xl md:text-2xl leading-relaxed text-gray-800">
              <PortableText value={value.content} components={components} />
            </div>
          </div>
        )
      }
      
      if (value.style === "warning") {
        return (
          <div className="mt-12 mb-16 p-6 bg-amber-50 border-l-4 border-amber-500">
            {value.title && <p className="font-medium text-amber-800 mb-2">{value.title}</p>}
            <div className="text-amber-900">
              <PortableText value={value.content} components={components} />
            </div>
          </div>
        )
      }
      
      return (
        <div className="mt-12 mb-16 p-6 bg-gray-50 border-l-4 border-gray-300">
          {value.title && <p className="font-medium text-gray-800 mb-2">{value.title}</p>}
          <div className="text-gray-700">
            <PortableText value={value.content} components={components} />
          </div>
        </div>
      )
    },
    spacer: ({ value }) => {
      const sizes: Record<string, string> = { small: "h-12", medium: "h-20", large: "h-32", xlarge: "h-48" }
      if (value.type === "line") return (
        <div className="mt-24 mb-12">
          <hr className="border-t border-gray-200" />
        </div>
      )
      if (value.type === "wideLine") return (
        <div className="mt-24 mb-12 relative">
          <hr 
            className="border-t border-gray-300 absolute left-1/2 -translate-x-1/2" 
            style={{ width: 'calc(100% + 200px)', maxWidth: '900px' }}
          />
        </div>
      )
      if (value.type === "dots") return (
        <div className="mt-20 mb-10 text-center text-xl tracking-[0.5em] text-gray-300">
          • • •
        </div>
      )
      if (value.type === "decorative") return (
        <div className="mt-28 mb-14 flex items-center justify-center gap-6">
          <div className="w-16 h-px bg-gray-300" />
          <span className="text-gray-400 text-sm">✦</span>
          <div className="w-16 h-px bg-gray-300" />
        </div>
      )
      return <div className={`${sizes[value.size] || sizes.medium}`} />
    },
    positionedText: ({ value }) => {
      // Width classes - content-relative or viewport-relative
      const widthClasses: Record<string, string> = {
        narrow: "w-full md:w-2/5",
        medium: "w-full md:w-3/5",
        wide: "w-full md:w-4/5",
        full: "w-full",
        // Viewport-relative widths use margin to break out of parent constraints
        "viewport-wide": "w-screen max-w-none mx-auto",
        "viewport-extrawide": "w-screen max-w-none mx-auto", 
        "viewport-full": "w-screen max-w-none mx-auto",
      }
      
      // Block alignment (where the block sits in the parent)
      const alignmentClasses: Record<string, string> = {
        left: "",
        center: "mx-auto",
        right: "ml-auto",
      }
      
      // Text alignment (how text flows inside the block)
      const textAlignClasses: Record<string, string> = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      }
      
      // Handle both new schema (width, alignment, textAlign) and old schema (position, width, breakoutWidth)
      const width = value.width || "medium"
      // Old schema: position was used for both block alignment and text alignment
      const alignment = value.alignment || value.position || "left"
      const textAlign = value.textAlign || value.position || "left"
      
      // For viewport widths, alignment is handled by the centering transform
      const isViewportWidth = width.startsWith("viewport-")
      const alignClass = isViewportWidth ? "" : alignmentClasses[alignment]
      
      // For viewport widths, we need a wrapper that breaks out and inner container for content width
      if (isViewportWidth) {
        const innerWidthClasses: Record<string, string> = {
          "viewport-wide": "max-w-[80vw]",
          "viewport-extrawide": "max-w-[90vw]",
          "viewport-full": "max-w-none",
        }
        
        return (
          <div className="relative my-8">
            <div className={`${widthClasses[width]} ${textAlignClasses[textAlign]}`}>
              <div className={`${innerWidthClasses[width]} mx-auto px-6`}>
                <PortableText value={value.text} components={components} />
              </div>
            </div>
          </div>
        )
      }
      
      return (
        <div className={`my-8 ${widthClasses[width] || widthClasses.medium} ${alignClass} ${textAlignClasses[textAlign]}`}>
          <PortableText value={value.text} components={components} />
        </div>
      )
    },
    bilingualText: ({ value }) => {
      if (value.layout === "sideBySide") {
        return (
          <div className="grid md:grid-cols-2 gap-8 my-12">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">EN</p>
              <PortableText value={value.primaryText} components={components} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{value.secondaryLanguage?.toUpperCase() || "ALT"}</p>
              <PortableText value={value.secondaryText} components={components} />
            </div>
          </div>
        )
      }
      return (
        <div className="my-12">
          <PortableText value={value.primaryText} components={components} />
          <div className="mt-4 text-gray-600">
            <PortableText value={value.secondaryText} components={components} />
          </div>
        </div>
      )
    },
    authorBio: ({ value }) => (
      <div className="mt-32 pt-12 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-8 items-start">
          {value.photo?.asset && (
            <Image
              src={urlFor(value.photo).width(200).height(200).quality(100).url()}
              alt={value.name || "Author"}
              width={200}
              height={200}
              className="rounded-full flex-shrink-0 grayscale w-[100px] h-[100px]"
            />
          )}
          <div className="pt-2">
            <p className="text-lg font-medium">{value.name}</p>
            {value.role && (
              <p className="text-xs uppercase text-gray-500 mt-1 mb-4">{value.role}</p>
            )}
            {value.bio && (
              <p className="text-sm text-gray-600 leading-relaxed italic max-w-md">{value.bio}</p>
            )}
            {value.socialLinks && (
              <div className="flex gap-4 mt-4">
                {value.socialLinks.twitter && (
                  <a href={value.socialLinks.twitter} className="text-gray-400 hover:text-gray-700 transition-colors text-sm">Twitter</a>
                )}
                {value.socialLinks.instagram && (
                  <a href={value.socialLinks.instagram} className="text-gray-400 hover:text-gray-700 transition-colors text-sm">Instagram</a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    creditsBlock: ({ value }) => (
      <div className="mt-12 py-8 text-center">
        {value.credits?.map((credit: { role: string; names?: string[]; agency?: string }, i: number) => (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold">{credit.role}:</span>{" "}
            <span>{credit.names?.join(", ") || ""}</span>
            {credit.agency && <span className="text-gray-400"> / {credit.agency}</span>}
          </p>
        ))}
        {value.date && (
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold">Date:</span> {value.date}
          </p>
        )}
      </div>
    ),
    imageWithCaption: ({ value }) => {
      if (!value?.image?.asset) return null
      const sizes: Record<string, string> = { 
        small: "max-w-md", 
        medium: "max-w-2xl", 
        large: "max-w-4xl", 
        fullBleed: "" 
      }
      const aligns: Record<string, string> = { left: "", center: "mx-auto", right: "ml-auto" }
      
      if (value.size === "fullBleed") {
        return (
          <figure className="my-20 mb-12 relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
            <Image
              src={urlFor(value.image).width(1920).quality(100).url()}
              alt={value.image.alt || ""}
              width={1920}
              height={1080}
              className="w-full h-auto"
            />
            {(value.caption || value.credit) && (
              <figcaption className="text-xs text-gray-500 mt-4 px-5 md:px-20 lg:px-40">
                {value.caption && <span>{value.caption}</span>}
                {value.credit && <span className="italic text-gray-400 ml-2">© {value.credit}</span>}
              </figcaption>
            )}
          </figure>
        )
      }
      
      return (
        <figure className={`my-16 mb-10 ${sizes[value.size] || sizes.large} ${aligns[value.alignment] || aligns.center}`}>
          <Image
            src={urlFor(value.image).width(1400).quality(100).url()}
            alt={value.image.alt || ""}
            width={1400}
            height={1000}
            className="w-full h-auto"
          />
          {(value.caption || value.credit) && (
            <figcaption className="text-xs text-gray-500 mt-4">
              {value.caption && <span>{value.caption}</span>}
              {value.credit && <span className="italic text-gray-400 ml-2">© {value.credit}</span>}
            </figcaption>
          )}
        </figure>
      )
    },
    fullWidthImage: ({ value }) => {
      if (!value?.image?.asset) return null
      const aspectClasses: Record<string, string> = {
        natural: "",
        "16:9": "aspect-video",
        "4:3": "aspect-[4/3]",
        "1:1": "aspect-square",
        "2:3": "aspect-[2/3]",
      }
      const overlayPositions: Record<string, string> = {
        center: "items-center justify-center text-center",
        bottomLeft: "items-end justify-start text-left pb-8 pl-8",
        bottomRight: "items-end justify-end text-right pb-8 pr-8",
        topLeft: "items-start justify-start text-left pt-8 pl-8",
      }
      
      return (
        <figure className="my-24 mb-16 relative" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
          <div className={`relative overflow-hidden ${aspectClasses[value.aspectRatio] || ""}`}>
            <Image
              src={urlFor(value.image).width(2400).quality(100).url()}
              alt={value.image.alt || ""}
              width={2400}
              height={1350}
              className={`w-full ${value.aspectRatio && value.aspectRatio !== "natural" ? "object-cover h-full" : "h-auto"}`}
            />
            {value.overlayText && (
              <div className={`absolute inset-0 flex ${overlayPositions[value.overlayPosition] || overlayPositions.center} bg-black/30`}>
                <p className="text-white text-2xl md:text-4xl font-light max-w-2xl px-6">{value.overlayText}</p>
              </div>
            )}
          </div>
          {(value.caption || value.credit) && (
            <figcaption className="text-xs text-gray-500 mt-4 px-5 md:px-20 lg:px-40">
              {value.caption && <span>{value.caption}</span>}
              {value.credit && <span className="italic text-gray-400 ml-2">© {value.credit}</span>}
            </figcaption>
          )}
        </figure>
      )
    },
    imageGrid: ({ value }) => {
      const gaps: Record<string, string> = {
        none: "gap-0",
        small: "gap-2",
        medium: "gap-4",
        large: "gap-8",
      }
      const layouts: Record<string, string> = {
        twoColumn: "grid-cols-1 md:grid-cols-2",
        threeColumn: "grid-cols-1 md:grid-cols-3",
        fourColumn: "grid-cols-2 md:grid-cols-4",
        asymmetric: "grid-cols-3",
        masonry: "columns-2 md:columns-3",
      }
      const verticalAlignments: Record<string, string> = {
        top: "items-start",
        center: "items-center",
        bottom: "items-end",
      }
      const breakoutStyles: Record<string, React.CSSProperties> = {
        content: {},
        wide: { width: '850px', maxWidth: '85vw', marginLeft: 'auto', marginRight: 'auto', position: 'relative' as const, left: '50%', transform: 'translateX(-50%)' },
        extrawide: { width: '1100px', maxWidth: '90vw', marginLeft: 'auto', marginRight: 'auto', position: 'relative' as const, left: '50%', transform: 'translateX(-50%)' },
        full: { width: '100vw', marginLeft: 'calc(-50vw + 50%)' },
      }
      const gapClass = gaps[value.gap] || gaps.medium
      const alignClass = verticalAlignments[value.verticalAlign] || verticalAlignments.top
      const breakoutStyle = breakoutStyles[value.breakoutWidth] || breakoutStyles.content
      
      if (value.layout === "threeWithQuote") {
        const quoteAlignments: Record<string, string> = {
          top: "justify-start",
          center: "justify-center",
          bottom: "justify-end",
        }
        const alignClass = quoteAlignments[value.quoteAlignment] || quoteAlignments.center
        const images = value.images?.slice(0, 3) || []
        
        return (
          <div 
            className={`my-20 mb-12 grid grid-cols-1 md:grid-cols-2 ${gapClass} relative`}
            style={breakoutStyle}
          >
            {/* First image - top left */}
            {images[0]?.asset && (
              <div className="aspect-square">
                <Image 
                  src={urlFor(images[0]).width(600).quality(100).url()} 
                  alt={images[0].alt || ""} 
                  width={600} 
                  height={600} 
                  className="w-full h-full object-cover" 
                />
                {value.showCaptions && images[0].caption && (
                  <p className="text-xs text-gray-500 mt-2">{images[0].caption}</p>
                )}
              </div>
            )}
            {/* Second image - top right */}
            {images[1]?.asset && (
              <div className="aspect-square">
                <Image 
                  src={urlFor(images[1]).width(600).quality(100).url()} 
                  alt={images[1].alt || ""} 
                  width={600} 
                  height={600} 
                  className="w-full h-full object-cover" 
                />
                {value.showCaptions && images[1].caption && (
                  <p className="text-xs text-gray-500 mt-2">{images[1].caption}</p>
                )}
              </div>
            )}
            {/* Third image - bottom left */}
            {images[2]?.asset && (
              <div className="aspect-square">
                <Image 
                  src={urlFor(images[2]).width(600).quality(100).url()} 
                  alt={images[2].alt || ""} 
                  width={600} 
                  height={600} 
                  className="w-full h-full object-cover" 
                />
                {value.showCaptions && images[2].caption && (
                  <p className="text-xs text-gray-500 mt-2">{images[2].caption}</p>
                )}
              </div>
            )}
            {/* Quote - bottom right */}
            <div className={`flex flex-col ${alignClass} p-6 md:p-8`}>
              {value.quote && (
                <blockquote className="text-xl md:text-2xl font-light italic text-gray-800 leading-relaxed">
                  &ldquo;{value.quote}&rdquo;
                </blockquote>
              )}
              {value.quoteAttribution && (
                <p className="text-sm uppercase tracking-widest text-gray-500 mt-4">
                  — {value.quoteAttribution}
                </p>
              )}
            </div>
          </div>
        )
      }
      
      if (value.layout === "masonry") {
        return (
          <div 
            className={`my-20 ${layouts.masonry} ${gapClass} relative`}
            style={breakoutStyle}
          >
            {value.images?.map((img: any, i: number) => (
              img?.asset && (
                <div key={i} className="mb-4 break-inside-avoid">
                  <Image src={urlFor(img).width(500).quality(100).url()} alt={img.alt || ""} width={500} height={625} className="w-full h-auto" />
                  {value.showCaptions && img.caption && (
                    <p className="text-xs text-gray-500 mt-2">{img.caption}</p>
                  )}
                </div>
              )
            ))}
          </div>
        )
      }
      
      if (value.layout === "asymmetric") {
        return (
          <div 
            className={`my-20 grid grid-cols-1 md:grid-cols-3 gap-4 ${alignClass} relative`}
            style={breakoutStyle}
          >
            {value.images?.map((img: any, i: number) => (
              img?.asset && (
                <div key={i} className={i === 0 ? "md:col-span-2 md:row-span-2" : ""}>
                  <Image 
                    src={urlFor(img).width(i === 0 ? 800 : 400).quality(100).url()} 
                    alt={img.alt || ""} 
                    width={i === 0 ? 800 : 400} 
                    height={i === 0 ? 900 : 500} 
                    className="w-full h-full object-cover" 
                  />
                  {value.showCaptions && img.caption && (
                    <p className="text-xs text-gray-500 mt-2">{img.caption}</p>
                  )}
                </div>
              )
            ))}
          </div>
        )
      }
      
      return (
        <div 
          className={`my-20 grid ${layouts[value.layout] || layouts.twoColumn} ${gapClass} ${alignClass} relative`}
          style={breakoutStyle}
        >
          {value.images?.map((img: any, i: number) => (
            img?.asset && (
              <div key={i}>
                <Image src={urlFor(img).width(500).quality(100).url()} alt={img.alt || ""} width={500} height={625} className="w-full h-auto" />
                {value.showCaptions && img.caption && (
                  <p className="text-xs text-gray-500 mt-3">{img.caption}</p>
                )}
              </div>
            )
          ))}
        </div>
      )
    },
    twoColumnGrid: ({ value }) => {
      const ratios: Record<string, string> = {
        equal: "1fr 1fr",
        imageLarger: "3fr 2fr",
        textLarger: "2fr 3fr",
      }
      const breakoutStyles: Record<string, React.CSSProperties> = {
        content: {},
        wide: { width: '950px', maxWidth: '90vw', marginLeft: 'auto', marginRight: 'auto', position: 'relative' as const, left: '50%', transform: 'translateX(-50%)' },
        extrawide: { width: '1200px', maxWidth: '95vw', marginLeft: 'auto', marginRight: 'auto', position: 'relative' as const, left: '50%', transform: 'translateX(-50%)' },
      }
      const breakoutStyle = breakoutStyles[value.breakoutWidth] || breakoutStyles.wide
      
      const imageEl = value.image?.asset && (
        <div className="relative">
          <Image 
            src={urlFor(value.image).width(800).quality(100).url()} 
            alt={value.image.alt || ""} 
            width={800} 
            height={1000} 
            className="w-full h-auto" 
          />
          {value.image.caption && (
            <p className="text-xs text-gray-500 mt-3">{value.image.caption}</p>
          )}
        </div>
      )
      const textEl = (
        <div className={`flex flex-col px-0 md:px-6 ${value.verticalAlign === "bottom" ? "justify-end" : value.verticalAlign === "center" ? "justify-center" : "justify-start"}`}>
          <PortableText value={value.text} components={components} />
        </div>
      )

      const ratioClass: Record<string, string> = {
        equal: "md:grid-cols-2",
        imageLarger: "md:[grid-template-columns:3fr_2fr]",
        textLarger: "md:[grid-template-columns:2fr_3fr]",
      }

      return (
        <div 
          className={`mt-20 pb-20 grid grid-cols-1 gap-12 items-center relative ${ratioClass[value.columnRatio] || ratioClass.equal}`}
          style={breakoutStyle}
        >
          {value.imagePosition === "right" ? <>{textEl}{imageEl}</> : <>{imageEl}{textEl}</>}
        </div>
      )
    },
    videoEmbed: ({ value }) => {
      const isFullWidth = value.layout === "fullWidth"
      const wrapperStyle = isFullWidth 
        ? { width: '100vw', marginLeft: 'calc(-50vw + 50%)' }
        : {}
      
      return (
        <div className={`my-12 ${isFullWidth ? 'relative' : ''}`} style={wrapperStyle}>
          {value.videoType === "youtube" && (value.youtubeUrl || value.url) && (
            <div className="aspect-video">
              <iframe
                src={(value.youtubeUrl || value.url).replace("watch?v=", "embed/")}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {value.videoType === "vimeo" && (value.vimeoUrl || value.url) && (
            <div className="aspect-video">
              <iframe src={(value.vimeoUrl || value.url).replace("vimeo.com", "player.vimeo.com/video")} className="w-full h-full" allowFullScreen />
            </div>
          )}
          {value.caption && (
            <p className={`text-sm text-gray-600 mt-3 ${isFullWidth ? 'px-5 md:px-20 lg:px-40' : ''}`}>
              {value.caption}
            </p>
          )}
        </div>
      )
    },
    interview: ({ value }) => {
      const styleClasses: Record<string, { container: string; speaker: string; exchange: string }> = {
        standard: {
          container: "space-y-8",
          speaker: "text-xs uppercase tracking-[0.2em] font-medium text-gray-500 mb-3",
          exchange: "pb-8 border-b border-gray-100 last:border-0",
        },
        boldNames: {
          container: "space-y-6",
          speaker: "text-sm font-bold uppercase tracking-wide mb-2",
          exchange: "pb-6",
        },
        alternating: {
          container: "space-y-0",
          speaker: "text-xs uppercase tracking-[0.2em] font-medium mb-3",
          exchange: "p-8",
        },
      }
      const style = value.style || "standard"
      const classes = styleClasses[style] || styleClasses.standard
      
      return (
        <div className={`my-20 ${classes.container}`}>
          {value.exchanges?.map((exchange: { speaker: string; text: any }, i: number) => (
            <div 
              key={i} 
              className={`${classes.exchange} ${style === "alternating" && i % 2 === 0 ? "bg-gray-50" : ""}`}
            >
              <p className={classes.speaker}>{exchange.speaker}</p>
              <div className="text-lg leading-relaxed">
                <PortableText value={exchange.text} components={components} />
              </div>
            </div>
          ))}
        </div>
      )
    },
    accordion: ({ value }) => {
      const styles: Record<string, { summary: string; details: string }> = {
        azIndex: {
          summary: "py-8 cursor-pointer text-3xl md:text-4xl font-light tracking-tight flex justify-between items-center group",
          details: "border-b border-gray-200",
        },
        faq: {
          summary: "py-6 cursor-pointer text-lg font-medium flex justify-between items-center group",
          details: "border-b border-gray-200",
        },
        chapters: {
          summary: "py-6 cursor-pointer text-xl font-light uppercase tracking-widest flex justify-between items-center group",
          details: "border-b border-gray-100",
        },
        minimal: {
          summary: "py-4 cursor-pointer text-base flex justify-between items-center group",
          details: "border-b border-gray-100",
        },
      }
      const style = value.style || "faq"
      const classes = styles[style] || styles.faq
      
      return (
        <div className="my-20 border-t border-gray-200">
          {value.items?.map((item: { heading: string; content: any }, i: number) => (
            <details key={i} className={classes.details}>
              <summary className={classes.summary}>
                <span>{item.heading}</span>
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-2xl font-light">+</span>
              </summary>
              <div className="pb-8 pt-2 text-gray-600 leading-relaxed">
                <PortableText value={item.content} components={components} />
              </div>
            </details>
          ))}
        </div>
      )
    },
    numberedGallery: ({ value }) => {
      const numberStyles: Record<string, string> = {
        padded: "",
        simple: "",
        roman: "",
      }
      const formatNumber = (n: number, style: string) => {
        if (style === "roman") {
          const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
          return romans[n] || String(n + 1)
        }
        if (style === "simple") return String(n + 1)
        return String(n + 1).padStart(2, "0")
      }
      const numberStyle = value.numberStyle || "padded"
      
      if (value.layout === "slideshow") {
        return (
          <div className="my-20 relative overflow-x-auto" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
            <div className="flex gap-6 px-5 md:px-20 lg:px-40 pb-4">
              {value.items?.map((item: { image: any; caption?: string; products?: any[] }, i: number) => (
                <div key={i} className="flex-shrink-0 w-[70vw] md:w-[50vw] lg:w-[40vw]">
                  {value.showNumbers && (
                    <span className="text-4xl font-light text-gray-200 mb-4 block">{formatNumber(i, numberStyle)}</span>
                  )}
                  {item.image?.asset && (
                    <Image src={urlFor(item.image).width(800).quality(100).url()} alt={item.image.alt || ""} width={800} height={1000} className="w-full h-auto" />
                  )}
                  {item.caption && <p className="text-sm text-gray-600 mt-4">{item.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        )
      }
      
      return (
        <div className={`my-20 ${value.layout === "twoColumn" ? "grid md:grid-cols-2 gap-12" : "space-y-16"}`}>
          {value.items?.map((item: { image: any; caption?: string; products?: any[] }, i: number) => (
            <div key={i} className="flex gap-6">
              {value.showNumbers && (
                <span className="text-4xl md:text-5xl font-light text-gray-200 leading-none">{formatNumber(i, numberStyle)}</span>
              )}
              <div className="flex-1">
                {item.image?.asset && (
                  <Image src={urlFor(item.image).width(600).quality(100).url()} alt={item.image.alt || ""} width={600} height={750} className="w-full h-auto" />
                )}
                {item.caption && <p className="text-sm text-gray-600 mt-4">{item.caption}</p>}
                {item.products && item.products.length > 0 && (
                  <div className="mt-4 text-xs text-gray-500">
                    {item.products.map((p: any, j: number) => (
                      <span key={j}>
                        {j > 0 && ", "}
                        <span className="font-medium">{p.brand}</span> {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    },
    productFeature: ({ value }) => {
      type Product = {
        image: any;
        brand?: string;
        name?: string;
        price?: string;
        salePrice?: string;
        url?: string;
        description?: string;
      }

      const layouts: Record<string, string> = {
        grid: "grid grid-cols-2 md:grid-cols-4 gap-8",
        horizontalScroll: "flex gap-8 overflow-x-auto pb-4 -mx-5 px-5",
        list: "space-y-6",
        featuredSingle: "max-w-lg mx-auto",
      }
      const layout = value.layout || "grid"
      
      if (layout === "featuredSingle" && value.products?.[0]) {
        const product = value.products[0]
        return (
          <div className="my-20 text-center">
            {value.title && <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-8">{value.title}</p>}
            {product.image?.asset && (
              <Image src={urlFor(product.image).width(800).quality(100).url()} alt={product.name || ""} width={800} height={1000} className="w-full max-w-md mx-auto h-auto mb-6" />
            )}
            {product.brand && <p className="text-base font-medium uppercase text-gray-500 mb-1">{product.brand}</p>}
            {product.name && <p className="text-lg text-gray-600 font-medium mb-2 leading-snug">{product.name}</p>}
            {product.description && <p className="text-sm text-gray-600 mb-3 max-w-sm mx-auto">{product.description}</p>}
            {value.showPrices && product.price && (
              <div className="flex items-center gap-1.5">
                {product.salePrice ? (
                  <>
                    <span className="font-medium text-gray-900 text-sm">{product.salePrice}</span>
                    <span className="line-through text-gray-500 text-sm">{product.price}</span>
                  </>
                ) : (
                  <span className="text-gray-800 text-sm">{product.price}</span>
                )}
              </div>
            )}
            {product.url && (
              <a href={product.url} className="inline-block mt-4 text-xs uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">Shop Now</a>
            )}
          </div>
        )
      }
      
      if (layout === "list") {
        return (
          <div className="my-20">
            {value.title && <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-8">{value.title}</p>}
            <div className={layouts.list}>
              {value.products?.map((product: Product, i: number) => (
                <div key={i} className="flex gap-6 items-start py-6 border-b border-gray-100 last:border-0">
                  {product.image?.asset && (
                    product.url ? (
                      <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                        <Image src={urlFor(product.image).width(400).quality(100).url()} alt={product.name || ""} width={400} height={500} className="w-24 h-auto flex-shrink-0" />
                      </a>
                    ) : (
                      <Image src={urlFor(product.image).width(400).quality(100).url()} alt={product.name || ""} width={400} height={500} className="w-24 h-auto flex-shrink-0" />
                    )
                  )}
                  <div>
                    {product.brand && <p className="text-base font-medium uppercase text-gray-500 mb-1">{product.brand}</p>}
                    {product.name && <p className="text-sm text-gray-600 leading-snug break-words mb-1">{product.name}</p>}
                    {product.description && <p className="text-sm text-gray-600 mb-2">{product.description}</p>}
                    {value.showPrices && product.price && (
                      <div className="flex items-center gap-1.5">
                        {product.salePrice ? (
                          <>
                            <span className="font-medium text-gray-900 text-sm">{product.salePrice}</span>
                            <span className="line-through text-gray-500 text-sm">{product.price}</span>
                          </>
                        ) : (
                          <span className="text-gray-800 text-sm">{product.price}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
      
      return (
        <div className="my-20">
          {value.title && <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-8">{value.title}</p>}
          <div className={layouts[layout] || layouts.grid}>
            {value.products?.map((product: Product, i: number) => (
              <div key={i} className={layout === "horizontalScroll" ? "flex-shrink-0 w-56" : ""}>
                {product.image?.asset && (
                  product.url ? (
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                      <Image src={urlFor(product.image).width(600).quality(100).url()} alt={product.name || ""} width={600} height={750} className="w-full h-auto mb-4" />
                    </a>
                  ) : (
                    <Image src={urlFor(product.image).width(600).quality(100).url()} alt={product.name || ""} width={600} height={750} className="w-full h-auto mb-4" />
                  )
                )}
                {product.brand && <p className="text-base font-medium uppercase text-gray-500 mb-1">{product.brand}</p>}
                {product.name && <p className="text-sm text-gray-600 leading-snug break-words">{product.name}</p>}
                {value.showPrices && product.price && (
                  <div className="flex items-center gap-1.5">
                    {product.salePrice ? (
                      <>
                        <span className="font-medium text-gray-900 text-sm">{product.salePrice}</span>
                        <span className="line-through text-gray-500 text-sm">{product.price}</span>
                      </>
                    ) : (
                      <span className="text-gray-600 text-sm">{product.price}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    },
    hoverRevealGallery: ({ value }) => {
      const gaps: Record<string, string> = {
        none: "gap-0",
        minimal: "gap-1",
        small: "gap-2",
        medium: "gap-4",
      }
      
      const layouts: Record<string, string> = {
        twoColumn: "grid-cols-1 sm:grid-cols-2",
        threeColumn: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        fourColumn: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        masonry: "columns-2 lg:columns-3 xl:columns-4",
      }
      
      const aspectRatios: Record<string, string> = {
        square: "aspect-square",
        portrait: "aspect-[3/4]",
        landscape: "aspect-[4/3]",
        wide: "aspect-video",
        natural: "",
      }
      
      const overlayStyles: Record<string, string> = {
        dark: "bg-black/90",
        light: "bg-white/90",
        gradient: "bg-gradient-to-t from-black/95 via-black/85 to-black/70",
        blur: "bg-black/85 backdrop-blur-sm",
      }
      
      const textColors: Record<string, string> = {
        dark: "text-white",
        light: "text-gray-900",
        gradient: "text-white",
        blur: "text-white",
      }
      
      const textPositions: Record<string, string> = {
        center: "items-center justify-center text-center",
        bottomLeft: "items-end justify-start text-left pb-6 pl-6",
        bottomCenter: "items-end justify-center text-center pb-6",
      }
      
      const breakoutWidths: Record<string, { wrapper: string; style?: React.CSSProperties }> = {
        content: { wrapper: "" },
        wide: { 
          wrapper: "relative", 
          style: { width: '80vw', marginLeft: 'calc(-40vw + 50%)', marginRight: 'calc(-40vw + 50%)' }
        },
        extrawide: { 
          wrapper: "relative", 
          style: { width: '90vw', marginLeft: 'calc(-45vw + 50%)', marginRight: 'calc(-45vw + 50%)' }
        },
        full: { 
          wrapper: "relative", 
          style: { width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }
        },
      }
      
      const gapClass = gaps[value.gap] || gaps.minimal
      const layoutClass = layouts[value.layout] || layouts.threeColumn
      const aspectClass = aspectRatios[value.aspectRatio] || aspectRatios.square
      const overlayClass = overlayStyles[value.overlayStyle] || overlayStyles.dark
      const positionClass = textPositions[value.overlayPosition] || textPositions.center
      const breakout = breakoutWidths[value.breakoutWidth] || breakoutWidths.wide
      const textColor = textColors[value.overlayStyle] || textColors.dark
      const isMasonry = value.layout === "masonry"
      
      const formatNumber = (n: number) => String(n).padStart(2, '0')
      
      return (
        <div className="my-16 md:my-24">
          {/* Title & Subtitle */}
          {(value.title || value.subtitle) && (
            <div className="mb-10 md:mb-14 text-center max-w-3xl mx-auto px-6">
              {value.title && (
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide uppercase mb-4">
                  {value.title}
                </h2>
              )}
              {value.subtitle && (
                <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed">
                  {value.subtitle}
                </p>
              )}
            </div>
          )}
          
          {/* Image Grid */}
          <div style={breakout.style}>
            <div 
              className={`
                ${isMasonry ? layoutClass : `grid ${layoutClass}`} 
                ${gapClass}
                ${breakout.wrapper}
              `}
            >
              {value.images?.map((item: any, index: number) => {
                if (!item.image?.asset) return null
                
                return (
                  <div 
                    key={item._key || index}
                    className={`
                      group relative overflow-hidden cursor-pointer
                      ${isMasonry ? 'mb-1 break-inside-avoid' : ''}
                    `}
                  >
                    {/* Image */}
                    <div className={`relative ${isMasonry ? '' : aspectClass} overflow-hidden`}>
                      <Image
                        src={urlFor(item.image).width(600).quality(100).url()}
                        alt={item.alt || ""}
                        fill={!isMasonry}
                        width={isMasonry ? 600 : undefined}
                        height={isMasonry ? 600 : undefined}
                        className={`
                          ${isMasonry ? 'w-full h-auto' : 'object-cover'}
                          transition-transform duration-500 ease-out
                          group-hover:scale-105
                        `}
                      />
                      
                      {/* Hover Overlay */}
                      <div 
                        className={`
                          absolute inset-0 flex flex-col ${positionClass}
                          ${overlayClass} ${textColor}
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-300 ease-out
                          p-4 md:p-6
                        `}
                      >
                        {/* Number Badge */}
                        {value.showNumbering && (
                          <span className="absolute top-4 left-4 text-xs tracking-widest opacity-60">
                            {formatNumber(index + 1)}
                          </span>
                        )}
                        
                        {/* Overlay Content */}
                        <div className="max-w-xs">
                          {item.overlayTitle && (
                            <h3 className="text-sm md:text-base font-medium tracking-wide uppercase mb-2">
                              {item.overlayTitle}
                            </h3>
                          )}
                          {item.overlayText && (
                            <p className="text-xs md:text-sm font-light leading-relaxed opacity-90">
                              {item.overlayText}
                            </p>
                          )}
                        </div>
                        
                        {/* Photo Credit */}
                        {item.credit && (
                          <span className="absolute bottom-3 right-3 text-[10px] tracking-wide opacity-50">
                            {item.credit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Closing Text */}
          {value.closingText && (
            <div className="mt-12 md:mt-16 max-w-2xl mx-auto px-6">
              <PortableText value={value.closingText} components={components} />
            </div>
          )}
        </div>
      )
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="text-3xl md:text-4xl font-light tracking-tight text-left mb-8 mt-28 text-gray-900">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-medium text-left mb-4 mt-16 text-gray-800">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-medium uppercase tracking-widest text-left mb-3 mt-12 text-gray-600">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="leading-[1.85] text-lg mb-8 text-left text-gray-700">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="text-center text-2xl md:text-3xl font-light italic py-12 my-20 text-gray-800 leading-snug max-w-3xl mx-auto">
        {children}
      </blockquote>
    ),
    lead: ({ children }) => (
      <p className="text-3xl md:text-4xl lg:text-5xl text-center my-16 md:my-20 mx-auto max-w-4xl text-gray-900 leading-tight font-light">
        {children}
      </p>
    ),
    small: ({ children }) => (
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        {children}
      </p>
    ),
    caption: ({ children }) => (
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
        {children}
      </p>
    ),
    dropcap: ({ children }) => (
      <p className="dropcap leading-[1.85] text-lg mb-8 text-left text-gray-700">
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    link: ({ value, children }) => {
      const target = value?.blank ? "_blank" : undefined
      const rel = value?.blank ? "noopener noreferrer" : undefined
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className="underline text-gray-600 hover:text-gray-900 transition-colors"
        >
          {children}
        </a>
      )
    },
  },
}

interface PortableTextRendererProps {
  content: any[]
}

export default function PortableTextRenderer({ content }: PortableTextRendererProps) {
  // Check if content contains viewport breakout positioned text
  const hasViewportBreakout = content?.some((block: any) => 
    block._type === 'positionedText' && 
    block.width && 
    block.width.startsWith('viewport-')
  );

  if (hasViewportBreakout) {
    // Render with special handling for viewport breakout elements
    return (
      <div className="editorial-body" style={{ maxWidth: '680px', margin: '0 auto', paddingLeft: '24px', paddingRight: '32px' }}>
        <PortableText 
          value={content} 
          components={{
            ...components,
            types: {
              ...components.types,
              positionedText: ({ value }: any) => {
                // Use the same logic as above but with proper breakout handling
                const widthClasses: Record<string, string> = {
                  narrow: "w-2/5",
                  medium: "w-3/5",
                  wide: "w-4/5",
                  full: "w-full",
                }
                
                const alignmentClasses: Record<string, string> = {
                  left: "",
                  center: "mx-auto",
                  right: "ml-auto",
                }
                
                const textAlignClasses: Record<string, string> = {
                  left: "text-left",
                  center: "text-center",
                  right: "text-right",
                }
                
                const width = value.width || "medium"
                const alignment = value.alignment || value.position || "left"
                const textAlign = value.textAlign || value.position || "left"
                
                const isViewportWidth = width.startsWith("viewport-")
                const alignClass = isViewportWidth ? "" : alignmentClasses[alignment]
                
                if (isViewportWidth) {
                  const innerWidthClasses: Record<string, string> = {
                    "viewport-wide": "max-w-[80vw]",
                    "viewport-extrawide": "max-w-[90vw]",
                    "viewport-full": "max-w-none",
                  }
                  
                  return (
                    <div className="relative my-8">
                      <div className="grid grid-cols-1">
                        <div 
                          className="col-start-1 row-start-1"
                          style={{ 
                            width: '100vw',
                            marginLeft: 'calc(-50vw + 50%)',
                            marginRight: 'calc(-50vw + 50%)'
                          }}
                        >
                          <div 
                            className={`mx-auto px-6 lg:px-8 ${textAlignClasses[textAlign]}`}
                            style={{ 
                              maxWidth: width === 'viewport-wide' ? '80vw' : 
                                       width === 'viewport-extrawide' ? '90vw' : 
                                       width === 'viewport-full' ? 'none' : '80vw'
                            }}
                          >
                            <PortableText value={value.text} components={components} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
                
                return (
                  <div className={`my-8 ${widthClasses[width] || widthClasses.medium} ${alignClass} ${textAlignClasses[textAlign]}`}>
                    <PortableText value={value.text} components={components} />
                  </div>
                )
              }
            }
          }} 
        />
      </div>
    )
  }

  return (
    <div className="editorial-body" style={{ maxWidth: '680px', margin: '0 auto', paddingLeft: '24px', paddingRight: '32px' }}>
      <PortableText value={content} components={components} />
    </div>
  )
}
