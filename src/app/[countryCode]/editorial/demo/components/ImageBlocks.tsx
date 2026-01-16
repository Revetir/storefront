"use client"

export function ImageBlocks() {
  return (
    <section id="images" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Image & Media Blocks</h2>
        <p className="text-gray-600 mb-12">Flexible image layouts and media components</p>

        {/* Image with Caption */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">imageWithCaption</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">size: "large", captionPosition: "below"</p>
              <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Full Width Image (4:3)</span>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                The designer&apos;s studio in the heart of Paris, where each collection begins its journey.
              </p>
              <p className="text-xs text-gray-400 italic mt-1">© Kevin J. Miyazaki 2024</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-gray-400 mb-4">size: "medium", alignment: "left"</p>
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Square Image</span>
                </div>
                <p className="text-sm text-gray-600 mt-3">Detail of hand-stitched embroidery.</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-4">size: "small", alignment: "right"</p>
                <div className="w-3/4 ml-auto">
                  <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Portrait</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-right">Courtesy Anna Sui</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Image */}
        <div className="mb-16 border border-gray-200 overflow-hidden">
          <p className="text-xs uppercase tracking-widest text-gray-500 p-4">fullWidthImage</p>
          
          <div className="space-y-8">
            <div>
              <p className="text-xs text-gray-400 px-4 mb-2">aspectRatio: "16:9" (Cinematic)</p>
              <div className="aspect-[16/9] bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500">Full Bleed Cinematic Image</span>
              </div>
              <p className="text-sm text-gray-600 px-4 py-3">
                Runway show finale at Paris Fashion Week. <span className="text-gray-400 italic">Photo: Jonas Gustavsson</span>
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 px-4 mb-2">With overlay text</p>
              <div className="aspect-[21/9] bg-gray-700 flex items-center justify-center relative">
                <span className="text-gray-500 absolute">Background Image</span>
                <p className="relative z-10 text-white text-4xl font-light tracking-wide">
                  SPRING / SUMMER 2026
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">imageGrid</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "twoColumn" (50/50)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Image 1</span>
                </div>
                <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Image 2</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <p className="text-xs text-gray-500">Look 01: Silk organza dress</p>
                <p className="text-xs text-gray-500">Look 02: Tailored wool coat</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "threeColumn"</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">1</span>
                </div>
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">2</span>
                </div>
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">3</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "asymmetric" (Large + Small)</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 aspect-[4/3] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Large Image</span>
                </div>
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Small 1</span>
                  </div>
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Small 2</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "masonry"</p>
              <div className="columns-3 gap-4">
                <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center mb-4 break-inside-avoid">
                  <span className="text-gray-400 text-sm">Tall</span>
                </div>
                <div className="aspect-square bg-gray-200 flex items-center justify-center mb-4 break-inside-avoid">
                  <span className="text-gray-400 text-sm">Square</span>
                </div>
                <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center mb-4 break-inside-avoid">
                  <span className="text-gray-400 text-sm">Wide</span>
                </div>
                <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center mb-4 break-inside-avoid">
                  <span className="text-gray-400 text-sm">Tall</span>
                </div>
                <div className="aspect-square bg-gray-200 flex items-center justify-center mb-4 break-inside-avoid">
                  <span className="text-gray-400 text-sm">Square</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">twoColumnGrid (Image + Text)</p>
          
          <div className="space-y-16">
            <div>
              <p className="text-xs text-gray-400 mb-4">imagePosition: "left", columnRatio: "equal"</p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Image</span>
                </div>
                <div>
                  <h4 className="text-2xl font-light mb-4">The Craft of Construction</h4>
                  <p className="text-base text-gray-600 leading-relaxed">
                    Each piece begins with a single thread. The designer&apos;s approach to construction 
                    draws from traditional tailoring techniques passed down through generations, 
                    combined with innovative new methods developed in-house.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">imagePosition: "right", columnRatio: "imageLarger"</p>
              <div className="grid md:grid-cols-5 gap-8 items-center">
                <div className="md:col-span-2">
                  <h4 className="text-2xl font-light mb-4">Material Studies</h4>
                  <p className="text-base text-gray-600 leading-relaxed">
                    The exploration of texture and weight guides every collection. 
                    Natural fibers are sourced from sustainable mills across Japan and Italy.
                  </p>
                </div>
                <div className="md:col-span-3 aspect-[4/3] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Larger Image</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">verticalAlign: "bottom"</p>
              <div className="grid md:grid-cols-2 gap-8 items-end">
                <div className="aspect-[2/3] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Tall Image</span>
                </div>
                <div className="pb-8">
                  <p className="text-sm text-gray-500 mb-2">About the Collection</p>
                  <h4 className="text-xl font-light">
                    Text aligned to the bottom of the image for visual balance.
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Numbered Gallery */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">numberedGallery</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "singleColumn", numberStyle: "padded"</p>
              <div className="space-y-8 max-w-2xl mx-auto">
                {[1, 2, 3].map((num) => (
                  <div key={num}>
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-light text-gray-300">
                        {String(num).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Look {num}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                          Model wears <span className="underline cursor-pointer">Wool Blend Coat</span> ($2,450) 
                          and <span className="underline cursor-pointer">Silk Trousers</span> ($890).
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "twoColumn" with shoppable products</p>
              <div className="grid md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center relative">
                      <span className="text-gray-400">Image {num}</span>
                      <span className="absolute top-4 left-4 text-sm font-medium">
                        {String(num).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Featured In This Image
                      </p>
                      <p className="text-sm">
                        <a href="#" className="underline hover:text-gray-600">Cashmere Sweater</a> • 
                        <a href="#" className="underline hover:text-gray-600 ml-1">Leather Belt</a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Video Embed */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">videoEmbed</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">videoType: "youtube", layout: "fullWidth"</p>
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                  </div>
                  <span className="text-gray-400">YouTube Video Embed</span>
                </div>
                <button className="absolute bottom-4 right-4 bg-white text-black px-3 py-1 text-sm font-medium">
                  UNMUTE
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3">Behind the scenes: Making of the Spring Collection</p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">videoType: "file", autoplay: true, loop: true</p>
              <div className="aspect-[21/9] bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500">Looping Video (muted, autoplay)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">spacer</p>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4">
              <p className="text-xs text-gray-400 mb-2">type: "space", size: "large"</p>
              <div className="h-24 border border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Large empty space (96px)</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4">
              <p className="text-xs text-gray-400 mb-4">type: "line"</p>
              <div className="py-8">
                <hr className="border-t border-gray-300" />
              </div>
            </div>

            <div className="bg-gray-50 p-4">
              <p className="text-xs text-gray-400 mb-4">type: "dots"</p>
              <div className="py-8 text-center">
                <span className="text-2xl tracking-[1em] text-gray-400">• • •</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4">
              <p className="text-xs text-gray-400 mb-4">type: "decorative"</p>
              <div className="py-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-400">✦</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
