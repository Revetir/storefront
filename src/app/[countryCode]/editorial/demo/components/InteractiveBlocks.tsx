"use client"

import { useState } from "react"

export function InteractiveBlocks() {
  const [openAccordion, setOpenAccordion] = useState<string | null>("A")

  return (
    <section id="interactive" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Interactive & Structural Blocks</h2>
        <p className="text-gray-600 mb-12">Accordion, interview, and product showcase components</p>

        {/* Accordion */}
        <div className="mb-16 bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">accordion</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">style: "azIndex" (A-Z Glossary)</p>
              <div className="border-t border-gray-200">
                {["A", "B", "C"].map((letter) => (
                  <div key={letter} className="border-b border-gray-200">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === letter ? null : letter)}
                      className="w-full flex items-center justify-between py-6 text-left"
                    >
                      <span className="text-4xl font-light">{letter}</span>
                      <span className="text-sm uppercase tracking-wider">
                        {openAccordion === letter ? "Close" : "Expand"}
                      </span>
                    </button>
                    {openAccordion === letter && (
                      <div className="pb-8">
                        <p className="text-xl font-serif italic mb-6">
                          &ldquo;Opening quote for this section that sets the tone.&rdquo;
                        </p>
                        <p className="text-base text-gray-600 leading-relaxed mb-4">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
                          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                        </p>
                        <div className="aspect-[16/9] bg-gray-200 flex items-center justify-center mt-6">
                          <span className="text-gray-400">Section Image</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">style: "faq"</p>
              <div className="space-y-4 max-w-2xl">
                {[
                  "What materials are used in the collection?",
                  "How should I care for these garments?",
                  "What is your return policy?"
                ].map((question, i) => (
                  <div key={i} className="border border-gray-200">
                    <button className="w-full flex items-center justify-between p-4 text-left">
                      <span className="font-medium">{question}</span>
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">style: "chapters"</p>
              <div className="space-y-2">
                {[
                  { num: "01", title: "The Beginning" },
                  { num: "02", title: "The Journey" },
                  { num: "03", title: "The Destination" }
                ].map((chapter) => (
                  <div key={chapter.num} className="border-l-2 border-gray-300 pl-6 py-4 hover:border-black cursor-pointer">
                    <span className="text-sm text-gray-400 block">{chapter.num}</span>
                    <span className="text-xl font-light">{chapter.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interview */}
        <div className="mb-16 bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">interview</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">style: "boldNames"</p>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex gap-4">
                  <p className="text-sm font-bold uppercase w-20 flex-shrink-0">MODA</p>
                  <p className="text-base leading-relaxed">
                    Your work often references historical garments. How do you approach research 
                    for a new collection?
                  </p>
                </div>
                <div className="flex gap-4">
                  <p className="text-sm font-bold uppercase w-20 flex-shrink-0">MR</p>
                  <p className="text-base leading-relaxed">
                    I spend a lot of time in museums and archives. There&apos;s something about seeing 
                    the actual garments—the way fabric has aged, the construction techniques that 
                    were used. It&apos;s a dialogue with the past.
                  </p>
                </div>
                <div className="flex gap-4">
                  <p className="text-sm font-bold uppercase w-20 flex-shrink-0">MODA</p>
                  <p className="text-base leading-relaxed">
                    <span className="italic text-gray-500">[We&apos;re looking at a rack of samples]</span> 
                    {" "}These textures are remarkable. Can you tell us about the fabrics?
                  </p>
                </div>
                <div className="flex gap-4">
                  <p className="text-sm font-bold uppercase w-20 flex-shrink-0">MR</p>
                  <p className="text-base leading-relaxed">
                    Each fabric tells a story. This one here is woven by a family in Kyoto who 
                    have been making textiles for six generations. You can feel the weight of 
                    that history in your hands.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">style: "alternating" (with visual distinction)</p>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-gray-50 p-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">Interviewer</p>
                  <p className="text-base leading-relaxed">
                    What does the future of fashion look like to you?
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">Designer</p>
                  <p className="text-base leading-relaxed">
                    I hope for a future where quality matters more than quantity. Where people 
                    invest in pieces that will last, that tell a story, that become part of their 
                    lives rather than disposable items.
                  </p>
                </div>
                <div className="bg-gray-50 p-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">Interviewer</p>
                  <p className="text-base leading-relaxed">
                    And your role in that future?
                  </p>
                </div>
                <div className="p-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">Designer</p>
                  <p className="text-base leading-relaxed">
                    To keep making things that matter. To honor the craft while pushing it forward. 
                    It&apos;s a balance, but one worth striving for.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Feature */}
        <div className="mb-16 bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">productFeature</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "grid"</p>
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-6">Featured Products</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num} className="group cursor-pointer">
                    <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                      <span className="text-gray-400">Product {num}</span>
                    </div>
                    <p className="text-xs text-gray-500 uppercase">Brand Name</p>
                    <p className="text-sm font-medium">Product Title</p>
                    <p className="text-sm text-gray-600">$1,290</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "horizontalScroll"</p>
              <p className="text-sm uppercase tracking-widest text-gray-500 mb-6">Shop The Look</p>
              <div className="flex gap-6 overflow-x-auto pb-4">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="flex-shrink-0 w-48">
                    <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center mb-3">
                      <span className="text-gray-400">{num}</span>
                    </div>
                    <p className="text-xs text-gray-500 uppercase">Designer</p>
                    <p className="text-sm font-medium truncate">Long Product Name Here</p>
                    <p className="text-sm text-gray-600">$890</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "featuredSingle"</p>
              <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">Featured Product Image</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Maison Margiela</p>
                  <h4 className="text-2xl font-light mb-4">Tabi Leather Boots</h4>
                  <p className="text-gray-600 mb-4">
                    The iconic split-toe boot that has become a symbol of avant-garde fashion. 
                    Crafted in Italy from premium calfskin leather with a 5cm heel.
                  </p>
                  <p className="text-xl font-medium mb-6">$1,450</p>
                  <button className="bg-black text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-gray-800">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "list"</p>
              <div className="max-w-2xl mx-auto divide-y divide-gray-200">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="flex gap-6 py-6">
                    <div className="w-24 h-24 bg-gray-100 flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">{num}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase">Brand Name</p>
                      <p className="font-medium">Product Title Goes Here</p>
                      <p className="text-sm text-gray-600">$750</p>
                    </div>
                    <div>
                      <button className="text-sm underline">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
