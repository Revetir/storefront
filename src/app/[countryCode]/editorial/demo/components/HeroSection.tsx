"use client"

export function HeroSection() {
  return (
    <section id="hero" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Hero Layout Options</h2>
        <p className="text-gray-600 mb-12">8 different hero layouts for article headers</p>

        {/* Standard Hero */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">heroLayout: "standard"</p>
          <div className="aspect-[16/9] bg-gray-200 mb-6 flex items-center justify-center">
            <span className="text-gray-400">Hero Image (16:9)</span>
          </div>
          <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Culture</p>
          <h3 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
            The Art of Modern Editorial Design
          </h3>
          <p className="text-xl text-gray-600 italic max-w-2xl">
            A deep dive into the visual language of contemporary fashion publishing
          </p>
          <p className="text-sm text-gray-500 mt-4">By Jane Doe • January 8, 2026</p>
        </div>

        {/* Split Hero */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">heroLayout: "split" (text left)</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center">
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">Interview</p>
              <h3 className="text-4xl md:text-5xl font-light tracking-tight mb-4">
                Inner Echo
              </h3>
              <p className="text-lg text-gray-600 italic mb-6">
                In conversation with the designer reshaping contemporary menswear
              </p>
              <p className="text-sm text-gray-500">By David Park • Photography by Sarah Kim</p>
            </div>
            <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Portrait Image (3:4)</span>
            </div>
          </div>
        </div>

        {/* Oversized Title */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">heroLayout: "oversized"</p>
          <h3 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-tighter leading-none mb-6">
            ABOUT<br />MUSEUM
          </h3>
          <p className="text-xl text-gray-600 max-w-xl">
            Exploring the intersection of fashion and fine art in museum exhibitions
          </p>
        </div>

        {/* Full Bleed */}
        <div className="mb-16 border border-gray-200 overflow-hidden">
          <p className="text-xs uppercase tracking-widest text-gray-500 p-4">heroLayout: "fullBleed"</p>
          <div className="aspect-[21/9] bg-gray-800 flex items-center justify-center relative">
            <span className="text-gray-500">Full Bleed Image (21:9)</span>
          </div>
        </div>

        {/* Text Overlay */}
        <div className="mb-16 border border-gray-200 overflow-hidden">
          <p className="text-xs uppercase tracking-widest text-gray-500 p-4">heroLayout: "overlay"</p>
          <div className="aspect-[16/9] bg-gray-800 flex items-center justify-center relative">
            <span className="text-gray-600 absolute">Background Image</span>
            <div className="relative z-10 text-center text-white">
              <p className="text-sm uppercase tracking-widest mb-2">Fashion</p>
              <h3 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
                Spring Collection 2026
              </h3>
              <p className="text-lg opacity-80">The season&apos;s most anticipated looks</p>
            </div>
          </div>
        </div>

        {/* Black Background */}
        <div className="mb-16 border border-gray-200 overflow-hidden">
          <p className="text-xs uppercase tracking-widest text-gray-500 p-4">heroLayout: "blackBackground"</p>
          <div className="bg-black text-white py-24 px-8 text-center">
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-4">Profile</p>
            <h3 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
              The Visionary
            </h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              How one designer is redefining luxury for a new generation
            </p>
          </div>
        </div>

        {/* Minimal */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">heroLayout: "minimal"</p>
          <div className="max-w-2xl mx-auto text-center py-12">
            <h3 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
              Notes on Craft
            </h3>
            <p className="text-gray-600">By Emma Wilson</p>
          </div>
        </div>

        {/* Immersive */}
        <div className="mb-16 border border-gray-200 overflow-hidden">
          <p className="text-xs uppercase tracking-widest text-gray-500 p-4">heroLayout: "immersive"</p>
          <div className="h-[80vh] bg-gradient-to-b from-gray-900 to-gray-700 flex items-center justify-center relative">
            <span className="text-gray-500 absolute top-1/3">Full Screen Video/Image Background</span>
            <div className="relative z-10 text-center text-white">
              <h3 className="text-6xl md:text-8xl font-light tracking-tight mb-6">
                HIDEO KOJIMA
              </h3>
              <p className="text-2xl font-light tracking-widest">THE CREATOR</p>
            </div>
          </div>
        </div>

        {/* Title Style Variations */}
        <div className="border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">Title Style Variations</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-2">titleStyle: "normal"</p>
              <h4 className="text-4xl font-light">Standard Editorial Title</h4>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 mb-2">titleStyle: "oversized"</p>
              <h4 className="text-7xl font-light tracking-tighter">OVERSIZED</h4>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 mb-2">titleStyle: "splitLines"</p>
              <h4 className="text-5xl font-light leading-tight">
                <span className="block">FIRST LINE</span>
                <span className="block text-gray-400">SECOND LINE</span>
              </h4>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 mb-2">titleStyle: "stacked"</p>
              <h4 className="text-3xl font-light">
                <span className="block">The</span>
                <span className="block text-5xl">COLLECTION</span>
                <span className="block">Preview</span>
              </h4>
            </div>
            
            <div>
              <p className="text-xs text-gray-400 mb-2">titleStyle: "allCaps"</p>
              <h4 className="text-4xl font-medium uppercase tracking-widest">ALL CAPS TITLE</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
