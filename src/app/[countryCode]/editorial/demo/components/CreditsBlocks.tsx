"use client"

export function CreditsBlocks() {
  return (
    <section id="credits" className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Credits & Attribution Blocks</h2>
        <p className="text-gray-600 mb-12">Author bios, production credits, and attribution components</p>

        {/* Author Bio */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">authorBio</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">Standard author bio with photo</p>
              <div className="max-w-2xl mx-auto flex gap-6 items-start">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Photo</span>
                </div>
                <div>
                  <p className="font-medium">Emma Wilson</p>
                  <p className="text-sm text-gray-500 mb-2">Contributing Writer</p>
                  <p className="text-sm text-gray-600 italic">
                    Emma Wilson is a fashion journalist based in New York. Her work has appeared in 
                    Vogue, The New York Times, and Harper&apos;s Bazaar. She covers the intersection of 
                    fashion, culture, and sustainability.
                  </p>
                  <div className="flex gap-4 mt-3">
                    <a href="#" className="text-sm text-gray-500 hover:text-black">Twitter</a>
                    <a href="#" className="text-sm text-gray-500 hover:text-black">Instagram</a>
                    <a href="#" className="text-sm text-gray-500 hover:text-black">Website</a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">Minimal author bio (no photo)</p>
              <div className="max-w-2xl mx-auto border-t pt-6">
                <p className="text-sm text-gray-600 italic">
                  <span className="font-medium not-italic">Alex Rivera</span> is a culture writer 
                  whose work explores the boundaries between art, fashion, and technology. 
                  Follow him on <a href="#" className="underline">Instagram</a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Credits Block */}
        <div className="mb-16 border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">creditsBlock</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "list" (Standard stacked credits)</p>
              <div className="max-w-md">
                <p className="text-sm uppercase tracking-widest text-gray-500 mb-6">Credits</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Photography</span>
                    <span className="text-sm">Adam Powell</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Styling</span>
                    <span className="text-sm">Sarah Kim</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Hair</span>
                    <span className="text-sm">Marcus Johnson</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Makeup</span>
                    <span className="text-sm">Maria Garcia</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Production</span>
                    <span className="text-sm">Studio XYZ</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "twoColumn" (Extended production credits)</p>
              <div className="border-t border-b border-gray-200 py-8">
                <p className="text-sm uppercase tracking-widest text-gray-500 mb-6 text-center">Production Credits</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Photography</p>
                    <p className="text-sm">Jonas Gustavsson</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Creative Direction</p>
                    <p className="text-sm">Marie Duval</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Styling</p>
                    <p className="text-sm">Robbie Spencer</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Hair</p>
                    <p className="text-sm">Shay Ashual at Art Partner</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Makeup</p>
                    <p className="text-sm">Yadim at Art Partner</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Manicurist</p>
                    <p className="text-sm">Megumi Yamamoto</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Set Design</p>
                    <p className="text-sm">Gerard Santos</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Casting</p>
                    <p className="text-sm">Piergiorgio Del Moro</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Production</p>
                    <p className="text-sm">North Six</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Photo Assistants</p>
                    <p className="text-sm">James Park, Sofia Martinez</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Styling Assistants</p>
                    <p className="text-sm">Tom Williams, Sarah Park</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Digital Technician</p>
                    <p className="text-sm">James Morrison</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "inline"</p>
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-sm text-gray-600">
                  Photography by <span className="font-medium">Adam Powell</span> • 
                  Styling by <span className="font-medium">Sarah Kim</span> • 
                  Hair by <span className="font-medium">Marcus Johnson</span> • 
                  Makeup by <span className="font-medium">Maria Garcia</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Article Footer Example */}
        <div className="border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">Complete Article Footer Example</p>
          
          <div className="max-w-2xl mx-auto space-y-12">
            {/* Author Bio */}
            <div className="border-t pt-8">
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div>
                  <p className="font-medium">Written by Emma Wilson</p>
                  <p className="text-sm text-gray-600 italic mt-1">
                    Emma is a contributing writer covering fashion and culture.
                  </p>
                </div>
              </div>
            </div>

            {/* Credits */}
            <div className="border-t pt-8">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Credits</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Photography:</span>{" "}
                  <span>Adam Powell</span>
                </div>
                <div>
                  <span className="text-gray-500">Styling:</span>{" "}
                  <span>Sarah Kim</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="border-t pt-8">
              <div className="flex flex-wrap gap-2">
                {["Fashion", "Interview", "Spring 2026", "Designer Profile"].map((tag) => (
                  <span key={tag} className="text-xs uppercase tracking-wider px-3 py-1 border border-gray-300 hover:border-black cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="border-t pt-8">
              <div className="flex items-center justify-center gap-6">
                <span className="text-sm text-gray-500">Share</span>
                <button className="text-sm hover:underline">Facebook</button>
                <button className="text-sm hover:underline">Twitter</button>
                <button className="text-sm hover:underline">Pinterest</button>
                <button className="text-sm hover:underline">Copy Link</button>
              </div>
            </div>

            {/* Related Stories */}
            <div className="border-t pt-8">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-6">Related Stories</p>
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((num) => (
                  <div key={num} className="group cursor-pointer">
                    <div className="aspect-[4/3] bg-gray-200 mb-3 group-hover:bg-gray-300 transition-colors flex items-center justify-center">
                      <span className="text-gray-400">Related {num}</span>
                    </div>
                    <p className="text-xs text-gray-500 uppercase">Culture</p>
                    <p className="font-medium group-hover:underline">Related Article Title Here</p>
                    <p className="text-sm text-gray-500 mt-1">January 5, 2026</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Story */}
            <div className="border-t pt-8">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Next Story</p>
              <div className="group cursor-pointer">
                <h4 className="text-3xl font-light group-hover:underline">
                  The Future of Sustainable Fashion
                </h4>
                <p className="text-gray-600 mt-2">
                  How emerging designers are reimagining luxury for a new generation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
