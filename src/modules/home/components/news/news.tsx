import React from "react"
import Image from "next/image"
import Link from "next/link"

const NewsSection = () => {
  return (
    <section className="w-full px-6 md:px-12 lg:px-24 py-12 space-y-20">
      {/* Bottom row: 3 vertical images */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="https://wwd.com/runway/spring-2026/milan/mm6-maison-martin-margiela/review/" className="block">
          <div className="w-full">
            <div className="w-full h-[400px] relative mb-4">
              <Image
                src="/images/margiela_ballerina_shoes.jpeg"
                alt="MM6 Maison Margiela Taking It to the Streets News Article"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                className="rounded-md object-cover"
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">MM6 Maison Margiela: Taking It to the Streets</h3>
              <p className="text-sm text-gray-600">October 1, 2025</p>
            </div>
          </div>
        </Link>
        <Link href="https://www.bbc.com/news/articles/cy4ydxlm9n9o" className="block">
          <div className="w-full">
            <div className="w-full h-[400px] relative mb-4">
              <Image
                src="/images/labubu_hermes_bag_charm.png"
                alt="How Labubu Conquered Fashion News Article"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                className="rounded-md object-cover"
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">Labubu: How the Pop Mart dolls conquered the world</h3>
              <p className="text-sm text-gray-600">September 27, 2025</p>
            </div>
          </div>
        </Link>
        <Link href="https://medium.com/trill-mag/the-end-of-an-era-demnas-last-balenciaga-show-010d75cca738" className="block">
          <div className="w-full">
            <div className="w-full h-[400px] relative mb-4">
              <Image
                src="/images/demna_final_show_goodbye.png"
                alt="Demna Leaves Balenciaga News Article"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                className="rounded-md object-cover"
              />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold mb-2">The End Of An Era: Demna's Last Balenciaga Show</h3>
              <p className="text-sm text-gray-600">August 7, 2025</p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}

export default NewsSection 