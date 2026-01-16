"use client"

import { HeroSection } from "./components/HeroSection"
import { TextBlocks } from "./components/TextBlocks"
import { ImageBlocks } from "./components/ImageBlocks"
import { InteractiveBlocks } from "./components/InteractiveBlocks"
import { CreditsBlocks } from "./components/CreditsBlocks"

export default function EditorialDemoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-black text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest mb-4">Editorial Schema Demo</p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
            Content Block Showcase
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            This page demonstrates all 17 content block types available in the Sanity CMS editorial schema. 
            Each section shows how the block renders with placeholder content.
          </p>
        </div>
      </div>

      {/* Table of Contents */}
      <nav className="border-b border-gray-200 py-8 px-4 sticky top-0 bg-white z-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <a href="#hero" className="hover:underline">Hero Layouts</a>
            <span className="text-gray-300">|</span>
            <a href="#text" className="hover:underline">Text Blocks</a>
            <span className="text-gray-300">|</span>
            <a href="#images" className="hover:underline">Image Blocks</a>
            <span className="text-gray-300">|</span>
            <a href="#interactive" className="hover:underline">Interactive</a>
            <span className="text-gray-300">|</span>
            <a href="#credits" className="hover:underline">Credits</a>
          </div>
        </div>
      </nav>

      {/* Demo Sections */}
      <HeroSection />
      <TextBlocks />
      <ImageBlocks />
      <InteractiveBlocks />
      <CreditsBlocks />

      {/* Footer */}
      <div className="bg-gray-100 py-16 px-4 text-center">
        <p className="text-sm text-gray-600">
          End of Editorial Content Block Demo
        </p>
        <p className="text-xs text-gray-400 mt-2">
          17 content block types • 8 hero layouts • 5 title styles
        </p>
      </div>
    </div>
  )
}
