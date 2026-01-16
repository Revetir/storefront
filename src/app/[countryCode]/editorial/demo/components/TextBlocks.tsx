"use client"

export function TextBlocks() {
  return (
    <section id="text" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Text & Typography Blocks</h2>
        <p className="text-gray-600 mb-12">Rich text formatting and specialized text components</p>

        {/* Standard Block Styles */}
        <div className="mb-16 bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">Block Styles (Portable Text)</p>
          
          <div className="max-w-2xl mx-auto space-y-8">
            <div>
              <p className="text-xs text-gray-400 mb-2">style: "lead" (Intro Paragraph)</p>
              <p className="text-xl md:text-2xl font-serif italic leading-relaxed">
                The qualities that tend to make a great fashion critic are, by their nature, difficult to define. 
                There is an ineffable quality to the best writing about clothes—a sense of poetry mixed with 
                precision, history balanced against the urgency of the present moment.
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">style: "normal" (Body Text)</p>
              <p className="text-base md:text-lg leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut 
                labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco 
                laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in 
                voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">style: "small"</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                This is smaller text used for secondary information, footnotes, or supporting content that 
                doesn&apos;t need the same visual prominence as the main body text.
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">style: "caption"</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Caption text for images or figures • Photo by Example Photographer
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">style: "dropcap"</p>
              <p className="text-base leading-relaxed">
                <span className="float-left text-6xl font-serif leading-none mr-3 mt-1">T</span>
                he first letter of this paragraph is styled as a dropcap, a classic editorial technique 
                that draws the reader&apos;s eye to the beginning of an article or new section. This style 
                is commonly used in magazines and literary publications.
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">style: "blockquote"</p>
              <blockquote className="border-l-4 border-gray-300 pl-6 py-2 italic text-gray-700">
                &ldquo;Fashion is not something that exists in dresses only. Fashion is in the sky, in the street, 
                fashion has to do with ideas, the way we live, what is happening.&rdquo;
                <footer className="text-sm text-gray-500 mt-2 not-italic">— Coco Chanel</footer>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Positioned Text Block */}
        <div className="mb-16 bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">positionedText</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">position: "left", width: "narrow" (40%)</p>
              <div className="w-2/5">
                <p className="text-base leading-relaxed">
                  This text block is positioned to the left and takes up only 40% of the container width, 
                  creating an asymmetric layout that adds visual interest to the page.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">position: "right", width: "medium" (60%)</p>
              <div className="w-3/5 ml-auto text-right">
                <p className="text-base leading-relaxed">
                  Right-aligned text with medium width. This creates a distinctive layout that can be used 
                  to break up the monotony of centered content and guide the reader&apos;s eye across the page.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">position: "center", width: "wide" (80%)</p>
              <div className="w-4/5 mx-auto text-center">
                <p className="text-lg leading-relaxed">
                  Centered text with wide width is ideal for important statements or transitional paragraphs 
                  that deserve extra emphasis without going full-width.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pull Quote */}
        <div className="mb-16 bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">pullQuote</p>
          
          <div className="space-y-16">
            <div>
              <p className="text-xs text-gray-400 mb-4">style: "largeCentered"</p>
              <div className="text-center py-8">
                <p className="text-3xl md:text-4xl font-serif italic leading-relaxed max-w-3xl mx-auto">
                  &ldquo;The future of fashion lies not in what we wear, but in how we choose to express ourselves 
                  through the act of dressing.&rdquo;
                </p>
                <p className="text-sm text-gray-500 mt-4">— Designer Name</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">style: "oversized"</p>
              <div className="py-8">
                <p className="text-4xl md:text-6xl font-light leading-tight tracking-tight">
                  &ldquo;Less is more.&rdquo;
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">style: "withBorder"</p>
              <div className="border-t-2 border-b-2 border-black py-8 my-8">
                <p className="text-2xl font-serif italic text-center">
                  &ldquo;Elegance is refusal.&rdquo;
                </p>
                <p className="text-sm text-gray-500 text-center mt-3">— Coco Chanel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attributed Quote */}
        <div className="mb-16 bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">attributedQuote</p>
          
          <div className="max-w-2xl mx-auto space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">style: "pullQuote"</p>
              <div className="text-center">
                <p className="text-2xl font-serif italic mb-4">
                  &ldquo;I want to make clothes that people actually want to wear, not just look at.&rdquo;
                </p>
                <p className="text-sm font-medium">— Marcus Reed</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">style: "blockQuote"</p>
              <div className="pl-6 border-l-2 border-gray-300">
                <p className="text-lg italic text-gray-700 mb-2">
                  &ldquo;The garment becomes a vessel for emotion, a physical manifestation of an internal state.&rdquo;
                </p>
                <p className="text-sm text-gray-500">— Interview excerpt, 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bilingual Text */}
        <div className="mb-16 bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">bilingualText</p>
          
          <div className="space-y-12">
            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "sideBySide" (English / Korean)</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">EN</p>
                  <p className="text-base leading-relaxed">
                    The designer&apos;s approach to materiality is deeply rooted in traditional craftsmanship, 
                    yet forward-looking in its application. Each piece tells a story of heritage reimagined.
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">KO</p>
                  <p className="text-base leading-relaxed">
                    디자이너의 소재에 대한 접근 방식은 전통적인 장인 정신에 깊이 뿌리를 두고 있지만, 
                    그 적용에 있어서는 미래 지향적입니다. 각 작품은 재해석된 유산의 이야기를 전합니다.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">layout: "stacked" (Japanese)</p>
              <div className="max-w-2xl">
                <p className="text-base leading-relaxed mb-4">
                  The concept of &ldquo;ma&rdquo;—negative space—permeates every aspect of the collection.
                </p>
                <p className="text-base leading-relaxed text-gray-600">
                  「間」のコンセプト—ネガティブスペース—がコレクションのあらゆる側面に浸透しています。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Callout */}
        <div className="mb-16 bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">callout</p>
          
          <div className="space-y-8 max-w-2xl mx-auto">
            <div>
              <p className="text-xs text-gray-400 mb-4">style: "note"</p>
              <div className="bg-gray-100 border-l-4 border-gray-400 p-6">
                <p className="font-medium mb-2">Editor&apos;s Note</p>
                <p className="text-sm text-gray-700">
                  This interview was conducted in March 2024 at the designer&apos;s studio in Paris. 
                  Some responses have been edited for clarity.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">style: "featured"</p>
              <div className="bg-black text-white p-8">
                <p className="text-lg font-medium mb-2">Key Takeaway</p>
                <p className="text-gray-300">
                  The collection represents a fundamental shift in how we think about sustainable luxury—
                  proving that ethical production and exceptional design are not mutually exclusive.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-4">style: "quoteCard"</p>
              <div className="bg-cream border border-gray-200 p-8 text-center" style={{backgroundColor: '#FFFDF5'}}>
                <p className="text-2xl font-serif italic mb-4">
                  &ldquo;Sustainability is not a trend—it&apos;s the future.&rdquo;
                </p>
                <p className="text-sm text-gray-600">Featured in Vogue, September 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Text Decorators */}
        <div className="bg-white border border-gray-200 p-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-8">Text Marks & Decorators</p>
          
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-base leading-relaxed">
              <strong>Bold text</strong> for emphasis, <em>italic text</em> for titles and foreign words, 
              <span className="underline">underlined text</span> for links, 
              <span className="line-through">strikethrough</span> for corrections, 
              <code className="bg-gray-100 px-1 py-0.5 text-sm font-mono">inline code</code> for technical terms, and 
              <mark className="bg-yellow-200 px-1">highlighted text</mark> for key phrases.
            </p>
            
            <p className="text-base leading-relaxed">
              Example with <a href="#" className="underline hover:text-gray-600">external link</a>, 
              an <a href="#" className="text-blue-600 underline">internal link</a> to another article, 
              and a footnote reference<sup className="text-blue-600 cursor-pointer">1</sup>.
            </p>

            <div className="border-t pt-4 mt-8">
              <p className="text-xs text-gray-500">
                <sup>1</sup> This is a footnote with additional context or citation information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
